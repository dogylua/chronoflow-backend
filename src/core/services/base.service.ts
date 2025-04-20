import { Logger } from "@nestjs/common";
import { AppError } from "../error/app-error";

export abstract class BaseService {
  protected readonly logger: Logger;

  constructor(serviceName: string) {
    this.logger = new Logger(serviceName);
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

  protected logOperation(operation: string, details?: unknown): void {
    this.logger.log(
      `Operation: ${operation}`,
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

  protected validateObjectType<T extends object>(
    data: unknown,
    typeGuard: (value: unknown) => value is T
  ): T {
    if (!typeGuard(data)) {
      throw new AppError("Invalid data type provided", 400);
    }
    return data;
  }

  protected async retryOperation<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(
          `Attempt ${attempt} failed: ${lastError.message}`,
          lastError.stack
        );

        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    throw (
      lastError ||
      new AppError("Operation failed after all retry attempts", 500)
    );
  }
}
