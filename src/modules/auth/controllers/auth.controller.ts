import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import {
  DeviceInfo,
  LocationInfo,
  CreateDeviceDTO,
} from "../models/device.model";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { AuthenticatedRequest } from "../../../core/types/request.types";

@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("check-device")
  async checkDevice(@Body("deviceInfo") deviceInfo: DeviceInfo) {
    return this.authService.checkDeviceRegistration(deviceInfo);
  }

  @Post("register")
  async registerDevice(@Body() createDeviceDto: CreateDeviceDTO) {
    const { deviceInfo, locationInfo } = createDeviceDto;
    return this.authService.registerDevice(deviceInfo, locationInfo);
  }

  @Get("qr-code")
  @UseGuards(JwtAuthGuard)
  async generateQRCode(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    const deviceId = req.user?.deviceId;

    if (!userId || !deviceId) {
      throw new UnauthorizedException("User or device not authenticated");
    }

    return this.authService.generateQRCode(userId, deviceId);
  }

  @Post("qr-code/authenticate")
  async authenticateWithQRCode(
    @Body("code") code: string,
    @Body("deviceInfo") deviceInfo: DeviceInfo,
    @Body("locationInfo") locationInfo: LocationInfo
  ) {
    return this.authService.authenticateWithQRCode(
      code,
      deviceInfo,
      locationInfo
    );
  }

  @Post("refresh-token")
  async refreshToken(@Body("refreshToken") refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}
