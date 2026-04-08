import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { getModelToken } from '@nestjs/mongoose';
import { NeoOperationsService } from '../neo4j/neo-operations.service';
import { HttpException } from '@nestjs/common';
import { Types } from 'mongoose';

const mockCourseId = new Types.ObjectId();
const mockUserId = new Types.ObjectId();
const mockReviewId = new Types.ObjectId();

const mockCourse = {
  _id: mockCourseId,
  students: [mockUserId],
  reviews: [],
};

const mockCourseWithReview = {
  _id: mockCourseId,
  students: [mockUserId],
  reviews: [
    {
      _id: mockReviewId,
      student: mockUserId,
      rating: 5,
    },
  ],
};

const mockCourseModel = {
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

const mockNeoService = {
  reviewCourse: jest.fn(),
  deleteReview: jest.fn(),
};

describe('ReviewService', () => {
  let service: ReviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        { provide: getModelToken('Course'), useValue: mockCourseModel },
        { provide: NeoOperationsService, useValue: mockNeoService },
      ],
    }).compile();

    service = module.get<ReviewService>(ReviewService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ----- CREATE ----- //

  describe('create', () => {
    it('should create a review', async () => {
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      });

      mockCourseModel.findByIdAndUpdate.mockResolvedValue({
        ...mockCourse,
        reviews: [{}],
      });

      const dto = { rating: 5, comment: 'Nice' };

      const result = await service.create(dto as any, mockCourseId, mockUserId);

      expect(mockCourseModel.findOne).toHaveBeenCalledWith({
        _id: mockCourseId,
        students: mockUserId,
      });

      expect(mockCourseModel.findByIdAndUpdate).toHaveBeenCalled();

      expect(mockNeoService.reviewCourse).toHaveBeenCalled();

      expect(result).toBeDefined();
    });

    it('should throw if course not found or not enrolled', async () => {
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.create({} as any, mockCourseId, mockUserId),
      ).rejects.toThrow(HttpException);
    });

    it('should throw if user already reviewed', async () => {
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourseWithReview),
      });

      await expect(
        service.create({} as any, mockCourseId, mockUserId),
      ).rejects.toThrow(HttpException);
    });
  });

  // ----- DELETE ----- //

  describe('delete', () => {
    it('should delete a review', async () => {
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourseWithReview),
      });

      mockCourseModel.findByIdAndUpdate.mockResolvedValue({
        ...mockCourse,
        reviews: [],
      });

      const result = await service.delete(
        mockReviewId,
        mockCourseId,
        mockUserId,
      );

      expect(mockCourseModel.findOne).toHaveBeenCalledWith({
        _id: mockCourseId,
        'reviews._id': mockReviewId,
      });

      expect(mockCourseModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockCourseId,
        { $pull: { reviews: { _id: mockReviewId } } },
        { new: true, runValidators: true },
      );

      expect(mockNeoService.deleteReview).toHaveBeenCalledWith(
        mockUserId.toString(),
        mockCourseId.toString(),
      );

      expect(result).toBeDefined();
    });

    it('should throw if course or review not found', async () => {
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.delete(mockReviewId, mockCourseId, mockUserId),
      ).rejects.toThrow(HttpException);
    });

    it('should throw if user is not owner of review', async () => {
      const otherUserId = new Types.ObjectId();

      const courseWithOtherReview = {
        _id: mockCourseId,
        reviews: [
          {
            _id: mockReviewId,
            student: otherUserId,
          },
        ],
      };

      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(courseWithOtherReview),
      });

      await expect(
        service.delete(mockReviewId, mockCourseId, mockUserId),
      ).rejects.toThrow(HttpException);
    });
  });
});
