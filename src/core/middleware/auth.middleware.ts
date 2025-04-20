import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedException("No token provided");
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>("JWT_SECRET"),
      });

      req.user = {
        id: payload.id,
        deviceId: payload.deviceId,
        email: payload.email,
        role: payload.role,
      };
      next();
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException("User not authenticated");
    }

    const userRole = req.user.role;
    if (!userRole || !roles.includes(userRole)) {
      throw new UnauthorizedException("Insufficient permissions");
    }

    next();
  };
};
