import { ApiProperty } from "@nestjs/swagger";

export class AuthResponseDto {
  @ApiProperty({
    description: "JWT access token",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  accessToken: string;

  @ApiProperty({
    description: "Token type",
    example: "Bearer",
  })
  tokenType: string;

  @ApiProperty({
    description: "Token expiration time in seconds",
    example: 3600,
  })
  expiresIn: number;

  @ApiProperty({
    description: "User information",
    type: "object",
    properties: {
      id: { type: "string", example: "123e4567-e89b-12d3-a456-426614174000" },
      email: { type: "string", example: "user@example.com" },
      firstName: { type: "string", example: "John" },
      lastName: { type: "string", example: "Doe" },
    },
  })
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}
