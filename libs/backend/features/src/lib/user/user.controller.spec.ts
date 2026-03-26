import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ICourse, IReview, IUser, Role } from '@lingua/api';
import { Types } from 'mongoose';
import { CreateCourseDto, CreateReviewDto, CreateUserDto } from '@lingua/dto';

const mockUserId = new Types.ObjectId();
const mockTargetId = new Types.ObjectId();

const mockUser: IUser = {
    _id: mockUserId,
    role: Role.Admin,
    firstname: 'John',
    lastname: 'Doe',
    email: 'j.doe@test.nl',
    password: 'password',
    token: 'abcdefghijklmnopqrstuvwxyz',
    friends: []
};

const mockUserService = {
    getAll: jest.fn().mockResolvedValue([mockUser]),  
    getOne: jest.fn().mockResolvedValue(mockUser),  
    create: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue(mockUser),
    delete: jest.fn().mockResolvedValue({ deleted: true }),
    follow: jest.fn().mockResolvedValue(undefined),
    unfollow: jest.fn().mockResolvedValue(undefined),
};

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

    // ----- CRUD Operations ----- //

    describe('getAll', () => {
        it('should return all users', async () => {
        const result = await controller.getAll();
        expect(service.getAll).toHaveBeenCalledTimes(1);
        expect(result).toEqual([mockUser]);
        });
    });

    describe('getOne', () => {
        it('should return a single user by id', async () => {
        const result = await controller.getOne(mockUserId);
        expect(service.getOne).toHaveBeenCalledWith(mockUserId);
        expect(result).toEqual(mockUser);
        });
    });

    describe('create', () => {
        it('should create a new user', async () => {
        const dto = new CreateUserDto() as IUser;
        const result = await controller.create(dto);
        expect(service.create).toHaveBeenCalledWith(dto);
        expect(result).toEqual(mockUser);
        });
    });

     describe('update', () => {
        it('should update a course by id', async () => {
        const body = { title: 'Updated Title' } as any;
        const result = await controller.update(mockUserId, body);
        expect(service.update).toHaveBeenCalledWith(mockUserId, body);
        expect(result).toEqual(mockUser);
        });
    });

    describe('delete', () => {
        it('should delete a user by id', async () => {
        const mockUser = { id: mockUserId.toHexString() };
        const result = await controller.delete(mockUserId);
        expect(service.delete).toHaveBeenCalledWith(mockUserId);
        expect(result).toEqual({ deleted: true });
        });
    });

    // ----- Business Operations ----- //

    describe('follow', () => {
        it('should follow a user', async () => {
            const mockUser = { id: mockUserId.toHexString() };
            const result = await controller.follow(mockTargetId, mockUser);
            expect(service.follow).toHaveBeenCalledWith(mockUser.id, mockTargetId);
            expect(result).toBeUndefined();
        });
    });

    describe('unfollow', () => {
        it('should unfollow a user', async () => {
            const mockUser = { id: mockUserId.toHexString() };
            const result = await controller.unfollow(mockTargetId, mockUser);
            expect(service.unfollow).toHaveBeenCalledWith(mockUser.id, mockTargetId);
            expect(result).toBeUndefined();
        });
    });
});