import { Test, TestingModule } from '@nestjs/testing';
import { UserTicketsController } from './user_tickets.controller';

describe('UserTicketsController', () => {
  let controller: UserTicketsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserTicketsController],
    }).compile();

    controller = module.get<UserTicketsController>(UserTicketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
