import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './schema/user.model';
import { UserController } from './user.controller';
import { UserService } from './user.service';
@Module({
    imports: [ SequelizeModule.forFeature([User])],
    providers: [UserService],
    controllers: [UserController]
})

export class UserModule {}