import { Module } from '@nestjs/common';
import { TokenModule } from 'src/modules/modules-system/token/token.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TotpModule } from '../totp/totp.module';

@Module({
  imports: [TokenModule, TotpModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
