import { Controller, Get, Logger } from '@nestjs/common';
import { NetworkService } from './network.service';

@Controller('network')
export class NetworkController {
  private readonly logger = new Logger(NetworkController.name);
  constructor(private networkService: NetworkService) {}
  @Get()
  getNetworkStatus() {
    this.logger.debug('Called GET /network');
    return this.networkService.getStatus();
  }
}
