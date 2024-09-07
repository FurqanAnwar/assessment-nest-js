import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Log } from './schema/log.model';

@Module({
  imports: [SequelizeModule.forFeature([Log])],
  exports: [SequelizeModule],
})
export class LogModule {}
