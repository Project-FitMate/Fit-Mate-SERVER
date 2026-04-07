import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { readdir, unlink } from 'fs/promises';
import { join, parse } from 'path';

@Injectable()
export class TasksService {
  @Cron('0 0 * * * *') // 매 시간 정각
  async eraseOrphanTempFiles() {
    const tempFiles = await readdir(join(process.cwd(), 'public', 'temp'));

    const deletedFiles = tempFiles.filter((file) => {
      const filename = parse(file).name;

      // filename 예시: 15f7b996-74c1-4757-bf9e-00352109c059_1753520645048
      const split = filename.split('_');
      if (split.length !== 2) {
        return true;
      }

      try {
        const now = Date.now();
        const fileTimestamp = Number(split[split.length - 1]);
        const aDayInMs = 24 * 60 * 60 * 1000;

        return now - fileTimestamp > aDayInMs;
      } catch (e) {
        return true;
      }
    });

    await Promise.all(
      deletedFiles.map((file) =>
        unlink(join(process.cwd(), 'public', 'temp', file)),
      ),
    );
  }
}
