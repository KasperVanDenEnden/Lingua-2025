import { Test, TestingModule } from '@nestjs/testing';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { IReview } from '@lingua/api';
import { Types } from 'mongoose';
import { CreateReviewDto } from '@lingua/dto';

const mockReviewId = new Types.ObjectId();
const mockCourseId = new Types.ObjectId();
const mockUserId = new Types.ObjectId();

const mockReview: IReview = {
  _id: mockReviewId,
  comment: 'Test Comment',
  rating: 4,
  student: mockUserId,
  course: mockCourseId,
  createdAt: new Date(),
};

const mockReviewService = {
  create: jest.fn().mockResolvedValue(mockReview),
  delete: jest.fn().mockResolvedValue({ deleted: true }),
};

describe('ReviewController', () => {
  let controller: ReviewController;
  let service: ReviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewController],
      providers: [
        {
          provide: ReviewService,
          useValue: mockReviewService,
        },
      ],
    }).compile();

    controller = module.get<ReviewController>(ReviewController);
    service = module.get<ReviewService>(ReviewService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new review', async () => {
      const dto = new CreateReviewDto();
      const mockUser = { id: mockUserId.toHexString() };
      const result = await controller.create(dto, mockCourseId, mockUser);
      expect(service.create).toHaveBeenCalledWith(
        dto,
        mockCourseId,
        Types.ObjectId.createFromHexString(mockUser.id)
      );
      expect(result).toEqual(mockReview);
    });
  });

  describe('delete', () => {
    it('should delete a review by id', async () => {
      const mockUser = { id: mockUserId.toHexString() };
      const result = await controller.delete(mockReviewId, mockCourseId, mockUser);
      expect(service.delete).toHaveBeenCalledWith(
        mockReviewId,
        mockCourseId,
        Types.ObjectId.createFromHexString(mockUser.id)
      );
      expect(result).toEqual({ deleted: true });
    });
  });
});