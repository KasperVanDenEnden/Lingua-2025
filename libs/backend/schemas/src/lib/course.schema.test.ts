import { MongoMemoryServer } from 'mongodb-memory-server';
import { Course, CourseSchema } from './course.schema';
import { disconnect, Model, Types } from 'mongoose';
import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { CourseStatus, Language } from '@lingua/api';
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
      _id: new Types.ObjectId(),
      title: 'Title',
      description: 'Description',
      status: CourseStatus.Active,
      createdOn: new Date(),
      language: Language.Dutch,
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
    const plain = plainToInstance(Course, body);
    const errors = await validate(plain);
    expect(errors.length).toBe(0);
  });
  it('should fail validation if title is missing', async () => {
    const body = { ...baseBody, title: undefined };
    const plain = plainToInstance(Course, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('title');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'title should not be empty'
    );
  });
  it('should fail validation if description is missing', async () => {
    const body = { ...baseBody, description: undefined };
    const plain = plainToInstance(Course, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('description');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'description should not be empty'
    );
  });
  it('should fail validation if status is missing', async () => {
    const body = { ...baseBody, status: undefined };
    const plain = plainToInstance(Course, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('status');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'status should not be empty'
    );
  });
  it('should fail validation if createdOn is missing', async () => {
    const body = { ...baseBody, createdOn: undefined };
    const plain = plainToInstance(Course, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('createdOn');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'createdOn should not be empty'
    );
  });
  it('should fail validation if teacher is missing', async () => {
    const body = { ...baseBody, teacher: undefined };
    const plain = plainToInstance(Course, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('teacher');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'teacher should not be empty'
    );
  });
  it('should fail validation if assistants is missing', async () => {
    const body = { ...baseBody, assistants: undefined };
    const plain = plainToInstance(Course, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('assistants');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'assistants should not be empty'
    );
  });
  it('should fail validation if title is invalid type', async () => {
    const body = { ...baseBody, title: 0 };
    const plain = plainToInstance(Course, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('title');
    expect(errors[0].constraints?.['isString']).toBe('title must be a string');
  });
  it('should fail validation if description is invalid type', async () => {
    const body = { ...baseBody, description: 0 };
    const plain = plainToInstance(Course, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('description');
    expect(errors[0].constraints?.['isString']).toBe(
      'description must be a string'
    );
  });
  it('should fail validation if status is invalid type', async () => {
    const body = { ...baseBody, status: 0 };
    const plain = plainToInstance(Course, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('status');
    expect(errors[0].constraints?.['isEnum']).toBe(
      'Status must be a valid enum value'
    );
  });
  it('should fail validation if createdOn is invalid type', async () => {
    const body = { ...baseBody, createdOn: 'invalid' };
    const plain = plainToInstance(Course, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('createdOn');
    expect(errors[0].constraints?.['isDate']).toBe(
      'createdOn must be a Date instance'
    );
  });
  it('should fail validation if language is invalid type', async () => {
    const body = { ...baseBody, language: 0 };
    const plain = plainToInstance(Course, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('language');
    expect(errors[0].constraints?.['isEnum']).toBe(
      'Language must be a valid enum value'
    );
  });
  it('should fail validation if teacher is invalid type', async () => {
    const body = { ...baseBody, teacher: 'invalid' };
    const plain = plainToInstance(Course, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('teacher');
    expect(errors[0].constraints?.['isObjectId']).toBe(
      'teacher must be a valid ObjectId'
    );
  });
  it('should fail validation if assistants is invalid type', async () => {
    const body = { ...baseBody, assistants: 'invalid' };
    const plain = plainToInstance(Course, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('assistants');
    expect(errors[0].constraints?.['arrayMinSize']).toBe(
      'Assistants must be an array (can be empty)'
    );
    expect(errors[0].constraints?.['isArray']).toBe(
      'assistants must be an array'
    );
    expect(errors[0].constraints?.['isObjectId']).toBe(
      'Each asstisant must be a valid ObjectId'
    );
  });
});
