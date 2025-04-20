import { Logger } from "@nestjs/common";
import { AppError } from "../error/app-error";

export class CommonUtils {
  private static readonly logger = new Logger("CommonUtils");

  static generateRandomString(length: number): string {
    if (length <= 0) {
      throw new AppError("Length must be greater than 0", 400);
    }
    return Math.random()
      .toString(36)
      .substring(2, length + 2);
  }

  static generateUniqueEmail(prefix: string = "user"): string {
    if (!prefix || typeof prefix !== "string") {
      throw new AppError("Invalid prefix provided", 400);
    }
    const timestamp = Date.now();
    const randomString = this.generateRandomString(8);
    return `${prefix}_${timestamp}_${randomString}@chronoflow.app`;
  }

  static calculateExpirationDate(days: number): Date {
    if (days <= 0) {
      throw new AppError("Days must be greater than 0", 400);
    }
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  static validateEmail(email: string): boolean {
    if (!email || typeof email !== "string") {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static sanitizeObject<T extends Record<string, unknown>>(
    obj: T,
    sensitiveFields: string[]
  ): T {
    if (!obj || typeof obj !== "object") {
      return obj;
    }

    const sanitized = { ...obj };
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        delete sanitized[field];
      }
    }

    return sanitized;
  }

  static async sleep(ms: number): Promise<void> {
    if (ms <= 0) {
      throw new AppError("Sleep duration must be greater than 0", 400);
    }
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static formatError(error: unknown): string {
    if (error instanceof Error) {
      return `Error: ${error.message}\nStack: ${error.stack}`;
    }
    return `Error: ${String(error)}`;
  }

  static logError(context: string, error: unknown): void {
    if (error instanceof Error) {
      this.logger.error(`Error in ${context}: ${error.message}`, error.stack);
    } else {
      this.logger.error(`Error in ${context}: ${String(error)}`);
    }
  }

  static isObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  static deepClone<T>(obj: T): T {
    if (!this.isObject(obj) && !Array.isArray(obj)) {
      return obj;
    }

    return JSON.parse(JSON.stringify(obj));
  }
}
