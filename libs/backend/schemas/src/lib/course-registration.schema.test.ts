import { MongoMemoryServer } from 'mongodb-memory-server';
import { disconnect, Model, Types } from 'mongoose';
import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { validate } from 'class-validator';
import {
  CourseRegistration,
  CourseRegistrationSchema,
} from './course-registration.schema';
describe('CourseSchema Tests', () => {
  let mongod: MongoMemoryServer;
  let courseRegistrationModel: Model<CourseRegistration>;
  let baseBody: Partial<CourseRegistration>;
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
            name: CourseRegistration.name,
            schema: CourseRegistrationSchema,
          },
        ]),
      ],
    }).compile();
    courseRegistrationModel = app.get<Model<CourseRegistration>>(
      getModelToken(CourseRegistration.name)
    );
    await courseRegistrationModel.ensureIndexes();
  });
  beforeEach(() => {
    baseBody = {
      _id: new Types.ObjectId(),
      course: new Types.ObjectId(),
      student: new Types.ObjectId(),
      registeredAt: new Date(),
      unregisteredAt: new Date(),
    };
  });
  afterAll(async () => {
    await disconnect();
    await mongod.stop();
  });
  it('should pass validation with valid data', async () => {
    const body = { ...baseBody };
    const plain = plainToInstance(CourseRegistration, body);
    const errors = await validate(plain);
    console.log(errors);
    expect(errors.length).toBe(0);
  });
  it('should fail validation if course is missing', async () => {
    const body = { ...baseBody, course: undefined };
    const plain = plainToInstance(CourseRegistration, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('course');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'course should not be empty'
    );
  });
  it('should fail validation if student is missing', async () => {
    const body = { ...baseBody, student: undefined };
    const plain = plainToInstance(CourseRegistration, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('student');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'student should not be empty'
    );
  });
  it('should fail validation if registeredAt is missing', async () => {
    const body = { ...baseBody, registeredAt: undefined };
    const plain = plainToInstance(CourseRegistration, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('registeredAt');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'registeredAt should not be empty'
    );
  });
  it('should fail validation if course is invalid type', async () => {
    const body = { ...baseBody, course: 'invalid' };
    const plain = plainToInstance(CourseRegistration, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('course');
    expect(errors[0].constraints?.['isObjectId']).toBe(
      'course must be a valid ObjectId'
    );
  });
  it('should fail validation if student is invalid type', async () => {
    const body = { ...baseBody, student: 'invalid' };
    const plain = plainToInstance(CourseRegistration, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('student');
    expect(errors[0].constraints?.['isObjectId']).toBe(
      'student must be a valid ObjectId'
    );
  });
  it('should fail validation if registeredAt is invalid type', async () => {
    const body = { ...baseBody, registeredAt: 'invalid' };
    const plain = plainToInstance(CourseRegistration, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('registeredAt');
    expect(errors[0].constraints?.['isDate']).toBe(
      'registeredAt must be a Date instance'
    );
  });
  it('should fail validation if unregisteredAt is invalid type', async () => {
    const body = { ...baseBody, unregisteredAt: 'invalid' };
    const plain = plainToInstance(CourseRegistration, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('unregisteredAt');
    expect(errors[0].constraints?.['isDate']).toBe(
      'unregisteredAt must be a Date instance'
    );
  });
});
