import { Test, TestingModule } from '@nestjs/testing';
import { VideoStreamSessionManagerService } from './video-stream-session-manager.service';

describe('VideoStreamSessionManagerService', () => {
  let service: VideoStreamSessionManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoStreamSessionManagerService],
    }).compile();

    service = module.get<VideoStreamSessionManagerService>(VideoStreamSessionManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
