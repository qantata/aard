import { Test, TestingModule } from '@nestjs/testing';
import { WebClientService } from './web-client.service';

describe('WebClientService', () => {
  let service: WebClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebClientService],
    }).compile();

    service = module.get<WebClientService>(WebClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
