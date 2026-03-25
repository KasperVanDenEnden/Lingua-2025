import { Test, TestingModule } from '@nestjs/testing';
import { NeoOperationsService } from './neo-operations.service';

describe('NeoOperationsService', () => {
  let service: NeoOperationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NeoOperationsService],
    }).compile();

    service = module.get<NeoOperationsService>(NeoOperationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
