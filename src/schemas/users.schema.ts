import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UsersDocument = HydratedDocument<Users>;

@Schema()
export class Users {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;
  @Prop({ default: 'mistral' })
  last_used_model: string;
  @Prop({ default: false })
  is_confirmed: boolean;
  @Prop({ default: false })
  is_admin: boolean;
}

export const UsersSchema = SchemaFactory.createForClass(Users);
