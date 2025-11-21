import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types';

export interface IUserDocument extends IUser, Document {}

const UserSchema = new Schema<IUserDocument>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  openaiUserId: {
    type: String,
    sparse: true
  },
  /**
   * 标记该用户是否最初是通过 MCP / ChatGPT 自动创建的
   * 方便之后在前端注册时进行账号“补全”而不是阻止注册
   */
  fromMcp: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date
  }
}, {
  timestamps: true
});

// 索引
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ openaiUserId: 1 });

export const User = mongoose.model<IUserDocument>('User', UserSchema);

