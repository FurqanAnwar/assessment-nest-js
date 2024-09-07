import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './schema/user.model';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { LogModule } from 'src/logs/log.module';

@Module({
    imports: [ SequelizeModule.forFeature([User]), LogModule],
    providers: [UserService],
    controllers: [UserController]
})

export class UserModule {}