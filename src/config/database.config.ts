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
  host: configService.get<string>("DB_HOST"),
  port: configService.get<number>("DB_PORT"),
  username: configService.get<string>("DB_USERNAME"),
  password: configService.get<string>("DB_PASSWORD"),
  database: configService.get<string>("DB_DATABASE"),
  entities: [User, Device, DeviceAuth, QRCodeAuth],
  synchronize: configService.get<string>("NODE_ENV") === "development",
  logging: configService.get<string>("NODE_ENV") === "development",
  // Disable migrations for now
  migrations: [],
  migrationsRun: false,
});
