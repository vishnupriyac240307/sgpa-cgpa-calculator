import { Schema, model, Document, Types } from 'mongoose';

export interface IAcademicData extends Document {
  userId: Types.ObjectId;
  marks: Record<string, Record<string, number | null>>;
  createdAt: Date;
  updatedAt: Date;
}

const academicDataSchema = new Schema<IAcademicData>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    marks: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const AcademicData = model<IAcademicData>('AcademicData', academicDataSchema);
