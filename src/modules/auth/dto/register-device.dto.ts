import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  ValidateNested,
  IsNumber,
} from "class-validator";
import { Type } from "class-transformer";
import { DeviceType } from "../models/device.model";

export class LocationInfoDto {
  @ApiProperty({ example: 0 })
  @IsNumber()
  speed: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  heading: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  accuracy: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  altitude: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: "2025-04-20T01:21:42.356179" })
  @IsString()
  timestamp: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  speedAccuracy: number;
}

export class RegisterDeviceDto {
  @ApiProperty({
    description: "Device identifier",
    example: "device-123",
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({
    description: "Device name",
    example: "iPhone 15",
    required: false,
  })
  @IsString()
  @IsOptional()
  deviceName?: string;

  @ApiProperty({
    description: "Device type",
    example: DeviceType.MOBILE,
    enum: DeviceType,
  })
  @IsEnum(DeviceType)
  @IsNotEmpty()
  deviceType: DeviceType;

  @ApiProperty({
    description: "Device operating system",
    example: "iOS",
    required: false,
  })
  @IsString()
  @IsOptional()
  os?: string;

  @ApiProperty({
    description: "Device model",
    example: "iPhone",
    required: false,
  })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiProperty({
    description: "Device system name",
    example: "iOS",
    required: false,
  })
  @IsString()
  @IsOptional()
  systemName?: string;

  @ApiProperty({
    description: "Device system version",
    example: "16.0.1",
    required: false,
  })
  @IsString()
  @IsOptional()
  systemVersion?: string;

  @ApiProperty({
    description: "Device vendor identifier",
    example: "DC130CBF-B87C-433D-AD61-ED46BE0760DE",
    required: false,
  })
  @IsString()
  @IsOptional()
  identifierForVendor?: string;

  @ApiProperty({
    description: "Device location information",
    required: false,
    type: () => LocationInfoDto,
  })
  @ValidateNested()
  @Type(() => LocationInfoDto)
  @IsOptional()
  location?: LocationInfoDto;

  @ApiProperty({
    description: "User ID if registering for existing user",
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  @IsUUID()
  @IsOptional()
  userId?: string;
}
