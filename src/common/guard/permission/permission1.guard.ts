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
import { SKIP_PERMISSION } from 'src/common/decorators/skip-permission.decorator';

@Injectable()
export class PermissionGuard1 extends AuthGuard('permission') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.

    console.log(`GUARD ----- PERMISSION - canActivate`);

    const isPublic = this.reflector.get(IS_PUBLIC_KEY, context.getHandler());
    console.log({ isPublic });

    if (isPublic) {
      return true;
    }

    const isSkipPermision = this.reflector.get(SKIP_PERMISSION, context.getHandler());
    console.log({ isSkipPermision });

    if (isSkipPermision) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // err: lỗi của hệ thống
    // info: lỗi bên thư viện throw ra
    console.log(`GUARD ----- PERMISSION - handleRequest`, {
      err,
      user,
      info,
    });
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
