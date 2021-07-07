import { Controller, Get, Query } from '@nestjs/common';
import { GetCandleDataDto } from './pairs.dto';
import { PairsService } from './pairs.service';

@Controller('pairs')
export class PairsController {
  constructor(private pairsService: PairsService) {}

  @Get()
  getIncentivizedPools() {
    return this.pairsService.getIncentivizedPools();
  }
}
