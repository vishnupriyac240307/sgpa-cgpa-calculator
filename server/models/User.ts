import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  registerNo: string;
  username: string;
  email?: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    registerNo: {
      type: String,
      required: [true, 'Roll number / Register number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>('User', userSchema);
