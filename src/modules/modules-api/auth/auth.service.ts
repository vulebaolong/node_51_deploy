import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/modules/modules-system/prisma/prisma.service';
// import bcrypt from 'bcrypt';
import * as bcrypt from 'bcrypt';
import { TokenService } from 'src/modules/modules-system/token/token.service';
import { Users } from 'generated/prisma';
import { RegisterDto } from './dto/register.dto';
import { TotpService } from '../totp/totp.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly tottpService: TotpService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password, token } = loginDto;

    const userExits = await this.prisma.users.findUnique({
      where: {
        email: email,
      },
    });
    if (!userExits) {
      throw new BadRequestException(
        'Người dùng chưa tồn tại, vui lòng đăng ký',
      );
    }

    // nếu tài khoản của người dùng có bật 2FA thì mới xử lý
    if (userExits.totpSecret) {
      if (!token) {
        // bước 1: không gửi token
        // trả về isTotp là true để cho FE chuyển sang giao diện nhập token
        return { isTotp: true };
      } else {
        // bước 2: phải gửi token
        // có token rồi thì sẽ kiểm tra xem token hợp lệ hay không
        this.tottpService.verify({ token: token }, userExits);
      }
    }

    // Nếu code chạy được tới đây => đảm bảo có userExits

    // do tài khoản đăng nhập bằng gmail hoặc facebook
    // lúc này tài khoản sẽ không có mật khẩu
    // nên nếu người dùng cố tình đăng nhập bằng email thì sẽ không có mật khẩu để kiểm tra
    // nên phải bắt người dùng đăng nhập bằng email vào setting để cập nhật lại mật khẩu mới
    if (!userExits.password) {
      throw new BadRequestException(
        'Vui lòng đăng nhập bằng mạng xã hội (gmail, facebook), để cập nhật lại mật khẩu mới trong setting',
      );
    }

    const isPassword = bcrypt.compareSync(password, userExits.password); // true
    if (!isPassword) throw new BadRequestException('Mật khẩu không chính xác');
    // Nếu code chạy được tới đây => người dùng này hợp lệ

    const tokens = this.tokenService.createTokens(userExits.id);

    // console.log({ email, password });

    // // sendMail(email)
    // sendMail('vulebaolong@gmail.com');

    return tokens;
  }

  async register(registerDto: RegisterDto) {
    const { email, password, fullName } = registerDto;

    const userExits = await this.prisma.users.findUnique({
      where: {
        email: email,
      },
    });

    if (userExits) {
      throw new BadRequestException('Ông có tài khoản đăng ký chi nữa');
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const { password: _, ...userNew } = await this.prisma.users.create({
      data: {
        email: email,
        password: passwordHash,
        fullName: fullName,
      },
    });

    console.log({ userNew });

    // delete userNew.password;

    return userNew;
  }

  getInfo(user: Users) {
    return { ...user, isTotp: !!user.totpSecret };
  }

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
