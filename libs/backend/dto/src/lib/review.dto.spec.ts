import { CreateReviewDto } from './review.dto';
import { validate } from 'class-validator';

describe('ReviewDto Tests', () => {
  let DTO: CreateReviewDto;

  beforeEach(() => {
    DTO = new CreateReviewDto();
    DTO.comment = 'Review';
    DTO.rating = 1;
  });

  it('should pass validation with valid data', async () => {
    const errors = await validate(DTO);
    expect(errors.length).toBe(0);
  });

  // === Missing === //

  it('should fail validation when comment is missing', async () => {
    DTO.comment = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('comment');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'comment should not be empty',
    );
  });

  it('should fail validation when rating is missing', async () => {
    DTO.rating = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('rating');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'rating should not be empty',
    );
  });

  // === Invalid type === //

  it('should fail validation when comment is not valid type', async () => {
    DTO.comment = 0 as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('comment');
    expect(errors[0].constraints?.['isString']).toBe(
      'comment must be a string',
    );
  });

  it('should fail validation when rating is not valid type', async () => {
    DTO.rating = 'invalid' as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('rating');
    expect(errors[0].constraints?.['isInt']).toBe(
      'rating must be an integer number',
    );
  });

  // === Boundary values === //

  it('should fail validation when rating is below 0', async () => {
    DTO.rating = -1;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('rating');
    expect(errors[0].constraints?.['min']).toBe(
      'rating must not be less than 0',
    );
  });

  it('should fail validation when rating is above 5', async () => {
    DTO.rating = 6;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('rating');
    expect(errors[0].constraints?.['max']).toBe(
      'rating must not be greater than 5',
    );
  });
});
