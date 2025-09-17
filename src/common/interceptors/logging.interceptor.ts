import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger('API');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();

    const { method, url } = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      // tap ( from 'rxjs/operators'): chạm, không thay đổi dữ liệu trả về, lỗi sẽ không bắt được
      // finalize ( from 'rxjs/operators'): không thay đổi dữ liệu trả về, bắt được kể cả lỗi
      // map ( from 'rxjs/operators'): thay đổi đữ liệu trả về, format
      finalize(() => this.logger.log(`${method} ${url} ${Date.now() - now}ms`)),
    );
  }
}
