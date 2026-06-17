import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { LoggerService } from '../common/logger.service';

@Module({
  controllers: [StatsController],
  providers: [StatsService, LoggerService],
})
export class StatsModule {}
