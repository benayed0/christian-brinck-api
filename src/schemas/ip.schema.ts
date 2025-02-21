import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type IpDocument = HydratedDocument<Ip>;

@Schema()
export class Ip {
  @Prop({ required: true, unique: true })
  ip: string;

  @Prop({ required: true })
  name: string;
}

export const IpSchema = SchemaFactory.createForClass(Ip);
