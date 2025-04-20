import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export interface UserSettings {
  theme?: "light" | "dark";
  notifications?: boolean;
  emailNotifications?: boolean;
  timezone?: string;
  language?: string;
  arEnabled?: boolean;
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({
    type: "enum",
    enum: ["user", "admin", "moderator"],
    default: "user",
  })
  role!: "user" | "admin" | "moderator";

  @Column({ type: "float", default: 0 })
  timeScore!: number;

  @Column({ type: "jsonb", default: {} })
  settings!: UserSettings;

  @Column({ default: false })
  isVerified!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

export interface UserProfile {
  id: string;
  username?: string;
  avatarUrl?: string;
  timeScore: number;
  role: string;
  createdAt: Date;
}

export interface UserStats {
  totalHabits: number;
  activeHabits: number;
  totalTimeParadoxes: number;
  resolvedParadoxes: number;
  currentStreak: number;
  achievements: number;
  level: number;
}

export interface UserWithStats extends UserProfile {
  stats: UserStats;
}

export class CreateUserDTO {
  email!: string;
  password!: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export class UpdateUserDTO {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
  settings?: UserSettings;
}
