import { Module } from '@nestjs/common';
import { RolesModule } from '@app/roles/roles.module';
import { UsersModule } from '@app/users/users.module';
import { AuthModule } from '@app/auth/auth.module';
import { SecurityModule } from '@libs/security/security.module';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config_i18n from 'configs/i18n.config';
import config_app from 'configs/app.config';
import config_security from 'configs/security.config';
import config_firebase from 'configs/firebase.config';
import config_storage from 'configs/storage.config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from '@libs/prisma/prisma.module';
import { FirebaseModule } from '@libs/firebase/firebase.module';
import { AccessTokenGuard } from '@libs/security/guards/access-token.guard';
import { PostsModule } from '@app/posts/posts.module';
import { CommentsModule } from '@app/comments/comments.module';
import { LikesModule } from '@app/likes/likes.module';
import { NotificationsModule } from '@app/notifications/notifications.module';
import { ProgramsModule } from '@app/programs/programs.module';
import { WorkoutsModule } from '@app/workouts/workouts.module';

@Module({
  imports: [
    RolesModule,
    UsersModule,
    AuthModule,
    SecurityModule,
    PrismaModule,
    FirebaseModule,
    PostsModule,
    CommentsModule,
    LikesModule,
    NotificationsModule,
    ProgramsModule,
    WorkoutsModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [
        config_i18n,
        config_app,
        config_security,
        config_firebase,
        config_storage,
      ],
      isGlobal: true,
    }),
    I18nModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
      useFactory: (config: ConfigService) => config.get('i18n'),
    }),
    JwtModule.register({}),
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: AccessTokenGuard }],
})
export class AppModule {}
