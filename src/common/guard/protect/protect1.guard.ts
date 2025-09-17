import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';

@Injectable()
export class ProtectGuard1 extends AuthGuard('protect') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.

    console.log(`canActivate - chạy đầu tiên`);

    const isPublic = this.reflector.get(IS_PUBLIC_KEY, context.getHandler());
    console.log({ isPublic });

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // err: lỗi của hệ thống
    // info: lỗi bên thư viện throw ra
    console.log(`handleRequest - luôn luôn chạy cuối cùng`, {
      err,
      user,
      info,
    });
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      if (info instanceof TokenExpiredError) {
        throw new ForbiddenException(info.message);
      }

      throw err || new UnauthorizedException();
    }
    return user;
  }
}
