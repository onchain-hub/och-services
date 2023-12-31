import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MongooseModule } from "@nestjs/mongoose";
import { config } from "./config";
import { RedisModule } from "@nestjs-modules/ioredis";
import { AuthModule } from "./auth/auth.module";
import { WalletModule } from "./wallet/wallet.module";
import { ThrottlerModule } from "@nestjs/throttler";
import { MailModule } from "./mail/mail.module";
import { BullModule } from "@nestjs/bull";
import { ProfileModule } from "./profile/profile.module";
import { ModuleModule } from "./module/module.module";
import { UserModuleModule } from "./user-module/user-module.module";
const redisUrl = new URL(process.env.REDIS_URL);

@Module({
  imports: [
    MongooseModule.forRoot(config.mongoUrl),
    ModuleModule,
    UserModuleModule,
    RedisModule.forRoot({
      config: {
        url: config.redisUrl,
      },
    }),
    BullModule.forRoot({
      redis: {
        host: redisUrl.hostname,
        port: parseInt(redisUrl.port, 10),
        password: redisUrl.password,
      },
    }),
    AuthModule,
    WalletModule,
    ProfileModule,
    MailModule,
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
