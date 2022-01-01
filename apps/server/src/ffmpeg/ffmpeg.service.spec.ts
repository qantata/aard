import { Test, TestingModule } from "@nestjs/testing";
import { FFmpegService } from "./ffmpeg.service";

describe("FfmpegService", () => {
  let service: FFmpegService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FFmpegService],
    }).compile();

    service = module.get<FFmpegService>(FFmpegService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
