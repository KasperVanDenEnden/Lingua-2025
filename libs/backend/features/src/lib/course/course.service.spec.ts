import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from './course.service';
import { getModelToken } from '@nestjs/mongoose';
import { NeoOperationsService } from '../neo4j/neo-operations.service';
import { HttpException } from '@nestjs/common';
import { Types } from 'mongoose';

// -----------------------------
// Mock helpers
// -----------------------------

function mockQuery(result: any) {
  return {
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(result),
  };
}

const createMockCourse = (overrides = {}) => ({
  _id: new Types.ObjectId(),
  students: [],
  teachers: [],
  deleteOne: jest.fn().mockResolvedValue(true),
  ...overrides,
});

// -----------------------------
// Mocks
// -----------------------------

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

// -----------------------------
// Test suite
// -----------------------------

describe('CourseService', () => {
  let service: CourseService;

  const courseId = new Types.ObjectId();
  const userId = new Types.ObjectId();

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

  // -----------------------------
  // GET ALL
  // -----------------------------

  describe('getAll', () => {
    it('should return all courses', async () => {
      const course = createMockCourse();

      mockCourseModel.find.mockReturnValue(mockQuery([course]));

      const result = await service.getAll();

      expect(result).toEqual([course]);
    });
  });

  // -----------------------------
  // GET ONE
  // -----------------------------

  describe('getOne', () => {
    it('should return course', async () => {
      const course = createMockCourse({ _id: courseId });

      mockCourseModel.findById.mockReturnValue(mockQuery(course));

      const result = await service.getOne(courseId);

      expect(result).toEqual(course);
    });

    it('should throw if not found', async () => {
      mockCourseModel.findById.mockReturnValue(mockQuery(null));

      await expect(service.getOne(courseId)).rejects.toThrow(HttpException);
    });
  });

  // -----------------------------
  // CREATE
  // -----------------------------

  // describe('create', () => {
  //   it('should create course and sync to neo4j', async () => {
  //     const course = createMockCourse();

  //     mockCourseModel.create.mockResolvedValue(course);

  //     const result = await service.create({} as any);

  //     expect(mockNeoService.mergeCourse).toHaveBeenCalledWith(course);
  //     expect(result).toEqual(course);
  //   });
  // });

  // -----------------------------
  // UPDATE
  // -----------------------------

  describe('update', () => {
    it('should update course', async () => {
      const course = createMockCourse();

      mockCourseModel.findByIdAndUpdate.mockResolvedValue(course);

      const result = await service.update(courseId, {} as any);

      expect(result).toEqual(course);
    });

    it('should throw if not found', async () => {
      mockCourseModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(service.update(courseId, {} as any)).rejects.toThrow(
        HttpException,
      );
    });
  });

  // -----------------------------
  // ENROLL
  // -----------------------------

  describe('enroll', () => {
    it('should enroll user', async () => {
      const course = createMockCourse({
        _id: courseId,
        students: [],
      });

      const updatedCourse = createMockCourse({
        _id: courseId,
        students: [userId],
      });

      mockCourseModel.findById.mockReturnValue(mockQuery(course));
      mockCourseModel.findByIdAndUpdate.mockReturnValue(
        mockQuery(updatedCourse),
      );

      const result = await service.enroll(courseId, userId);

      expect(mockNeoService.enrollInCourse).toHaveBeenCalled();
      expect(result.students).toContain(userId);
    });

    it('should throw if already enrolled', async () => {
      const course = createMockCourse({
        _id: courseId,
        students: [userId],
      });

      mockCourseModel.findById.mockReturnValue(mockQuery(course));

      await expect(service.enroll(courseId, userId)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw if course not found', async () => {
      mockCourseModel.findById.mockReturnValue(mockQuery(null));

      await expect(service.enroll(courseId, userId)).rejects.toThrow(
        HttpException,
      );
    });
  });

  // -----------------------------
  // UNENROLL
  // -----------------------------

  describe('unenroll', () => {
    it('should unenroll user', async () => {
      const course = createMockCourse({
        _id: courseId,
        students: [userId],
      });

      const updatedCourse = createMockCourse({
        _id: courseId,
        students: [],
      });

      mockCourseModel.findById.mockReturnValue(mockQuery(course));
      mockCourseModel.findByIdAndUpdate.mockReturnValue(
        mockQuery(updatedCourse),
      );

      const result = await service.unenroll(courseId, userId);

      expect(mockNeoService.unenrollInCourse).toHaveBeenCalled();
      expect(result).toEqual(updatedCourse);
    });

    it('should throw if not enrolled', async () => {
      const course = createMockCourse({
        _id: courseId,
        students: [],
      });

      mockCourseModel.findById.mockReturnValue(mockQuery(course));

      await expect(
        service.unenroll(courseId, userId),
      ).rejects.toThrow(HttpException);
    });
  });

  // -----------------------------
  // DASHBOARD
  // -----------------------------

  describe('getStudentDashboard', () => {
    it('should return aggregated dashboard', async () => {
      const resultMock = [{ title: 'Course', totalLessons: 5 }];

      mockCourseModel.aggregate.mockResolvedValue(resultMock);

      const result = await service.getStudentDashboard(
        userId.toHexString(),
      );

      expect(mockCourseModel.aggregate).toHaveBeenCalled();
      expect(result).toEqual(resultMock);
    });
  });
});