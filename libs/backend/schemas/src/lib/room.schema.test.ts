import { MongoMemoryServer } from 'mongodb-memory-server';
import { Room, RoomSchema } from './room.schema';
import { disconnect, Model, Types } from 'mongoose';
import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { validate } from 'class-validator';
import { RoomStatus } from '@lingua/api';
describe('RoomSchema Tests', () => {
  let mongod: MongoMemoryServer;
  let roomModel: Model<Room>;
  let baseBody: Partial<Room>;
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
            name: Room.name,
            schema: RoomSchema,
          },
        ]),
      ],
    }).compile();
    roomModel = app.get<Model<Room>>(getModelToken(Room.name));
    await roomModel.ensureIndexes();
  });
  beforeEach(() => {
    baseBody = {
      _id: new Types.ObjectId(),
      location: new Types.ObjectId(),
      slug: 'Slug',
      status: RoomStatus.Available, //@todo Write tests
      capacity: 0,
      floor: 0,
      hasMonitor: true,
    };
  });
  afterAll(async () => {
    await disconnect();
    await mongod.stop();
  });
  it('should pass validation with valid data', async () => {
    const body = { ...baseBody };
    const plain = plainToInstance(Room, body);
    const errors = await validate(plain);
    expect(errors.length).toBe(0);
  });
  it('should fail validation if location is missing', async () => {
    const body = { ...baseBody, location: undefined };
    const plain = plainToInstance(Room, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('location');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'location should not be empty'
    );
  });
  it('should fail validation if slug is missing', async () => {
    const body = { ...baseBody, slug: undefined };
    const plain = plainToInstance(Room, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('slug');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'slug should not be empty'
    );
  });
  it('should fail validation if capacity is missing', async () => {
    const body = { ...baseBody, capacity: undefined };
    const plain = plainToInstance(Room, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('capacity');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'capacity should not be empty'
    );
  });
  it('should fail validation if floor is missing', async () => {
    const body = { ...baseBody, floor: undefined };
    const plain = plainToInstance(Room, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('floor');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'floor should not be empty'
    );
  });
  it('should fail validation if hasMonitor is missing', async () => {
    const body = { ...baseBody, hasMonitor: undefined };
    const plain = plainToInstance(Room, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('hasMonitor');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'hasMonitor should not be empty'
    );
  });
  it('should fail validation if location is invalid type', async () => {
    const body = { ...baseBody, location: 'invalid' };
    const plain = plainToInstance(Room, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('location');
    expect(errors[0].constraints?.['isObjectId']).toBe(
      'location must be a valid ObjectId'
    );
  });
  it('should fail validation if slug is invalid type', async () => {
    const body = { ...baseBody, slug: 0 };
    const plain = plainToInstance(Room, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('slug');
    expect(errors[0].constraints?.['isString']).toBe('slug must be a string');
  });
  it('should fail validation if capacity is invalid type', async () => {
    const body = { ...baseBody, capacity: 'invalid' };
    const plain = plainToInstance(Room, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('capacity');
    expect(errors[0].constraints?.['isInt']).toBe(
      'capacity must be an integer number'
    );
  });
  it('should fail validation if floor is invalid type', async () => {
    const body = { ...baseBody, floor: 'invalid' };
    const plain = plainToInstance(Room, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('floor');
    expect(errors[0].constraints?.['isInt']).toBe(
      'floor must be an integer number'
    );
  });
  it('should fail validation if hasMonitor is invalid type', async () => {
    const body = { ...baseBody, hasMonitor: 0 };
    const plain = plainToInstance(Room, body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('hasMonitor');
    expect(errors[0].constraints?.['isBoolean']).toBe(
      'hasMonitor must be a boolean value'
    );
  });
});
