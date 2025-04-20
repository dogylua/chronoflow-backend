export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Not authorized") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class TimeParadoxError extends AppError {
  constructor(message: string) {
    super(message, 422, "TIME_PARADOX");
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = "Database error occurred") {
    super(message, 500, "DATABASE_ERROR");
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, serviceName: string) {
    super(message, 502, `${serviceName.toUpperCase()}_ERROR`);
  }
}
