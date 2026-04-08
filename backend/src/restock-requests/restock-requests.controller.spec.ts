import { Test, TestingModule } from '@nestjs/testing';
import { RestockRequestsController } from './restock-requests.controller';

describe('RestockRequestsController', () => {
  let controller: RestockRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestockRequestsController],
    }).compile();

    controller = module.get<RestockRequestsController>(RestockRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
