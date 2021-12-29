import { Test, TestingModule } from '@nestjs/testing';
import { VideoStreamSessionService } from './video-stream-session.service';

describe('VideoStreamSessionService', () => {
  let service: VideoStreamSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoStreamSessionService],
    }).compile();

    service = module.get<VideoStreamSessionService>(VideoStreamSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
