import { Injectable } from '@nestjs/common';
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
interface transcription {
  left_channel: { start: number; end: number; text: string }[];
  right_channel: { start: number; end: number; text: string }[];
}
@Injectable()
export class DocxService {
  async createDoc(title: string, transcription: transcription) {
    const formatTime = (s: number) =>
      `${Math.floor(s / 60)
        .toString()
        .padStart(2, '0')}:${Math.floor(s % 60)
        .toString()
        .padStart(2, '0')}`;
    const all = [
      ...transcription.left_channel.map((e) => ({
        text: e.text,
        start: e.start,
        channel: 'Left',
      })),
      ...transcription.right_channel.map((e) => ({
        text: e.text,
        start: e.start,
        channel: 'Right',
      })),
    ];

    const sorted = all.sort((a, b) => a.start - b.start);
    console.log(sorted);

    const children = sorted.map(
      (item) =>
        new Paragraph({
          children: [
            new TextRun({
              text: `- ${formatTime(item.start)} | Channel: ${item.channel} | `,
              bold: true,
            }),
            new TextRun(item.text),
          ],
        }),
    );

    // Documents contain sections, you can have multiple sections per document, go here to learn more about sections
    // This simple example will only contain one section
    const doc = new Document({
      title,
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: 'AI Transcription of : ' + title,
              heading: HeadingLevel.TITLE,
            }),
            ...children,
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer;
  }
}
