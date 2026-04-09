import { MongoMemoryServer } from 'mongodb-memory-server';
import { User, UserSchema } from './user.schema';
import { disconnect, Model, Types } from 'mongoose';
import { Test } from '@nestjs/testing';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { validate } from 'class-validator';
import { Role } from '@lingua/api';
describe('UserSchema Tests', () => {
  let mongod: MongoMemoryServer;
  let userModel: Model<User>;
  let baseBody: Partial<User>;
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
            name: User.name,
            schema: UserSchema,
          },
        ]),
      ],
    }).compile();
    userModel = app.get<Model<User>>(getModelToken(User.name));
    await userModel.ensureIndexes();
  });
  beforeEach(() => {
    baseBody = {
      role: Role.Student,
      firstname: 'John',
      lastname: 'Doe',
      email: 'test@test.com',
      password: 'password123',
      friends: [new Types.ObjectId()], // NIEUW: ontbrak, @IsNotEmpty() zou anders falen
    };
  });
  afterAll(async () => {
    await disconnect();
    await mongod.stop();
  });
  it('should pass validation with valid data', async () => {
    const body = { ...baseBody };
    const plain = Object.assign(new User(), body);
    const errors = await validate(plain);
    expect(errors.length).toBe(0);
  });

  // === Missing === //

  it('should fail validation if role is missing', async () => {
    const body = { ...baseBody, role: undefined };
    const plain = Object.assign(new User(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('role');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'role should not be empty',
    );
  });

  it('should fail validation if firstname is missing', async () => {
    const body = { ...baseBody, firstname: undefined };
    const plain = Object.assign(new User(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('firstname');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'firstname should not be empty',
    );
  });

  it('should fail validation if lastname is missing', async () => {
    const body = { ...baseBody, lastname: undefined };
    const plain = Object.assign(new User(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('lastname');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'lastname should not be empty',
    );
  });

  it('should fail validation if email is missing', async () => {
    const body = { ...baseBody, email: undefined };
    const plain = Object.assign(new User(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'email should not be empty',
    );
  });

  it('should fail validation if password is missing', async () => {
    const body = { ...baseBody, password: undefined };
    const plain = Object.assign(new User(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'password should not be empty',
    );
  });

  it('should fail validation if friends is missing', async () => {
    const body = { ...baseBody, friends: undefined };
    const plain = Object.assign(new User(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('friends');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'friends should not be empty',
    );
  });

  // === Invalid type === //

  it('should fail validation if role is invalid type', async () => {
    const body = { ...baseBody, role: 'invalid' };
    const plain = Object.assign(new User(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('role');
    expect(errors[0].constraints?.['isEnum']).toBe(
      'Role must be a valid enum value',
    );
  });

  it('should fail validation if firstname is invalid type', async () => {
    const body = { ...baseBody, firstname: 0 };
    const plain = Object.assign(new User(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('firstname');
    expect(errors[0].constraints?.['isString']).toBe(
      'firstname must be a string',
    );
  });

  it('should fail validation if lastname is invalid type', async () => {
    const body = { ...baseBody, lastname: 0 };
    const plain = Object.assign(new User(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('lastname');
    expect(errors[0].constraints?.['isString']).toBe(
      'lastname must be a string',
    );
  });

  it('should fail validation if email is invalid type', async () => {
    const body = { ...baseBody, email: 0 };
    const plain = Object.assign(new User(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints?.['isString']).toBe('email must be a string');
  });

  it('should fail validation if password is invalid type', async () => {
    const body = { ...baseBody, password: 0 };
    const plain = Object.assign(new User(), body);
    const errors = await validate(plain);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints?.['isString']).toBe(
      'password must be a string',
    );
  });
});
