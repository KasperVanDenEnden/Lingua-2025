import { Test, TestingModule } from '@nestjs/testing';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { ICourse, Role } from '@lingua/api';
import { Types } from 'mongoose';
import { CreateCourseDto } from '@lingua/dto';

const mockCourseId = new Types.ObjectId();
const mockUserId = new Types.ObjectId();

const mockCourse: ICourse = {
  _id: mockCourseId,
  title: 'Test Course',
  description: 'Test Description',
  status: 'active' as any,
  language: 'dutch' as any,
  level: 'beginner' as any,
  price: 10,
  maxStudents: 20,
  starts: new Date(),
  ends: null,
  teachers: [mockUserId],
  students: [],
  reviews: [],
};

const mockCourseService = {
  getAll: jest.fn().mockResolvedValue([mockCourse]),
  getOne: jest.fn().mockResolvedValue(mockCourse),
  create: jest.fn().mockResolvedValue(mockCourse),
  update: jest.fn().mockResolvedValue(mockCourse),
  delete: jest.fn().mockResolvedValue({ deleted: true }),
  enroll: jest.fn().mockResolvedValue(mockCourse),
  unenroll: jest.fn().mockResolvedValue(mockCourse),
  getStudentDashboard: jest.fn().mockResolvedValue([mockCourse]),
};

describe('CourseController', () => {
  let controller: CourseController;
  let service: CourseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseController],
      providers: [
        {
          provide: CourseService,
          useValue: mockCourseService,
        },
      ],
    }).compile();

    controller = module.get<CourseController>(CourseController);
    service = module.get<CourseService>(CourseService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ----- CRUD Operations ----- //

  describe('getAll', () => {
    it('should return all courses', async () => {
      const result = await controller.getAll();
      expect(service.getAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockCourse]);
    });
  });

  describe('getOne', () => {
    it('should return a single course by id', async () => {
      const result = await controller.getOne(mockCourseId);
      expect(service.getOne).toHaveBeenCalledWith(mockCourseId);
      expect(result).toEqual(mockCourse);
    });
  });

  describe('create', () => {
    it('should create a new course', async () => {
      const dto = new CreateCourseDto();
      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockCourse);
    });
  });

  describe('update', () => {
    it('should update a course by id', async () => {
      const body = { title: 'Updated Title' } as any;
      const result = await controller.update(mockCourseId, body);
      expect(service.update).toHaveBeenCalledWith(mockCourseId, body);
      expect(result).toEqual(mockCourse);
    });
  });

  describe('delete', () => {
    it('should delete a course by id', async () => {
      const result = await controller.delete(mockCourseId);
      expect(service.delete).toHaveBeenCalledWith(mockCourseId);
      expect(result).toEqual({ deleted: true });
    });
  });

  // ----- Business Operations ----- //

  describe('enroll', () => {
    it('should enroll a student in a course', async () => {
      const mockUser = { id: mockUserId.toHexString() };
      const result = await controller.enroll(mockCourseId, mockUser);
      expect(service.enroll).toHaveBeenCalledWith(
        mockCourseId,
        Types.ObjectId.createFromHexString(mockUser.id)
      );
      expect(result).toEqual(mockCourse);
    });
  });

  describe('unenroll', () => {
    it('should unenroll a student from a course', async () => {
      const mockUser = { id: mockUserId.toHexString() };
      const result = await controller.unenroll(mockCourseId, mockUser);
      expect(service.unenroll).toHaveBeenCalledWith(
        mockCourseId,
        Types.ObjectId.createFromHexString(mockUser.id)
      );
      expect(result).toEqual(mockCourse);
    });
  });

  describe('getStudentDashboard', () => {
    it('should return the student dashboard', async () => {
      const mockUser = { id: mockUserId.toHexString() };
      const result = await controller.getStudentDashboard(mockUser);
      expect(service.getStudentDashboard).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual([mockCourse]);
    });
  });
});