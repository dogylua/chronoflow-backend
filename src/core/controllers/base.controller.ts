import { Logger } from "@nestjs/common";
import { AppError } from "../error/app-error";

export abstract class BaseController {
  protected readonly logger: Logger;

  constructor(controllerName: string) {
    this.logger = new Logger(controllerName);
  }

  protected handleError(
    error: unknown,
    context: string,
    statusCode: number = 500
  ): never {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.logger.error(`Error in ${context}: ${errorMessage}`, errorStack);

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(`Failed to ${context}`, statusCode);
  }

  protected logRequest(operation: string, details?: unknown): void {
    this.logger.log(
      `Request: ${operation}`,
      details ? `Details: ${JSON.stringify(details)}` : undefined
    );
  }

  protected validateRequiredFields(data: unknown, fields: string[]): void {
    if (!data || typeof data !== "object") {
      throw new AppError("Invalid data provided", 400);
    }

    const missingFields = fields.filter((field) => !(field in data));
    if (missingFields.length > 0) {
      throw new AppError(
        `Missing required fields: ${missingFields.join(", ")}`,
        400
      );
    }
  }

  protected sanitizeResponse<T>(data: T): T {
    if (!data || typeof data !== "object") {
      return data;
    }

    const sensitiveFields = [
      "password",
      "passwordHash",
      "refreshToken",
      "token",
      "apiKey",
      "secret",
      "privateKey",
    ];

    const sanitized = { ...data };
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        delete (sanitized as Record<string, unknown>)[field];
      }
    }

    return sanitized;
  }

  protected async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    context: string,
    statusCode: number = 500
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.handleError(error, context, statusCode);
    }
  }

  protected validateObjectType<T extends object>(
    data: unknown,
    typeGuard: (value: unknown) => value is T
  ): T {
    if (!typeGuard(data)) {
      throw new AppError("Invalid data type provided", 400);
    }
    return data;
  }

  protected validateArrayType<T>(
    data: unknown,
    typeGuard: (value: unknown) => value is T
  ): T[] {
    if (!Array.isArray(data)) {
      throw new AppError("Invalid array data provided", 400);
    }

    if (!data.every((item) => typeGuard(item))) {
      throw new AppError("Invalid array item type provided", 400);
    }

    return data as T[];
  }
}
