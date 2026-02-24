import { MongoMemoryServer } from 'mongodb-memory-server';
import { Location, LocationSchema } from './location.schema';
import { disconnect, Model, Types } from 'mongoose';
import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { validate } from 'class-validator';
import { Province } from '@lingua/api';
describe('LocationSchema Tests', () => {
  let mongod: MongoMemoryServer;
  let locationModel: Model<Location>;
  let baseBody: Partial<Location>;
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
            name: Location.name,
            schema: LocationSchema,
          },
        ]),
      ],
    }).compile();
    locationModel = app.get<Model<Location>>(getModelToken(Location.name));
    await locationModel.ensureIndexes();
  });
  beforeEach(() => {
    baseBody = {
      _id: new Types.ObjectId(),
      createdBy: new Types.ObjectId(),
      slug: 'Test slug',
      floors: 4, //@todo Write tests
      rooms: 4, //@todo Write tests
      street: 'Test street',
      number: 'Test number',
      city: 'Test description',
      postal: '1234AZ',
      province: Province.Flevoland,
    };
  });
  afterAll(async () => {
    await disconnect();
    await mongod.stop();
  });
  it('should pass validation with valid data', async () => {
    const body = { ...baseBody };
    const plain = plainToInstance(Location, body);
    const errors = await validate(plain);
    expect(errors.length).toBe(0);
  });
  it('should fail validation if createdBy is missing', async () => {
    const body = { ...baseBody, createdBy: undefined };
    const plain = plainToInstance(Location, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('createdBy');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'createdBy should not be empty'
    );
  });
  it('should fail validation if slug is missing', async () => {
    const body = { ...baseBody, slug: undefined };
    const plain = plainToInstance(Location, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('slug');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'slug should not be empty'
    );
  });
  it('should fail validation if street is missing', async () => {
    const body = { ...baseBody, street: undefined };
    const plain = plainToInstance(Location, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('street');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'street should not be empty'
    );
  });
  it('should fail validation if number is missing', async () => {
    const body = { ...baseBody, number: undefined };
    const plain = plainToInstance(Location, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('number');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'number should not be empty'
    );
  });
  it('should fail validation if city is missing', async () => {
    const body = { ...baseBody, city: undefined };
    const plain = plainToInstance(Location, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('city');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'city should not be empty'
    );
  });
  it('should fail validation if postal is missing', async () => {
    const body = { ...baseBody, postal: undefined };
    const plain = plainToInstance(Location, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('postal');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'postal should not be empty'
    );
  });
  it('should fail validation if province is missing', async () => {
    const body = { ...baseBody, province: undefined };
    const plain = plainToInstance(Location, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('province');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'province should not be empty'
    );
  });
  it('should fail validation if createdBy is invalid type', async () => {
    const body = { ...baseBody, createdBy: 'invalid' };
    const plain = plainToInstance(Location, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('createdBy');
    expect(errors[0].constraints?.['isObjectId']).toBe(
      'createdBy must be a valid ObjectId'
    );
  });
  it('should fail validation if slug is invalid type', async () => {
    const body = { ...baseBody, slug: 0 };
    const plain = plainToInstance(Location, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('slug');
    expect(errors[0].constraints?.['isString']).toBe('slug must be a string');
  });
  it('should fail validation if street is invalid type', async () => {
    const body = { ...baseBody, street: 0 };
    const plain = plainToInstance(Location, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('street');
    expect(errors[0].constraints?.['isString']).toBe('street must be a string');
  });
  it('should fail validation if number is invalid type', async () => {
    const body = { ...baseBody, number: 0 };
    const plain = plainToInstance(Location, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('number');
    expect(errors[0].constraints?.['isString']).toBe('number must be a string');
  });
  it('should fail validation if city is invalid type', async () => {
    const body = { ...baseBody, city: 0 };
    const plain = plainToInstance(Location, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('city');
    expect(errors[0].constraints?.['isString']).toBe('city must be a string');
  });
  it('should fail validation if postal is invalid type', async () => {
    const body = { ...baseBody, postal: 0 };
    const plain = plainToInstance(Location, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('postal');
    expect(errors[0].constraints?.['isString']).toBe('postal must be a string');
  });
  it('should fail validation if province is invalid type', async () => {
    const body = { ...baseBody, province: 'invalid' };
    const plain = plainToInstance(Location, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('province');
    expect(errors[0].constraints?.['isEnum']).toBe(
      'Province must be a valid enum value'
    );
  });
});
