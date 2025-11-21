import mongoose, { Schema, Document } from 'mongoose';
import { IWordRecord, ReviewHistory } from '../types';

export interface IWordRecordDocument extends IWordRecord, Document {}

const ReviewHistorySchema = new Schema<ReviewHistory>({
  reviewedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  userRating: {
    type: String,
    enum: ['unknown', 'vague', 'mastered'],
    required: true
  },
  nextInterval: {
    type: Number,
    required: true
  }
}, { _id: false });

const WordRecordSchema = new Schema<IWordRecordDocument>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  word: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  translation: {
    type: String,
    required: true,
    trim: true
  },
  context: {
    type: String,
    trim: true
  },
  partOfSpeech: {
    type: String,
    trim: true
  },
  examples: [{
    type: String,
    trim: true
  }],
  phonetic: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastReviewedAt: {
    type: Date
  },
  nextReviewAt: {
    type: Date,
    required: true,
    default: function() {
      // 默认第二天复习
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
  },
  masteryLevel: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  reviewHistory: [ReviewHistorySchema]
}, {
  timestamps: true
});

// 复合索引
WordRecordSchema.index({ userId: 1, word: 1 });
WordRecordSchema.index({ userId: 1, nextReviewAt: 1 });
WordRecordSchema.index({ userId: 1, masteryLevel: 1 });

export const WordRecord = mongoose.model<IWordRecordDocument>('WordRecord', WordRecordSchema);

