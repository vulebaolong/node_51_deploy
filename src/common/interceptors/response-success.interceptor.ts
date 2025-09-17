import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MESSAGE_RESPONSE } from '../decorators/message-response.decorator';

@Injectable()
export class ResponseSuccessInterceptor implements NestInterceptor {

  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { statusCode } = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      // tap ( from 'rxjs/operators'): chạm, không thay đổi dữ liệu trả về, lỗi sẽ không bắt được
      // finalize ( from 'rxjs/operators'): không thay đổi dữ liệu trả về, bắt được kể cả lỗi
      // map ( from 'rxjs/operators'): thay đổi đữ liệu trả về, format
      map((data) => {
        // console.log({ data });
      const message = this.reflector.get(MESSAGE_RESPONSE, context.getHandler());

        return {
          status: `success`,
          statusCode: statusCode,
          message: message || "Ê gắn decorator MessageResponse vào controller đi",
          data: data,
        };
      }),
    );
  }
}
