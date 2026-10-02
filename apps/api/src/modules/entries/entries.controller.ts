import { Body, Controller, Post } from '@nestjs/common';
import { EntriesService } from './entries.service.js';
import { CreateEntryDto, CreateFractionalEntryDto, CreateSerialBatchDto } from './dto.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Role } from '@isp/shared';

@Controller('stock/entries')
@Roles(Role.ADMIN, Role.ESTOQUISTA)
export class EntriesController {
  constructor(private entriesService: EntriesService) {}

  @Post()
  create(@Body() dto: CreateEntryDto, @CurrentUser('sub') userId: string) {
    return this.entriesService.createEntry({ ...dto, createdBy: userId });
  }

  @Post('serial-batch')
  createSerialBatch(@Body() dto: CreateSerialBatchDto, @CurrentUser('sub') userId: string) {
    return this.entriesService.createSerialBatch({ ...dto, createdBy: userId });
  }

  @Post('fractional')
  createFractional(@Body() dto: CreateFractionalEntryDto, @CurrentUser('sub') userId: string) {
    return this.entriesService.createFractionalEntry({ ...dto, createdBy: userId });
  }
}
