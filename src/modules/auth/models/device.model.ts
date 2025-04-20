import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../../users/models/user.model";
import {
  IsNotEmpty,
  IsObject,
  ValidateNested,
  IsOptional,
} from "class-validator";
import { Type } from "class-transformer";

export class DeviceInfo {
  @IsNotEmpty()
  name!: string;

  @IsNotEmpty()
  model!: string;

  @IsOptional()
  systemName?: string;

  @IsOptional()
  systemVersion?: string;

  @IsOptional()
  identifierForVendor?: string;

  @IsOptional()
  brand?: string;

  @IsOptional()
  device?: string;

  @IsOptional()
  product?: string;

  @IsOptional()
  version?: string;

  @IsOptional()
  sdkInt?: number;
}

export class LocationInfo {
  @IsNotEmpty()
  latitude!: number;

  @IsNotEmpty()
  longitude!: number;

  @IsNotEmpty()
  accuracy!: number;

  @IsNotEmpty()
  altitude!: number;

  @IsNotEmpty()
  speed!: number;

  @IsNotEmpty()
  speedAccuracy!: number;

  @IsNotEmpty()
  heading!: number;

  @IsNotEmpty()
  timestamp!: string;
}

export class CreateDeviceDTO {
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => DeviceInfo)
  deviceInfo!: DeviceInfo;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => LocationInfo)
  locationInfo!: LocationInfo;
}

@Entity("devices")
export class Device {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid")
  userId!: string;

  @Column("jsonb")
  deviceInfo!: DeviceInfo;

  @Column("jsonb")
  locationInfo!: LocationInfo;

  @Column({ default: false })
  isPrimary!: boolean;

  @Column({ type: "timestamp", nullable: true })
  lastActiveAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User;
}

@Entity("device_auth")
export class DeviceAuth {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid")
  deviceId!: string;

  @Column()
  refreshToken!: string;

  @Column({ type: "timestamp" })
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Device)
  @JoinColumn({ name: "deviceId" })
  device!: Device;
}

@Entity("qr_code_auth")
export class QRCodeAuth {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid")
  userId!: string;

  @Column("uuid")
  deviceId!: string;

  @Column()
  code!: string;

  @Column({ type: "timestamp" })
  expiresAt!: Date;

  @Column({ default: false })
  isUsed!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User;

  @ManyToOne(() => Device)
  @JoinColumn({ name: "deviceId" })
  device!: Device;
}

export class CreateQRCodeAuthDTO {
  userId!: string;
  deviceId!: string;
}
