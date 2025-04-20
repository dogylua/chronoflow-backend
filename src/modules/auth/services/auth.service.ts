import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  Device,
  DeviceInfo,
  LocationInfo,
  CreateDeviceDTO,
  CreateQRCodeAuthDTO,
} from "../models/device.model";
import { DeviceAuth } from "../models/device.model";
import { QRCodeAuth } from "../models/device.model";
import { User } from "../../users/models/user.model";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../../../core/error/app-error";

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

  async checkDeviceRegistration(
    deviceInfo: DeviceInfo
  ): Promise<{ isRegistered: boolean; deviceId?: string }> {
    try {
      if (!deviceInfo?.identifierForVendor) {
        throw new BadRequestException("Invalid device information");
      }

      const device = await this.deviceRepository.findOne({
        where: {
          deviceInfo: {
            identifierForVendor: deviceInfo.identifierForVendor,
          },
        },
        relations: ["user"],
      });

      if (device) {
        this.logger.log(`Updating device information for device ${device.id}`);
        await this.deviceRepository.update(device.id, {
          deviceInfo,
          lastActiveAt: new Date(),
        });
      }

      return {
        isRegistered: !!device,
        deviceId: device?.id,
      };
    } catch (error) {
      this.logger.error(
        `Error checking device registration: ${error.message}`,
        error.stack
      );
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to check device registration", 500);
    }
  }

  async registerDevice(
    deviceInfo: DeviceInfo,
    locationInfo: LocationInfo
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      if (!deviceInfo?.identifierForVendor) {
        throw new BadRequestException("Invalid device information");
      }

      const { isRegistered, deviceId } =
        await this.checkDeviceRegistration(deviceInfo);

      if (isRegistered && deviceId) {
        this.logger.log(
          `Device ${deviceId} already registered, generating new tokens`
        );
        const device = await this.deviceRepository.findOne({
          where: { id: deviceId },
          relations: ["user"],
        });

        if (!device || !device.user) {
          throw new NotFoundException("Device or user not found");
        }

        return this.generateTokens(device.id, device.user.id);
      }

      this.logger.log("Creating new device registration");
      const userEmail = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@chronoflow.app`;
      const user = await this.userRepository.save({
        email: userEmail,
        passwordHash: "",
        role: "user",
        isVerified: true,
      });

      const device = await this.deviceRepository.save({
        userId: user.id,
        deviceInfo,
        locationInfo,
        isPrimary: true,
      });

      return this.generateTokens(device.id, user.id);
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

  async generateQRCode(userId: string, deviceId: string): Promise<string> {
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

      this.logger.log(
        `Generated QR code for user ${userId} and device ${deviceId}`
      );
      return code;
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

  async authenticateWithQRCode(
    code: string,
    deviceInfo: DeviceInfo,
    locationInfo: LocationInfo
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const qrCodeAuth = await this.qrCodeAuthRepository.findOne({
        where: { code, isUsed: false },
        relations: ["user"],
      });

      if (!qrCodeAuth || qrCodeAuth.expiresAt < new Date()) {
        throw new BadRequestException("Invalid or expired QR code");
      }

      const device = await this.deviceRepository.save({
        userId: qrCodeAuth.userId,
        deviceInfo,
        locationInfo,
        isPrimary: false,
      });

      await this.qrCodeAuthRepository.update(qrCodeAuth.id, { isUsed: true });
      this.logger.log(`Device ${device.id} authenticated with QR code`);

      return this.generateTokens(device.id, qrCodeAuth.userId);
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

  async refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const deviceAuth = await this.deviceAuthRepository.findOne({
        where: { refreshToken },
        relations: ["device"],
      });

      if (!deviceAuth || deviceAuth.expiresAt < new Date()) {
        throw new BadRequestException("Invalid or expired refresh token");
      }

      this.logger.log(`Refreshing tokens for device ${deviceAuth.deviceId}`);
      return this.generateTokens(deviceAuth.deviceId, deviceAuth.device.userId);
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

  private async generateTokens(
    deviceId: string,
    userId: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(
          { deviceId, userId },
          {
            secret: this.configService.get<string>("JWT_SECRET"),
            expiresIn: "15m",
          }
        ),
        this.jwtService.signAsync(
          { deviceId, userId },
          {
            secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
            expiresIn: "7d",
          }
        ),
      ]);

      await this.deviceAuthRepository.save({
        deviceId,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error(
        `Error generating tokens: ${error.message}`,
        error.stack
      );
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to generate tokens", 500);
    }
  }
}
