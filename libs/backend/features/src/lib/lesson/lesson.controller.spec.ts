import { Test, TestingModule } from '@nestjs/testing';
import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';
import { ILesson, Role } from '@lingua/api';
import { Types } from 'mongoose';
import { CreateLessonDto } from '@lingua/dto';

const mockLessonId = new Types.ObjectId();
const mockUserId = new Types.ObjectId();
const mockCourseId = new Types.ObjectId();
const mockTeacherId = new Types.ObjectId();

const mockLesson: ILesson = {
  _id: mockLessonId,
  course: mockCourseId,
  teacher: mockTeacherId,
  students: [],
  status: 'open' as any,
  type: 'online' as any,
  isWorkshop: false,
  title: 'Test Lesson',
  day: new Date(),
  startTime: new Date(),
  endTime: new Date(),
};

const mockLessonService = {
  getAll: jest.fn().mockResolvedValue([mockLesson]),
  getOne: jest.fn().mockResolvedValue(mockLesson),
  create: jest.fn().mockResolvedValue(mockLesson),
  update: jest.fn().mockResolvedValue(mockLesson),
  delete: jest.fn().mockResolvedValue({ deleted: true }),
  attend: jest.fn().mockResolvedValue(mockLesson),
  unattend: jest.fn().mockResolvedValue(mockLesson),
};

describe('LessonController', () => {
  let controller: LessonController;
  let service: LessonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonController],
      providers: [
        {
          provide: LessonService,
          useValue: mockLessonService,
        },
      ],
    }).compile();

    controller = module.get<LessonController>(LessonController);
    service = module.get<LessonService>(LessonService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ----- CRUD Operations ----- //

  describe('getAll', () => {
    it('should return all lessons', async () => {
      const result = await controller.getAll();
      expect(service.getAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockLesson]);
    });
  });

  describe('getOne', () => {
    it('should return a single lesson by id', async () => {
      const result = await controller.getOne(mockLessonId);
      expect(service.getOne).toHaveBeenCalledWith(mockLessonId);
      expect(result).toEqual(mockLesson);
    });
  });

  describe('create', () => {
    it('should create a new lesson', async () => {
      const dto = new CreateLessonDto();
      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockLesson);
    });
  });

  describe('update', () => {
    it('should update a lesson by id', async () => {
      const body = { title: 'Updated Title' } as any;
      const result = await controller.update(mockLessonId, body);
      expect(service.update).toHaveBeenCalledWith(mockLessonId, body);
      expect(result).toEqual(mockLesson);
    });
  });

  describe('delete', () => {
    it('should delete a lesson by id', async () => {
      const result = await controller.delete(mockLessonId);
      expect(service.delete).toHaveBeenCalledWith(mockLessonId);
      expect(result).toEqual({ deleted: true });
    });
  });

  // ----- Business Operations ----- //

  describe('attend', () => {
    it('should register a student as attending a lesson', async () => {
      const mockUser = { id: mockUserId.toHexString() };
      const result = await controller.attend(mockLessonId, mockUser);
      expect(service.attend).toHaveBeenCalledWith(
        mockLessonId,
        Types.ObjectId.createFromHexString(mockUser.id),
      );
      expect(result).toEqual(mockLesson);
    });
  });

  describe('unattend', () => {
    it('should unregister a student from attending a lesson', async () => {
      const mockUser = { id: mockUserId.toHexString() };
      const result = await controller.unattend(mockLessonId, mockUser);
      expect(service.unattend).toHaveBeenCalledWith(
        mockLessonId,
        Types.ObjectId.createFromHexString(mockUser.id),
      );
      expect(result).toEqual(mockLesson);
    });
  });
});
