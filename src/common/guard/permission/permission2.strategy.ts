import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ACCESS_TOKEN_SECRET } from 'src/common/constant/app.constant';
import { Users } from 'generated/prisma';
import { PrismaService } from 'src/modules/modules-system/prisma/prisma.service';
import { Request } from 'express';
// import { jwtConstants } from './constants';

type RequestUser = Request & { user: Users };

@Injectable()
export class PermissionStrategy2 extends PassportStrategy(
  Strategy,
  'permission',
) {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async validate(req: RequestUser) {
    console.log(`GUARD ----- PERMISSION - validate`);
    // đảm bảo có user
    const user = req?.user;
    if (!user) {
      console.log(`User not found in protect`);
      throw new BadRequestException('User Not Found');
    }

    // console.log({user});

    // role admin thì cho qua
    if (user.roleId === 1) {
      return user;
    }

    // method
    const method = req.method;
    // endpoint
    // /api/auth + /get-info
    const endpoint = req.baseUrl + req.route?.path;

    // tham khảo
    // const permission = await prisma.permissions.findFirst({
    //     where: {
    //         endpoint: endpoint,
    //         method: method,
    //     },
    // });

    const rolePermissionExist = await this.prisma.rolePermission.findFirst({
      where: {
        roleId: user.roleId,
        // permissionId: permission.id, // // tham khảo
        Permissions: {
          endpoint: endpoint,
          method: method,
        },
        isActive: true,
      },
    });

    if (!rolePermissionExist) {
      throw new BadRequestException('User not permission');
    }

    // console.log({ user, method, endpoint, rolePermissionExist });

    return user;
  }
}
