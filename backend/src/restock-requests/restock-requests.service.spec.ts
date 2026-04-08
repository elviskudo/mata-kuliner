import { Test, TestingModule } from '@nestjs/testing';
import { RestockRequestsService } from './restock-requests.service';

describe('RestockRequestsService', () => {
  let service: RestockRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RestockRequestsService],
    }).compile();

    service = module.get<RestockRequestsService>(RestockRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
