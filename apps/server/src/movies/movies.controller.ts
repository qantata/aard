import { Controller, Get, HttpStatus, Param, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import * as path from "path";
import * as fs from "fs";

import { context } from "@/nexus/context";

@Controller()
export class MoviesController {
  @Get(":id/cover")
  async cover(@Req() req: Request, @Res() res: Response, @Param("id") id: string) {
    const movie = await context().prisma.movie.findUnique({
      where: {
        id,
      },
      include: {
        files: true,
      },
    });

    if (!movie) {
      res.status(HttpStatus.NOT_FOUND).send();
    } else {
      // TODO: Improve this lol
      let filepath = movie.files[0].path;
      const b = path.basename(filepath);
      const possibilities = [
        filepath.replace(path.extname(filepath), ".jpg"),
        filepath.replace(b, b.toLocaleLowerCase().replace(path.extname(filepath), ".jpg")),
        filepath.replace(b, "Cover.jpg"),
        filepath.replace(b, "cover.jpg"),
      ];

      for (const p of possibilities) {
        if (fs.existsSync(p)) {
          res.sendFile(p);
          return;
        }
      }

      res.status(HttpStatus.NOT_FOUND).send();
    }
  }
}
