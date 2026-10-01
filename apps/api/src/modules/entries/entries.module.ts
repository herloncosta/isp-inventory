import { Module } from '@nestjs/common';
import { EntriesController } from './entries.controller.js';
import { EntriesService } from './entries.service.js';

@Module({
  controllers: [EntriesController],
  providers: [EntriesService],
})
export class EntriesModule {}
