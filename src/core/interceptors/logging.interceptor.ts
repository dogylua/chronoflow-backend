import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, headers, body } = request;
    const userAgent = headers["user-agent"] || "";
    const startTime = Date.now();

    // Log request details
    this.logger.log(
      `Incoming Request: ${method} ${url}`,
      `IP: ${ip}`,
      `User-Agent: ${userAgent}`,
      `Body: ${JSON.stringify(body)}`,
      `Headers: ${JSON.stringify(headers)}`
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const duration = Date.now() - startTime;

          // Log successful response
          this.logger.log(
            `Outgoing Response: ${method} ${url} ${statusCode} ${duration}ms`,
            `Response Body: ${JSON.stringify(data)}`
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;

          // Log error response
          this.logger.error(
            `Error Response: ${method} ${url} ${duration}ms`,
            `Error: ${error.message}`,
            `Stack: ${error.stack}`
          );
        },
      })
    );
  }
}
