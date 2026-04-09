import { Test, TestingModule } from '@nestjs/testing';
import { LessonService } from './lesson.service';
import { getModelToken } from '@nestjs/mongoose';
import { NeoOperationsService } from '../neo4j/neo-operations.service';
import { HttpException } from '@nestjs/common';
import { Types } from 'mongoose';

const mockLessonId = new Types.ObjectId();
const mockUserId = new Types.ObjectId();

const futureDate = new Date(Date.now() + 1000000);

const mockCourse = {
  _id: new Types.ObjectId(),
  students: [mockUserId],
  maxStudents: 10,
};

const baseLesson = {
  _id: mockLessonId,
  day: futureDate,
  students: [],
  course: mockCourse,
};

const mockLessonModel = {
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

const mockNeoService = {
  mergeLesson: jest.fn(),
  detachLesson: jest.fn(),
  attendLesson: jest.fn(),
  unattendLesson: jest.fn(),
};

describe('LessonService', () => {
  let service: LessonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonService,
        { provide: getModelToken('Lesson'), useValue: mockLessonModel },
        { provide: NeoOperationsService, useValue: mockNeoService },
      ],
    }).compile();

    service = module.get<LessonService>(LessonService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ----- GET ALL ----- //

  describe('getAll', () => {
    it('should return lessons with populate', async () => {
      const execMock = jest.fn().mockResolvedValue([baseLesson]);

      mockLessonModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: execMock,
      });

      const result = await service.getAll();

      expect(result).toEqual([baseLesson]);
    });
  });

  // ----- GET ONE ----- //

  describe('getOne', () => {
    it('should return a lesson', async () => {
      mockLessonModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(baseLesson),
      });

      const result = await service.getOne(mockLessonId);

      expect(result).toEqual(baseLesson);
    });

    it('should throw if not found', async () => {
      mockLessonModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getOne(mockLessonId)).rejects.toThrow(HttpException);
    });
  });

  // ----- CREATE ----- //

  describe('create', () => {
    it('should create lesson', async () => {
      mockLessonModel.create.mockResolvedValue(baseLesson);

      const result = await service.create({} as any);

      expect(mockNeoService.mergeLesson).toHaveBeenCalledWith(baseLesson);
      expect(result).toEqual(baseLesson);
    });
  });

  // ----- UPDATE ----- //

  describe('update', () => {
    it('should update lesson', async () => {
      mockLessonModel.findByIdAndUpdate.mockResolvedValue(baseLesson);

      const result = await service.update(mockLessonId, {} as any);

      expect(result).toEqual(baseLesson);
    });

    it('should throw if not found', async () => {
      mockLessonModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(service.update(mockLessonId, {} as any)).rejects.toThrow(
        HttpException,
      );
    });
  });

  // ----- DELETE ----- //

  describe('delete', () => {
    it('should delete lesson', async () => {
      mockLessonModel.findByIdAndDelete.mockResolvedValue(baseLesson);

      const result = await service.delete(mockLessonId);

      expect(mockNeoService.detachLesson).toHaveBeenCalledWith(mockLessonId);
      expect(result).toEqual(baseLesson);
    });

    it('should throw if not found', async () => {
      mockLessonModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(service.delete(mockLessonId)).rejects.toThrow(HttpException);
    });
  });

  // ----- ATTEND ----- //

  describe('attend', () => {
    it('should attend lesson', async () => {
      mockLessonModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(baseLesson),
      });

      mockLessonModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...baseLesson,
          students: [mockUserId],
        }),
      });

      const result = await service.attend(mockLessonId, mockUserId);

      expect(mockLessonModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockLessonId,
        { $addToSet: { students: mockUserId } },
        { new: true },
      );

      expect(mockNeoService.attendLesson).toHaveBeenCalled();

      expect(result.students).toContain(mockUserId);
    });

    it('should throw if lesson not found', async () => {
      mockLessonModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.attend(mockLessonId, mockUserId)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw if lesson in past', async () => {
      const pastLesson = { ...baseLesson, day: new Date(Date.now() - 1000) };

      mockLessonModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(pastLesson),
      });

      await expect(service.attend(mockLessonId, mockUserId)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw if already attending', async () => {
      const lesson = { ...baseLesson, students: [mockUserId] };

      mockLessonModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(lesson),
      });

      await expect(service.attend(mockLessonId, mockUserId)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw if not enrolled in course', async () => {
      const lesson = {
        ...baseLesson,
        course: { ...mockCourse, students: [] },
      };

      mockLessonModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(lesson),
      });

      await expect(service.attend(mockLessonId, mockUserId)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw if lesson is full', async () => {
      const lesson = {
        ...baseLesson,
        students: Array(10).fill(new Types.ObjectId()),
      };

      mockLessonModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(lesson),
      });

      await expect(service.attend(mockLessonId, mockUserId)).rejects.toThrow(
        HttpException,
      );
    });
  });

  // ----- UNATTEND ----- //

  describe('unattend', () => {
    it('should unattend lesson', async () => {
      const lesson = { ...baseLesson, students: [mockUserId] };

      mockLessonModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(lesson),
      });

      mockLessonModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(baseLesson),
      });

      const result = await service.unattend(mockLessonId, mockUserId);

      expect(mockNeoService.unattendLesson).toHaveBeenCalled();
      expect(result).toEqual(baseLesson);
    });

    it('should throw if not attending', async () => {
      mockLessonModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(baseLesson),
      });

      await expect(service.unattend(mockLessonId, mockUserId)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
