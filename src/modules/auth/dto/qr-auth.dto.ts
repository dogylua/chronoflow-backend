import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsUUID } from "class-validator";

export class QrAuthDto {
  @ApiProperty({
    description: "QR code token",
    example: "qr-token-123",
  })
  @IsString()
  @IsNotEmpty()
  qrToken: string;

  @ApiProperty({
    description: "Device ID",
    example: "device-123",
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  userId: string;
}
