import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseModule } from '@libs/firebase/firebase.module';
import { SecurityModule } from '@libs/security/security.module';
import { UsersModule } from '@app/users/users.module';

@Module({
  imports: [FirebaseModule, SecurityModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
