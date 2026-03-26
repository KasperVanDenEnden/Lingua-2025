import { MongoMemoryServer } from 'mongodb-memory-server';
import { Lesson, LessonSchema } from './lesson.schema';
import { disconnect, Model, Types } from 'mongoose';
import { Test } from '@nestjs/testing';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { validate } from 'class-validator';
import { LessonStatus, LessonType } from '@lingua/api';

describe('LessonSchema Tests', () => {
  let mongod: MongoMemoryServer;
  let lessonModel: Model<Lesson>;
  let baseBody: Partial<Lesson>;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: async () => {
            mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            return { uri };
          },
        }),
        MongooseModule.forFeature([
          {
            name: Lesson.name,
            schema: LessonSchema,
          },
        ]),
      ],
    }).compile();
    lessonModel = app.get<Model<Lesson>>(getModelToken(Lesson.name));
    await lessonModel.ensureIndexes();
  });

  beforeEach(() => {
    baseBody = {
      course: new Types.ObjectId(),
      teacher: new Types.ObjectId(),
      students: [new Types.ObjectId()], // FIX: lege array faalt door @IsNotEmpty()
      status: LessonStatus.Open,
      type: LessonType.Grammar,        // NIEUW: ontbrak in baseBody
      isWorkshop: false,              // NIEUW: ontbrak in baseBody
      title: 'Test title',
      day: new Date(),
      startTime: new Date(),
      endTime: new Date(),
    };
  });

  afterAll(async () => {
    await disconnect();
    await mongod.stop();
  });

  it('should pass validation with valid data', async () => {
    const body = { ...baseBody };
    const plain = Object.assign(new Lesson(), body);
    const errors = await validate(plain);
    expect(errors.length).toBe(0);
  });

  // === Missing === //

  it('should fail validation if course is missing', async () => {
    const body = { ...baseBody, course: undefined };
    const plain = Object.assign(new Lesson(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('course');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'course should not be empty'
    );
  });

  it('should fail validation if teacher is missing', async () => {
    const body = { ...baseBody, teacher: undefined };
    const plain = Object.assign(new Lesson(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('teacher');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'teacher should not be empty'
    );
  });

  it('should fail validation if status is missing', async () => {
    const body = { ...baseBody, status: undefined };
    const plain = Object.assign(new Lesson(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('status');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'status should not be empty'
    );
  });

  it('should fail validation if type is missing', async () => {
    const body = { ...baseBody, type: undefined };
    const plain = Object.assign(new Lesson(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('type');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'type should not be empty'
    );
  });

  it('should fail validation if isWorkshop is missing', async () => {
    const body = { ...baseBody, isWorkshop: undefined };
    const plain = Object.assign(new Lesson(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('isWorkshop');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'isWorkshop should not be empty'
    );
  });

  it('should fail validation if title is missing', async () => {
    const body = { ...baseBody, title: undefined };
    const plain = Object.assign(new Lesson(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('title');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'title should not be empty'
    );
  });

  it('should fail validation if day is missing', async () => {
    const body = { ...baseBody, day: undefined };
    const plain = Object.assign(new Lesson(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('day');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'day should not be empty'
    );
  });

  it('should fail validation if startTime is missing', async () => {
    const body = { ...baseBody, startTime: undefined };
    const plain = Object.assign(new Lesson(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('startTime');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'startTime should not be empty'
    );
  });

  it('should fail validation if endTime is missing', async () => {
    const body = { ...baseBody, endTime: undefined };
    const plain = Object.assign(new Lesson(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('endTime');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'endTime should not be empty'
    );
  });

  // === Invalid type === //
  it('should fail validation if status is invalid type', async () => {
    const body = { ...baseBody, status: 0 };
    const plain = Object.assign(new Lesson(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('status');
    expect(errors[0].constraints?.['isEnum']).toBe(
      'Status must be a valid enum value'
    );
  });

  it('should fail validation if type is invalid type', async () => {
    const body = { ...baseBody, type: 0 };
    const plain = Object.assign(new Lesson(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('type');
    expect(errors[0].constraints?.['isEnum']).toBe(
      'Type must be a valid enum value'
    );
  });

  it('should fail validation if isWorkshop is invalid type', async () => {
    const body = { ...baseBody, isWorkshop: 'not-a-boolean' };
    const plain = Object.assign(new Lesson(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('isWorkshop');
    expect(errors[0].constraints?.['isBoolean']).toBeDefined();
  });

  it('should fail validation if title is invalid type', async () => {
    const body = { ...baseBody, title: 0 };
    const plain = Object.assign(new Lesson(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('title');
    expect(errors[0].constraints?.['isString']).toBe('title must be a string');
  });

  it('should fail validation if day is invalid type', async () => {
    const body = { ...baseBody, day: 'not-a-date' };
    const plain = Object.assign(new Lesson(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('day');
    expect(errors[0].constraints?.['isDate']).toBe(
      'day must be a Date instance'
    );
  });

  it('should fail validation if startTime is invalid type', async () => {
    const body = { ...baseBody, startTime: 'invalid' };
    const plain = Object.assign(new Lesson(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('startTime');
    expect(errors[0].constraints?.['isDate']).toBe(
      'startTime must be a Date instance'
    );
  });

  it('should fail validation if endTime is invalid type', async () => {
    const body = { ...baseBody, endTime: 'invalid' };
    const plain = Object.assign(new Lesson(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('endTime');
    expect(errors[0].constraints?.['isDate']).toBe(
      'endTime must be a Date instance'
    );
  });
});