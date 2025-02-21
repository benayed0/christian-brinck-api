import { Injectable } from '@nestjs/common';
import { Audio } from 'src/schemas/audio.schema';
import { Workbook } from 'exceljs';
import { HCS } from 'src/assets/hcs';
import { AudioService } from '../audio/audio.service';

@Injectable()
export class ExcelService {
  constructor(private videoService: AudioService) {}

  produce_excel_of_audios(audios: Audio[]) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('all_scores');

    const columns = this.get_columns().map(({ header, key }) => ({
      header,
      key,
      width: 20, // Adjust width as needed
    }));
    worksheet.getRow(1).font = { bold: true, size: 12 };

    worksheet.columns = columns;
    audios.forEach((video) => {
      worksheet.addRow(this.compute_lines(video));
    });
    return workbook;
  }
  get_columns(): { header: string; key: string }[] {
    const columns = [{ header: 'Student_Evaluated', key: 'name' }];
    let i = 1;
    for (const dimension in HCS) {
      for (const item in HCS[dimension]) {
        columns.push({ header: `Item${i}`, key: `${dimension}_${item}` });
        i += 1;
      }
      const dimension_header =
        dimension.split('')[0] + 'abit' + dimension.split('')[1];
      columns.push({ header: dimension_header, key: dimension });
    }
    columns.push({ header: 'Total', key: 'total' });
    columns.push({
      header: "Commentaires libres pour l'etudiant en medecine",
      key: 'comment1',
    });
    columns.push({
      header: "Commentaires libres pour l'acteur (Facultatif)",
      key: 'comment2',
    });
    columns.push({
      header:
        "Consultation interessante a garder en exemple (creation d'une videotheque)",
      key: 'comment3',
    });
    return columns;
  }
  compute_lines(video: Audio) {
    const columns = this.get_columns();
    const formated_name = video.original_name.split('.')[0];

    let line = {};
    for (const column in columns) {
      const key = columns[column].key;

      if (!key.startsWith('comment') || !key.startsWith('name')) {
        if (key.includes('_')) {
          const dimension = key.split('_')[0];
          const variable = key.split('_')[1];
          const score = this.videoService.getVariableScore(
            video.scores,
            dimension,
            variable,
          );
          line[key] = score === 0 ? 1 : score;
        } else {
          if (key === 'total') {
            line[key] = this.videoService.getTotalCost(video.scores);
          } else {
            line[key] = this.videoService.getDimensionScore(video.scores, key);
          }
        }
      }
    }
    line = {
      ...line,
      ...{
        name: formated_name,
        comment1: '',
        comment2: '',
        comment3: '',
      },
    };

    return line;
  }
}
