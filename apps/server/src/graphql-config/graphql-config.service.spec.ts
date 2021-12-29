import { Test, TestingModule } from '@nestjs/testing';
import { GraphqlConfigService } from './graphql-config.service';

describe('GraphqlConfigService', () => {
  let service: GraphqlConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GraphqlConfigService],
    }).compile();

    service = module.get<GraphqlConfigService>(GraphqlConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
