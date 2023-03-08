import { Test, TestingModule } from '@nestjs/testing';
import { RedemptionService } from './redemption.service';

describe('RedemptionService', () => {
  let service: RedemptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedemptionService],
    }).compile();

    service = module.get<RedemptionService>(RedemptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
