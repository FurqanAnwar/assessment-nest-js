import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModule } from './users/user.module';
import * as dotenv from 'dotenv';
import { LogModule } from './logs/log.module';
import { SessionMiddleware } from './utils/session.middleware';
import { Sessions } from './sessions/schema/session.model';

dotenv.config();

@Module({
  imports: [
    SequelizeModule.forFeature([Sessions]),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadModels: true,
      synchronize: true
    }),
    UserModule,
    LogModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SessionMiddleware)
      .exclude({ path: 'auth/signup', method: RequestMethod.POST })
      .forRoutes('*');
  }
}
