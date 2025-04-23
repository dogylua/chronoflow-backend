import { ApiProperty } from "@nestjs/swagger";

export class DeviceAuthResponseDto {
  @ApiProperty({
    description: "Device authentication token",
    example: "device-token-123",
  })
  deviceToken: string;

  @ApiProperty({
    description: "QR code for authentication",
    example: "qr-code-123",
    required: false,
  })
  qrCode?: string;

  @ApiProperty({
    description: "Device information",
    type: "object",
    properties: {
      id: { type: "string", example: "device-123" },
      name: { type: "string", example: "iPhone 13" },
      type: { type: "string", example: "mobile" },
    },
  })
  device: {
    id: string;
    name?: string;
    type: string;
  };

  @ApiProperty({
    description: "Authentication status",
    example: "pending",
    enum: ["pending", "authenticated"],
  })
  status: string;
}
