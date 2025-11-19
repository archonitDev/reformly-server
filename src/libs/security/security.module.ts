import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { FirebaseModule } from '@libs/firebase/firebase.module';
import { PrismaModule } from '@libs/prisma/prisma.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { SecurityService } from './security.service';
import { UsersModule } from '@app/users/users.module';

@Module({
  imports: [
    PassportModule,
    FirebaseModule,
    PrismaModule,
    UsersModule,
    ConfigModule,
    JwtModule.register({}),
  ],
  providers: [JwtStrategy, SecurityService],
  exports: [PassportModule, SecurityService],
})
export class SecurityModule {}
