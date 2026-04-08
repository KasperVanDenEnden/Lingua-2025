import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto, ChangePasswordDto } from '@lingua/dto';
import { ICreateUser, Id } from '@lingua/api';
import { Types } from 'mongoose';

const mockUserId = new Types.ObjectId();

const mockUser = {
  _id: mockUserId,
  email: 'test@test.com',
};

const mockAuthResponse = {
  access_token: 'jwt-token',
  user: mockUser,
};

const mockAuthService = {
  login: jest.fn().mockResolvedValue(mockAuthResponse),
  register: jest.fn().mockResolvedValue(mockUser),
  changePassword: jest.fn().mockResolvedValue({ success: true }),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ----- AUTH OPERATIONS ----- //

  describe('login', () => {
    it('should login a user', async () => {
      const dto: LoginDto = {
        email: 'test@test.com',
        password: 'password',
      };

      const result = await controller.login(dto);

      expect(service.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('register', () => {
    it('should register a user', async () => {
      const dto: ICreateUser = {
        email: 'test@test.com',
        password: 'password',
      } as any;

      const result = await controller.register(dto);

      expect(service.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('getProfile', () => {
    it('should return the user from request', () => {
      const req = {
        user: mockUser,
      };

      const result = controller.getProfile(req);

      expect(result).toEqual(mockUser);
    });
  });

  describe('changePassword', () => {
    it('should change the user password', async () => {
      const dto: ChangePasswordDto = {
        oldPassword: 'old',
        newPassword: 'new',
      };

      const id: Id = mockUserId;

      const result = await controller.changePassword(dto, id);

      expect(service.changePassword).toHaveBeenCalledWith(dto, id);
      expect(result).toEqual({ success: true });
    });
  });
});
