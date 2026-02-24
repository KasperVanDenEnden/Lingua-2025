import { MongoMemoryServer } from 'mongodb-memory-server';
import { disconnect, Model, Types } from 'mongoose';
import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { validate } from 'class-validator';
import { Review, ReviewSchema } from './review.schema';
describe('ReviewSchema Tests', () => {
  let mongod: MongoMemoryServer;
  let reviewModel: Model<Review>;
  let baseBody: Partial<Review>;
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
            name: Review.name,
            schema: ReviewSchema,
          },
        ]),
      ],
    }).compile();
    reviewModel = app.get<Model<Review>>(getModelToken(Review.name));
    await reviewModel.ensureIndexes();
  });
  beforeEach(() => {
    baseBody = {
      _id: new Types.ObjectId(),
      student: new Types.ObjectId(),
      course: new Types.ObjectId(),
      comment: 'Test comment',
      rating: 0,
      createdAt: new Date(),
    };
  });
  afterAll(async () => {
    await disconnect();
    await mongod.stop();
  });
  it('should pass validation with valid data', async () => {
    const body = { ...baseBody };
    const plain = plainToInstance(Review, body);
    const errors = await validate(plain);
    expect(errors.length).toBe(0);
  });
  it('should fail validation if student is missing', async () => {
    const body = { ...baseBody, student: undefined };
    const plain = plainToInstance(Review, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('student');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'student should not be empty'
    );
  });
  it('should fail validation if course is missing', async () => {
    const body = { ...baseBody, course: undefined };
    const plain = plainToInstance(Review, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('course');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'course should not be empty'
    );
  });
  it('should fail validation if comment is missing', async () => {
    const body = { ...baseBody, comment: undefined };
    const plain = plainToInstance(Review, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('comment');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'comment should not be empty'
    );
  });
  it('should fail validation if rating is missing', async () => {
    const body = { ...baseBody, rating: undefined };
    const plain = plainToInstance(Review, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('rating');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'rating should not be empty'
    );
  });
  it('should fail validation if createdAt is missing', async () => {
    const body = { ...baseBody, createdAt: undefined };
    const plain = plainToInstance(Review, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('createdAt');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'createdAt should not be empty'
    );
  });
  it('should fail validation if student is invalid type', async () => {
    const body = { ...baseBody, student: 'invalid' };
    const plain = plainToInstance(Review, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('student');
    expect(errors[0].constraints?.['isObjectId']).toBe(
      'student must be a valid ObjectId'
    );
  });
  it('should fail validation if course is invalid type', async () => {
    const body = { ...baseBody, course: 'invalid' };
    const plain = plainToInstance(Review, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('course');
    expect(errors[0].constraints?.['isObjectId']).toBe(
      'course must be a valid ObjectId'
    );
  });
  it('should fail validation if comment is invalid type', async () => {
    const body = { ...baseBody, comment: 0 };
    const plain = plainToInstance(Review, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('comment');
    expect(errors[0].constraints?.['isString']).toBe(
      'comment must be a string'
    );
  });
  it('should fail validation if rating is invalid type', async () => {
    const body = { ...baseBody, rating: 'invalid' };
    const plain = plainToInstance(Review, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('rating');
    expect(errors[0].constraints?.['isInt']).toBe(
      'rating must be an integer number'
    );
  });
  it('should fail validation if createdAt is invalid type', async () => {
    const body = { ...baseBody, createdAt: 'invalid' };
    const plain = plainToInstance(Review, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('createdAt');
    expect(errors[0].constraints?.['isDate']).toBe(
      'createdAt must be a Date instance'
    );
  });
});
