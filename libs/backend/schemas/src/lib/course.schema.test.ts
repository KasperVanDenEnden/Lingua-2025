import { MongoMemoryServer } from 'mongodb-memory-server';
import { Course, CourseSchema } from './course.schema';
import { disconnect, Model, Types } from 'mongoose';
import { Test } from '@nestjs/testing';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { CourseStatus, Language, Level } from '@lingua/api';
import { validate } from 'class-validator';

describe('CourseSchema Tests', () => {
  let mongod: MongoMemoryServer;
  let courseModel: Model<Course>;
  let baseBody: Partial<Course>;

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
            name: Course.name,
            schema: CourseSchema,
          },
        ]),
      ],
    }).compile();
    courseModel = app.get<Model<Course>>(getModelToken(Course.name));
    await courseModel.ensureIndexes();
  });

  beforeEach(() => {
    baseBody = {
      title: 'Title',
      description: 'Description',
      status: CourseStatus.Active,
      language: Language.Dutch,
      level: Level.A1,
      price: 10,
      maxStudents: 10,
      starts: new Date(),
      teachers: [new Types.ObjectId()],
      students: [new Types.ObjectId(), new Types.ObjectId()],
      reviews: [],
    };
  });

  afterAll(async () => {
    await disconnect();
    await mongod.stop();
  });

  it('should pass validation with valid data', async () => {
    const body = { ...baseBody };
    const plain = Object.assign(new Course(), body);
    const errors = await validate(plain);
    expect(errors.length).toBe(0);
  });

  // === Missing === //

  it('should fail validation if title is missing', async () => {
    const body = { ...baseBody, title: undefined };
    const plain = Object.assign(new Course(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('title');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'title should not be empty'
    );
  });

  it('should fail validation if description is missing', async () => {
    const body = { ...baseBody, description: undefined };
    const plain = Object.assign(new Course(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('description');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'description should not be empty'
    );
  });

  it('should fail validation if status is missing', async () => {
    const body = { ...baseBody, status: undefined };
    const plain = Object.assign(new Course(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('status');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'status should not be empty'
    );
  });

  it('should fail validation if language is missing', async () => {
    const body = { ...baseBody, language: undefined };
    const plain = Object.assign(new Course(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('language');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'language should not be empty'
    );
  });

  it('should fail validation if level is missing', async () => {
    const body = { ...baseBody, level: undefined };
    const plain = Object.assign(new Course(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('level');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'level should not be empty'
    );
  });

  it('should fail validation if price is missing', async () => {
    const body = { ...baseBody, price: undefined };
    const plain = Object.assign(new Course(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('price');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'price should not be empty'
    );
  });

  it('should fail validation if maxStudents is missing', async () => {
    const body = { ...baseBody, maxStudents: undefined };
    const plain = Object.assign(new Course(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('maxStudents');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'maxStudents should not be empty'
    );
  });

  it('should fail validation if starts is missing', async () => {
    const body = { ...baseBody, starts: undefined };
    const plain = Object.assign(new Course(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('starts');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'starts should not be empty'
    );
  });

  it('should fail validation if teachers is missing', async () => {
    const body = { ...baseBody, teachers: undefined };
    const plain = Object.assign(new Course(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('teachers');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'teachers should not be empty'
    );
  });

  // === Invalid type === //

  it('should fail validation if title is invalid type', async () => {
    const body = { ...baseBody, title: 0 };
    const plain = Object.assign(new Course(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('title');
    expect(errors[0].constraints?.['isString']).toBe('title must be a string');
  });

  it('should fail validation if description is invalid type', async () => {
    const body = { ...baseBody, description: 0 };
    const plain = Object.assign(new Course(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('description');
    expect(errors[0].constraints?.['isString']).toBe(
      'description must be a string'
    );
  });

  it('should fail validation if status is invalid type', async () => {
    const body = { ...baseBody, status: 0 };
    const plain = Object.assign(new Course(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('status');
    expect(errors[0].constraints?.['isEnum']).toBe(
      'Status must be a valid enum value'
    );
  });

  it('should fail validation if language is invalid type', async () => {
    const body = { ...baseBody, language: 0 };
    const plain = Object.assign(new Course(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('language');
    expect(errors[0].constraints?.['isEnum']).toBe(
      'Language must be a valid enum value'
    );
  });

  it('should fail validation if level is invalid type', async () => {
    const body = { ...baseBody, level: 0 };
    const plain = Object.assign(new Course(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('level');
    expect(errors[0].constraints?.['isEnum']).toBe(
      'Level must be a valid enum value'
    );
  });

  it('should fail validation if price is invalid type', async () => {
    const body = { ...baseBody, price: 'invalid' };
    const plain = Object.assign(new Course(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('price');
    expect(errors[0].constraints?.['isNumber']).toBeDefined();
  });

  it('should fail validation if maxStudents is invalid type', async () => {
    const body = { ...baseBody, maxStudents: 'invalid' };
    const plain = Object.assign(new Course(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('maxStudents');
    expect(errors[0].constraints?.['isNumber']).toBeDefined();
  });

  it('should fail validation if starts is invalid type', async () => {
    const body = { ...baseBody, starts: 'not-a-date' };
    const plain = Object.assign(new Course(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('starts');
    expect(errors[0].constraints?.['isDate']).toBeDefined();
  });

  // === Boundary values === //

  it('should fail validation if price exceeds maximum', async () => {
    const body = { ...baseBody, price: 51 };
    const plain = Object.assign(new Course(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('price');
    expect(errors[0].constraints?.['max']).toBe('price cannot exceed 50,00');
  });

  it('should fail validation if price is negative', async () => {
    const body = { ...baseBody, price: -1 };
    const plain = Object.assign(new Course(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('price');
    expect(errors[0].constraints?.['min']).toBe('price cannot be negative');
  });

  it('should fail validation if maxStudents exceeds maximum', async () => {
    const body = { ...baseBody, maxStudents: 21 };
    const plain = Object.assign(new Course(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('maxStudents');
    expect(errors[0].constraints?.['max']).toBe(
      'maxStudents cannot exceed 20'
    );
  });

  // === Optional fields === //

  it('should pass validation if ends is null', async () => {
    const body = { ...baseBody, ends: null };
    const plain = Object.assign(new Course(), body);
    const errors = await validate(plain);
    expect(errors.length).toBe(0);
  });

  it('should pass validation if ends is omitted', async () => {
    const body = { ...baseBody, ends: undefined };
    const plain = Object.assign(new Course(), body);
    const errors = await validate(plain);
    expect(errors.length).toBe(0);
  });

  it('should fail validation if ends is invalid type', async () => {
    const body = { ...baseBody, ends: 'not-a-date' };
    const plain = Object.assign(new Course(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('ends');
    expect(errors[0].constraints?.['isDate']).toBeDefined();
  });
});