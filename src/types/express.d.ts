import { User } from "../modules/users/models/user.model";

declare global {
  namespace Express {
    interface User {
      id: string;
      deviceId: string;
      email?: string;
      role?: string;
    }
  }
}

// This needs to be here to be treated as a module
export {};
