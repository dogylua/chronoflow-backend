import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Device, DeviceAuth, QRCodeAuth } from "../models/device.model";
import { User } from "../../users/models/user.model";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../../../core/error/app-error";
import { RegisterDto } from "../dto/register.dto";
import { LoginDto } from "../dto/login.dto";
import { RegisterDeviceDto } from "../dto/register-device.dto";
import { QrAuthDto } from "../dto/qr-auth.dto";
import { AuthResponseDto } from "../dto/auth-response.dto";
import { DeviceAuthResponseDto } from "../dto/device-auth-response.dto";
import { DeviceType } from "../models/device.model";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(DeviceAuth)
    private readonly deviceAuthRepository: Repository<DeviceAuth>,
    @InjectRepository(QRCodeAuth)
    private readonly qrCodeAuthRepository: Repository<QRCodeAuth>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new ConflictException("Email already registered");
      }

      const user = await this.userRepository.save({
        email: registerDto.email,
        passwordHash: await this.hashPassword(registerDto.password),
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: "user",
        isVerified: true,
      });

      return this.generateAuthResponse(user);
    } catch (error) {
      this.logger.error(
        `Error registering user: ${error.message}`,
        error.stack
      );
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to register user", 500);
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: loginDto.email },
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      const isPasswordValid = await this.verifyPassword(
        loginDto.password,
        user.passwordHash
      );

      if (!isPasswordValid) {
        throw new BadRequestException("Invalid credentials");
      }

      return this.generateAuthResponse(user);
    } catch (error) {
      this.logger.error(`Error logging in user: ${error.message}`, error.stack);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to login user", 500);
    }
  }

  async registerDevice(
    registerDeviceDto: RegisterDeviceDto
  ): Promise<DeviceAuthResponseDto> {
    try {
      const device = await this.deviceRepository.save({
        deviceId: registerDeviceDto.deviceId,
        deviceName: registerDeviceDto.deviceName,
        deviceType: registerDeviceDto.deviceType || DeviceType.MOBILE,
        os: registerDeviceDto.os,
        model: registerDeviceDto.model,
        userId: registerDeviceDto.userId,
        isPrimary: !registerDeviceDto.userId,
      });

      const deviceToken = await this.generateDeviceToken(device.id);

      return {
        deviceToken,
        device: {
          id: device.id,
          name: device.deviceName,
          type: device.deviceType,
        },
        status: registerDeviceDto.userId ? "authenticated" : "pending",
      };
    } catch (error) {
      this.logger.error(
        `Error registering device: ${error.message}`,
        error.stack
      );
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to register device", 500);
    }
  }

  async generateQRCode(
    userId: string,
    deviceId: string
  ): Promise<DeviceAuthResponseDto> {
    try {
      const code = uuidv4();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);

      await this.qrCodeAuthRepository.save({
        userId,
        deviceId,
        code,
        expiresAt,
        isUsed: false,
      });

      const device = await this.deviceRepository.findOne({
        where: { id: deviceId },
      });

      return {
        deviceToken: code,
        qrCode: code,
        device: {
          id: device.id,
          name: device.deviceName,
          type: device.deviceType,
        },
        status: "pending",
      };
    } catch (error) {
      this.logger.error(
        `Error generating QR code: ${error.message}`,
        error.stack
      );
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to generate QR code", 500);
    }
  }

  async authenticateWithQRCode(qrAuthDto: QrAuthDto): Promise<AuthResponseDto> {
    try {
      const qrCodeAuth = await this.qrCodeAuthRepository.findOne({
        where: { code: qrAuthDto.qrToken, isUsed: false },
        relations: ["user"],
      });

      if (!qrCodeAuth || qrCodeAuth.expiresAt < new Date()) {
        throw new BadRequestException("Invalid or expired QR code");
      }

      const device = await this.deviceRepository.save({
        userId: qrAuthDto.userId,
        deviceId: qrAuthDto.deviceId,
        isPrimary: false,
      });

      await this.qrCodeAuthRepository.update(qrCodeAuth.id, { isUsed: true });

      return this.generateAuthResponse(qrCodeAuth.user);
    } catch (error) {
      this.logger.error(
        `Error authenticating with QR code: ${error.message}`,
        error.stack
      );
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to authenticate with QR code", 500);
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const deviceAuth = await this.deviceAuthRepository.findOne({
        where: { refreshToken },
        relations: ["device", "device.user"],
      });

      if (!deviceAuth || deviceAuth.expiresAt < new Date()) {
        throw new BadRequestException("Invalid or expired refresh token");
      }

      return this.generateAuthResponse(deviceAuth.device.user);
    } catch (error) {
      this.logger.error(
        `Error refreshing token: ${error.message}`,
        error.stack
      );
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to refresh token", 500);
    }
  }

  async checkDevice(deviceId: string): Promise<DeviceAuthResponseDto> {
    try {
      const device = await this.deviceRepository.findOne({
        where: { deviceId },
      });

      if (!device) {
        return {
          deviceToken: null,
          device: null,
          status: "pending",
        };
      }

      const deviceToken = await this.generateDeviceToken(device.id);

      return {
        deviceToken,
        device: {
          id: device.id,
          name: device.deviceName,
          type: device.deviceType,
        },
        status: device.userId ? "authenticated" : "pending",
      };
    } catch (error) {
      this.logger.error(`Error checking device: ${error.message}`, error.stack);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to check device", 500);
    }
  }

  private async generateAuthResponse(user: User): Promise<AuthResponseDto> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { userId: user.id },
        {
          secret: this.configService.get<string>("JWT_SECRET"),
          expiresIn: this.configService.get<string>("JWT_ACCESS_EXPIRATION"),
        }
      ),
      this.jwtService.signAsync(
        { userId: user.id },
        {
          secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
          expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRATION"),
        }
      ),
    ]);

    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn: parseInt(
        this.configService.get<string>("JWT_ACCESS_EXPIRATION")
      ),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  private async generateDeviceToken(deviceId: string): Promise<string> {
    return this.jwtService.signAsync(
      { deviceId },
      {
        secret: this.configService.get<string>("JWT_DEVICE_SECRET"),
        expiresIn: this.configService.get<string>("JWT_DEVICE_EXPIRATION"),
      }
    );
  }

  private async hashPassword(password: string): Promise<string> {
    // Implement password hashing (e.g., using bcrypt)
    return password; // Replace with actual hashing
  }

  private async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    // Implement password verification (e.g., using bcrypt)
    return password === hash; // Replace with actual verification
  }
}
