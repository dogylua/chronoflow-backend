import { Request } from "express";
import { User } from "../../modules/users/models/user.model";

export interface AuthenticatedRequest extends Request {
  user?: Express.User;
}

export interface AuthenticatedUserRequest extends Request {
  user?: Express.User & {
    deviceId: string;
    role?: string;
  };
}
