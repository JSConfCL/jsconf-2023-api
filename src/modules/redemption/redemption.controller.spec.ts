import { Test, TestingModule } from '@nestjs/testing';
import { RedemptionController } from './redemption.controller';

describe('RedemptionController', () => {
  let controller: RedemptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RedemptionController],
    }).compile();

    controller = module.get<RedemptionController>(RedemptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
