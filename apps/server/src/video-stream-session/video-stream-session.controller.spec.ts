import { Test, TestingModule } from '@nestjs/testing';
import { VideoStreamSessionController } from './video-stream-session.controller';

describe('VideoStreamSessionController', () => {
  let controller: VideoStreamSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoStreamSessionController],
    }).compile();

    controller = module.get<VideoStreamSessionController>(VideoStreamSessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
