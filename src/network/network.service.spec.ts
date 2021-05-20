import { Test, TestingModule } from '@nestjs/testing';
import { NetworkService } from './network.service';

describe('NetworkService', () => {
  let service: NetworkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NetworkService],
    }).compile();

    service = module.get<NetworkService>(NetworkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get network status', () => {
    const status = service.getStatus();
    expect(status == 'green' || status == 'yellow' || status == 'red').toBe(
      true,
    );
  });

  it('should get green network status', () => {
    const status = service.updateNetworkStatus(10);
    expect(status).toEqual('green');
  });

  it('should get yellow network status', () => {
    const status = service.updateNetworkStatus(7);
    expect(status).toEqual('yellow');
  });

  it('should get red network status', () => {
    const status = service.updateNetworkStatus(3);
    expect(status).toEqual('red');
  });
});
