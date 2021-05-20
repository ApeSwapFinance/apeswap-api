import { Module, HttpModule } from '@nestjs/common';
import { NetworkService } from './network.service';
import { NetworkController } from './network.controller';

@Module({
  imports: [HttpModule],
  providers: [NetworkService],
  controllers: [NetworkController],
})
export class NetworkModule {}
