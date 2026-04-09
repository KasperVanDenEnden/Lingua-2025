import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { NeoOperationsService } from '../neo4j/neo-operations.service';
import { HttpException } from '@nestjs/common';
import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockUserId = new Types.ObjectId();
const mockFriendId = new Types.ObjectId();

const mockUser = {
  _id: mockUserId,
  email: 'test@test.com',
  password: 'hashed',
  friends: [],
};

const mockFriend = {
  _id: mockFriendId,
  email: 'friend@test.com',
  password: 'hashed',
  friends: [],
};

const mockSession = {
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  abortTransaction: jest.fn(),
  endSession: jest.fn(),
};

const mockUserModel = {
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  db: {
    startSession: jest.fn().mockResolvedValue(mockSession),
  },
};

const mockLessonModel = {
  updateMany: jest.fn(),
};

const mockCourseModel = {
  updateMany: jest.fn(),
};

const mockNeoService = {
  mergeUser: jest.fn(),
  detachUser: jest.fn(),
  followUser: jest.fn(),
  unfollowUser: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getModelToken('User'), useValue: mockUserModel },
        { provide: getModelToken('Lesson'), useValue: mockLessonModel },
        { provide: getModelToken('Course'), useValue: mockCourseModel },
        { provide: NeoOperationsService, useValue: mockNeoService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ----- BASIC CRUD ----- //

  describe('getAll', () => {
    it('should return all users', async () => {
      mockUserModel.find.mockResolvedValue([mockUser]);

      const result = await service.getAll();

      expect(mockUserModel.find).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('getOne', () => {
    it('should return a user', async () => {
      mockUserModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        })
      });

      const result = await service.getOne(mockUserId);

      expect(result).toEqual(mockUser);
    });

    it('should throw if not found', async () => {
      mockUserModel.findById.mockReturnValue({
          populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        })
      });

      await expect(service.getOne(mockUserId)).rejects.toThrow(HttpException);
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      (bcrypt.hashSync as jest.Mock).mockReturnValue('hashed');
      mockUserModel.create.mockResolvedValue(mockUser);

      const result = await service.create({
        ...mockUser,
        password: 'plain',
      } as any);

      expect(bcrypt.hashSync).toHaveBeenCalled();
      expect(mockNeoService.mergeUser).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw if email exists', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      await expect(service.create(mockUser as any)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      mockUserModel.findByIdAndUpdate.mockResolvedValue(mockUser);

      const result = await service.update(mockUserId, {
        email: 'new@test.com',
      });

      expect(result).toEqual(mockUser);
    });

    it('should throw if not found', async () => {
      mockUserModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(service.update(mockUserId, {} as any)).rejects.toThrow(
        HttpException,
      );
    });
  });

  // ----- DELETE (TRANSACTION) ----- //

  describe('delete', () => {
    it('should delete user and cleanup relations', async () => {
      mockUserModel.findByIdAndDelete.mockResolvedValue(mockUser);

      const result = await service.delete(mockUserId);

      expect(mockUserModel.db.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();

      expect(mockLessonModel.updateMany).toHaveBeenCalled();
      expect(mockCourseModel.updateMany).toHaveBeenCalled();
      expect(mockNeoService.detachUser).toHaveBeenCalledWith(mockUserId);

      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();

      expect(result).toBeInstanceOf(HttpException);
    });

    it('should rollback on error', async () => {
      mockUserModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(service.delete(mockUserId)).rejects.toThrow();

      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });
  });

  // ----- FOLLOW ----- //

  describe('follow', () => {
    it('should follow a user', async () => {
      mockUserModel.findById
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockUser) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockFriend) });

      const result = await service.follow(mockUserId, mockFriendId);

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(mockNeoService.followUser).toHaveBeenCalled();

      expect(result).toBeInstanceOf(HttpException);
    });

    it('should throw if already following', async () => {
      const userWithFriend = {
        ...mockUser,
        friends: [mockFriendId],
      };

      mockUserModel.findById
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(userWithFriend),
        })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockFriend) });

      await expect(service.follow(mockUserId, mockFriendId)).rejects.toThrow(
        HttpException,
      );
    });
  });

  // ----- UNFOLLOW ----- //

  describe('unfollow', () => {
    it('should unfollow a user', async () => {
      const userWithFriend = {
        ...mockUser,
        friends: [mockFriendId],
      };

      mockUserModel.findById
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(userWithFriend),
        })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockFriend) });

      const result = await service.unfollow(mockUserId, mockFriendId);

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(mockNeoService.unfollowUser).toHaveBeenCalled();

      expect(result).toBeInstanceOf(HttpException);
    });

    it('should throw if not following', async () => {
      mockUserModel.findById
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockUser) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockFriend) });

      await expect(service.unfollow(mockUserId, mockFriendId)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
