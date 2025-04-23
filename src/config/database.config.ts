import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { User } from "../modules/users/models/user.model";
import {
  Device,
  DeviceAuth,
  QRCodeAuth,
} from "../modules/auth/models/device.model";

export const getDatabaseConfig = async (
  configService: ConfigService
): Promise<TypeOrmModuleOptions> => ({
  type: "postgres",
  name: "default",
  host: configService.get<string>("DB_HOST") || "localhost",
  port: configService.get<number>("DB_PORT") || 5433,
  username: configService.get<string>("DB_USERNAME") || "postgres",
  password: configService.get<string>("DB_PASSWORD") || "password",
  database: configService.get<string>("DB_DATABASE") || "chronoflow",
  entities: [User, Device, DeviceAuth, QRCodeAuth],
  synchronize: true,
  logging: true,
  migrations: [],
  migrationsRun: false,
});
