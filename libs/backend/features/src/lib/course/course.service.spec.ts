import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from './course.service';
import { getModelToken } from '@nestjs/mongoose';
import { NeoOperationsService } from '../neo4j/neo-operations.service';
import { HttpException } from '@nestjs/common';
import { Types } from 'mongoose';

const mockCourseId = new Types.ObjectId();
const mockUserId = new Types.ObjectId();

const mockCourse = {
  _id: mockCourseId,
  students: [],
  teachers: [],
  deleteOne: jest.fn(),
};

const mockCourseWithStudent = {
  ...mockCourse,
  students: [mockUserId],
};

const mockCourseModel = {
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  aggregate: jest.fn(),
};

const mockNeoService = {
  mergeCourse: jest.fn(),
  detachCourse: jest.fn(),
  enrollInCourse: jest.fn(),
  unenrollInCourse: jest.fn(),
};

describe('CourseService', () => {
  let service: CourseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        { provide: getModelToken('Course'), useValue: mockCourseModel },
        { provide: NeoOperationsService, useValue: mockNeoService },
      ],
    }).compile();

    service = module.get<CourseService>(CourseService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ----- GET ALL ----- //

  describe('getAll', () => {
    it('should return all courses', async () => {
      mockCourseModel.find.mockResolvedValue([mockCourse]);

      const result = await service.getAll();

      expect(result).toEqual([mockCourse]);
    });
  });

  // ----- GET ONE ----- //

  describe('getOne', () => {
    it('should return course with populate', async () => {
      mockCourseModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCourse),
      });

      const result = await service.getOne(mockCourseId);

      expect(result).toEqual(mockCourse);
    });

    it('should throw if not found', async () => {
      mockCourseModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getOne(mockCourseId)).rejects.toThrow(HttpException);
    });
  });

  // ----- CREATE ----- //

  describe('create', () => {
    it('should create course', async () => {
      mockCourseModel.create.mockResolvedValue(mockCourse);

      const result = await service.create({} as any);

      expect(mockNeoService.mergeCourse).toHaveBeenCalledWith(mockCourse);
      expect(result).toEqual(mockCourse);
    });
  });

  // ----- UPDATE ----- //

  describe('update', () => {
    it('should update course', async () => {
      mockCourseModel.findByIdAndUpdate.mockResolvedValue(mockCourse);

      const result = await service.update(mockCourseId, {} as any);

      expect(result).toEqual(mockCourse);
    });

    it('should throw if not found', async () => {
      mockCourseModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(service.update(mockCourseId, {} as any)).rejects.toThrow(
        HttpException,
      );
    });
  });

  // ----- DELETE ----- //

  describe('delete', () => {
    it('should delete course', async () => {
      mockCourseModel.findById.mockResolvedValue(mockCourse);

      const result = await service.delete(mockCourseId);

      expect(mockCourse.deleteOne).toHaveBeenCalled();
      expect(mockNeoService.detachCourse).toHaveBeenCalledWith(
        mockCourseId.toString(),
      );
      expect(result).toBeInstanceOf(HttpException);
    });

    it('should throw if not found', async () => {
      mockCourseModel.findById.mockResolvedValue(null);

      await expect(service.delete(mockCourseId)).rejects.toThrow(HttpException);
    });
  });

  // ----- ENROLL ----- //

  describe('enroll', () => {
    it('should enroll user', async () => {
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      });

      mockCourseModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockCourse,
          students: [mockUserId],
        }),
      });

      const result = await service.enroll(mockCourseId, mockUserId);

      expect(mockNeoService.enrollInCourse).toHaveBeenCalled();
      expect(result.students).toContain(mockUserId);
    });

    it('should throw if already enrolled', async () => {
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourseWithStudent),
      });

      await expect(service.enroll(mockCourseId, mockUserId)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw if course not found', async () => {
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.enroll(mockCourseId, mockUserId)).rejects.toThrow(
        HttpException,
      );
    });
  });

  // ----- UNENROLL ----- //

  describe('unenroll', () => {
    it('should unenroll user', async () => {
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourseWithStudent),
      });

      mockCourseModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      });

      const result = await service.unenroll(mockCourseId, mockUserId);

      expect(mockNeoService.unenrollInCourse).toHaveBeenCalled();
      expect(result).toEqual(mockCourse);
    });

    it('should throw if not enrolled', async () => {
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      });

      await expect(service.unenroll(mockCourseId, mockUserId)).rejects.toThrow(
        HttpException,
      );
    });
  });

  // ----- DASHBOARD ----- //

  describe('getStudentDashboard', () => {
    it('should return aggregated dashboard', async () => {
      const mockResult = [{ title: 'Course', totalLessons: 5 }];

      mockCourseModel.aggregate.mockResolvedValue(mockResult);

      const result = await service.getStudentDashboard(
        mockUserId.toHexString(),
      );

      expect(mockCourseModel.aggregate).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });
});
