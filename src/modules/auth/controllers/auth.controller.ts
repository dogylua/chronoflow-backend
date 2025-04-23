import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AuthService } from "../services/auth.service";
import {
  DeviceInfo,
  LocationInfo,
  CreateDeviceDTO,
} from "../models/device.model";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { AuthenticatedRequest } from "../../../core/types/request.types";
import { RegisterDto } from "../dto/register.dto";
import { LoginDto } from "../dto/login.dto";
import { RegisterDeviceDto } from "../dto/register-device.dto";
import { QrAuthDto } from "../dto/qr-auth.dto";
import { AuthResponseDto } from "../dto/auth-response.dto";
import { DeviceAuthResponseDto } from "../dto/device-auth-response.dto";

@ApiTags("Authentication")
@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "User successfully registered",
    type: AuthResponseDto,
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login user" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User successfully logged in",
    type: AuthResponseDto,
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post("device/register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Register a new device" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Device successfully registered",
    type: DeviceAuthResponseDto,
  })
  async registerDevice(
    @Body() registerDeviceDto: RegisterDeviceDto
  ): Promise<DeviceAuthResponseDto> {
    return this.authService.registerDevice(registerDeviceDto);
  }

  @Get("qr-code")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Generate QR code for device authentication" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "QR code generated successfully",
    type: DeviceAuthResponseDto,
  })
  async generateQRCode(
    @Req() req: AuthenticatedRequest
  ): Promise<DeviceAuthResponseDto> {
    const userId = req.user?.id;
    const deviceId = req.user?.deviceId;

    if (!userId || !deviceId) {
      throw new UnauthorizedException("User or device not authenticated");
    }

    return this.authService.generateQRCode(userId, deviceId);
  }

  @Post("qr-code/authenticate")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Authenticate device using QR code" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Device successfully authenticated",
    type: AuthResponseDto,
  })
  async authenticateWithQRCode(
    @Body() qrAuthDto: QrAuthDto
  ): Promise<AuthResponseDto> {
    return this.authService.authenticateWithQRCode(qrAuthDto);
  }

  @Post("refresh-token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh authentication token" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Token successfully refreshed",
    type: AuthResponseDto,
  })
  async refreshToken(
    @Body("refreshToken") refreshToken: string
  ): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshToken);
  }

  @Get("device/check/:deviceId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Check if device is registered" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Device check completed",
    type: DeviceAuthResponseDto,
  })
  async checkDevice(
    @Req() req: AuthenticatedRequest
  ): Promise<DeviceAuthResponseDto> {
    const deviceId = req.user?.deviceId;
    if (!deviceId) {
      throw new UnauthorizedException("Device ID not provided");
    }
    return this.authService.checkDevice(deviceId);
  }
}
