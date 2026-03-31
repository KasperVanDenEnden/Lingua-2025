import { Id, IUpdateUser, IUser } from '@lingua/api';
import { Course, CourseDocument, Lesson, LessonDocument, User, UserDocument } from '@lingua/schemas';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { NeoOperationsService } from '../neo4j/neo-operations.service';

@Injectable()
export class UserService {
  private TAG = 'UserService';

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    private neoService: NeoOperationsService
  ) {}

  async getAll(): Promise<IUser[]> {
    Logger.log('getAll', this.TAG);
    return await this.userModel.find();
  }

  async getOne(id: Id): Promise<IUser> {
    Logger.log('getOne', this.TAG);

    const user = await this.userModel.findById(id).populate('friends').exec();

    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    return user;
  }

  async create(body: IUser): Promise<IUser> {
    Logger.log('create', this.TAG);

    const user = await this.userModel.findOne({ email: body.email });
    if (user) throw new HttpException('Email is not unique', HttpStatus.FOUND);

    body.password = bcrypt.hashSync(body.password, 10);
    
    const mongoUser = await this.userModel.create(body);

    await this.neoService.mergeUser(mongoUser);

    return mongoUser;
  }

  async update(id: Id, changes: IUpdateUser): Promise<IUser> {
    Logger.log('update', this.TAG);

    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      changes,
      { new: true }
    );

    if (!updatedUser)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    return updatedUser;
  }

  async delete(id: Types.ObjectId) {
    Logger.log('delete', this.TAG);

    const session = await this.userModel.db.startSession();
    session.startTransaction();

    try {
      const deletedUser = await this.userModel.findByIdAndDelete(id, { session });
      if (!deletedUser) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

      await this.lessonModel.updateMany(
        { students: deletedUser._id },
        { $pull: { students: deletedUser._id } },
        { session }
      );

      await this.courseModel.updateMany(
        { $or: [{ students: deletedUser._id }, { 'reviews.student': deletedUser._id }] },
        { $pull: { students: deletedUser._id, reviews: { student: deletedUser._id } } },
        { session }
      );

      await this.neoService.detachUser(id);

      await session.commitTransaction();
      return new HttpException('User deleted successfully', HttpStatus.OK);

    } catch (error) {
      await session.abortTransaction();
      throw error;
    }  finally {
      await session.endSession();
    }
  }

  // === Friends === // 
  async follow(userId: Id, friendId: Id) {
    Logger.log('follow', this.TAG);

    const user = await this.userModel.findById(userId).exec();
    const friend = await this.userModel.findById(friendId).exec();

    if (!user || !friend) 
      throw new HttpException('User or friend has not been found', HttpStatus.NOT_FOUND);

    if (user.friends.some(id => id.toString() === friendId.toString()))
      throw new HttpException('Already following this user', HttpStatus.BAD_REQUEST);

    await this.userModel.findByIdAndUpdate(userId, { $addToSet: { friends: friendId } });
    await this.neoService.followUser(userId.toString(), friendId.toString());
    
    return new HttpException('Followed user', HttpStatus.OK)
  }

  async unfollow(userId: any, friendId: Id) {
    Logger.log('unfollwo', this.TAG);

    const user = await this.userModel.findById(userId).exec();
    const friend = await this.userModel.findById(friendId).exec();

    if (!user || !friend) 
      throw new HttpException('User or friend has not been found', HttpStatus.NOT_FOUND);

    if (!user.friends.some(id => id.toString() === friendId.toString()))
      throw new HttpException('Not following this user', HttpStatus.BAD_REQUEST);

    await this.userModel.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await this.neoService.unfollowUser(userId.toString(), friendId.toString());

    return new HttpException('Unfollowed user', HttpStatus.OK)
  }
}
