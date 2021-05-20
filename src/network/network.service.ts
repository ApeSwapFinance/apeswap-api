import { Injectable, Logger } from '@nestjs/common';
import { getCurrentBlock } from 'src/utils/lib/web3';

@Injectable()
export class NetworkService {
  private readonly logger = new Logger(NetworkService.name);

  private lastBlock = 0;
  private networkStatus = 'green';
  private networkStatusNum = 6;
  private statusCheckInterval = 30000;

  constructor() {
    this.getLatestBlock();
  }

  getStatus() {
    return this.networkStatus;
  }

  async getLatestBlock() {
    const newBlock = await getCurrentBlock();
    this.networkStatus = this.updateNetworkStatus(newBlock - this.lastBlock);
    this.lastBlock = newBlock;
    setTimeout(this.getLatestBlock.bind(this), this.statusCheckInterval);
  }

  /*
    If (blockDifference > 8) : netWorkStatusNum++   (up to 6)             GREEN
    If (blockDifference > 6) : netWorkStatusNum = 3 (unless already < 3)  YELLOW
    If (blockDifference < 6) : netWorkStatusNum = 0                       RED
  */
  updateNetworkStatus(blockDifference) {
    this.logger.log('Network Status Block difference: ' + blockDifference);
    if (blockDifference > 8) {
      this.networkStatusNum = Math.min(this.networkStatusNum + 1, 6);
    } else if (blockDifference > 6) {
      if (this.networkStatusNum > 3) {
        this.networkStatusNum = 3;
      }
    } else {
      this.networkStatusNum = 0;
    }
    return this.getStatusByNum();
  }

  /* 
    networkStatusNum ranges from 0 - 6
    6   : green
    3-5 : yellow
    0-2 : red
  */
  getStatusByNum() {
    if (this.networkStatusNum > 5) return 'green';
    if (this.networkStatusNum > 2) return 'yellow';
    return 'red';
  }
}
