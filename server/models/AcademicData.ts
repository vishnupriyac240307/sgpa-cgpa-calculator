import { Schema, model, Document, Types } from 'mongoose';

export interface IAcademicData extends Document {
  userId: Types.ObjectId;
  marksMap: Record<string, number | null>;
  inclusionsMap: Record<string, boolean>;
  electivesMap: Record<string, string>;
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
    marksMap: {
      type: Schema.Types.Mixed,
      default: {},
    },
    inclusionsMap: {
      type: Schema.Types.Mixed,
      default: {},
    },
    electivesMap: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const AcademicData = model<IAcademicData>('AcademicData', academicDataSchema);
