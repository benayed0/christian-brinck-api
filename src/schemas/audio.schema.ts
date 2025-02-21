import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, Schema as s, Types } from 'mongoose';

export type AudioDocument = HydratedDocument<Audio>;

@Schema()
export class Audio {
  @Prop({ required: true, unique: true })
  audio_id: string;

  @Prop({ required: true })
  original_name: string;
  @Prop({ required: true })
  model_name: string;
  @Prop({})
  doctor_name: string;

  @Prop({ required: true })
  author_id: Types.ObjectId;

  @Prop({ default: 'uploaded' })
  state: string;

  @Prop({ default: false })
  audio_uploaded: boolean;
  @Prop()
  finishedAt: Date;
  @Prop({ type: {} })
  scores: {
    [dimension: string]: {
      [variable: string]: {
        1: {
          start: number;
          end: number;
          text: string;
        }[];
        3: {
          start: number;
          end: number;
          text: string;
        }[];
        5: {
          start: number;
          end: number;
          text: string;
        }[];
      };
    };
  };
}

export const AudioSchema = SchemaFactory.createForClass(Audio);
