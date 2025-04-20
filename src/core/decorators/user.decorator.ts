import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthenticatedRequest } from "../types/request.types";

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  }
);
