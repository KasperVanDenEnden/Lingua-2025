import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { NeoOperationsService } from '../neo4j/neo-operations.service';
import { UnauthorizedException, HttpException } from '@nestjs/common';
import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockUserId = new Types.ObjectId();

const mockUser = {
  _id: mockUserId,
  id: mockUserId.toHexString(),
  email: 'test@test.com',
  password: 'hashed-password',
  role: 'user',
  save: jest.fn(),
};

const mockUserModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('signed-jwt'),
};

const mockNeoService = {
  mergeUser: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: NeoOperationsService,
          useValue: mockNeoService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ----- LOGIN ----- //

  describe('login', () => {
    it('should return JWT when credentials are valid', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@test.com',
        password: 'password',
      });

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'test@test.com',
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password',
        mockUser.password
      );

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });

      expect(result).toEqual({ access_token: 'signed-jwt' });
    });

    it('should throw if user does not exist', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.login({ email: 'x', password: 'x' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if password is invalid', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'x', password: 'wrong' })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ----- REGISTER ----- //

  describe('register', () => {
    it('should create user and return JWT', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      (bcrypt.hashSync as jest.Mock).mockReturnValue('hashed-password');

      mockUserModel.create.mockResolvedValue(mockUser);

      const dto = {
        email: 'test@test.com',
        password: 'password',
        firstname: 'Test',
        lastname: 'User',
        role: 'user',
      } as any;

      const result = await service.register(dto);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: dto.email,
      });

      expect(bcrypt.hashSync).toHaveBeenCalledWith(dto.password, 10);

      expect(mockUserModel.create).toHaveBeenCalled();

      expect(mockNeoService.mergeUser).toHaveBeenCalledWith(mockUser);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser._id,
        email: mockUser.email,
        role: mockUser.role,
      });

      expect(result).toEqual({ access_token: 'signed-jwt' });
    });

    it('should throw if email already exists', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(
        service.register({ email: 'test@test.com' } as any)
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ----- CHANGE PASSWORD ----- //

  describe('changePassword', () => {
    it('should update password successfully', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');

      const result = await service.changePassword(
        {
          oldPassword: 'old',
          newPassword: 'new',
        },
        mockUserId
      );

      expect(mockUserModel.findById).toHaveBeenCalledWith(mockUserId);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'old',
        'hashed-password'
      );

      expect(bcrypt.hash).toHaveBeenCalledWith('new', 10);

      expect(mockUser.save).toHaveBeenCalled();

      expect(result).toEqual({
        message: 'Passwrd updated succesfully',
      });
    });

    it('should throw if user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      await expect(
        service.changePassword({} as any, mockUserId)
      ).rejects.toThrow(HttpException);
    });

    it('should throw if old password is incorrect', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(
          { oldPassword: 'wrong', newPassword: 'new' },
          mockUserId
        )
      ).rejects.toThrow(HttpException);
    });
  });
});