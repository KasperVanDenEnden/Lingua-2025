import { Types } from 'mongoose';
import { validate } from 'class-validator';
import { CreateCourseRegistrationDto } from './course-registration.dto';
describe('CourseDto Tests', () => {
  let DTO: CreateCourseRegistrationDto;
  beforeEach(() => {
    DTO = new CreateCourseRegistrationDto();
    DTO.course = new Types.ObjectId();
    DTO.student = new Types.ObjectId();
  });
  it('should pass validation with valid data', async () => {
    const errors = await validate(DTO);
    expect(errors.length).toBe(0);
  });
  it('should fail validation when course is missing', async () => {
    DTO.course = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('course');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'course should not be empty'
    );
  });
  it('should fail validation when student is missing', async () => {
    DTO.student = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('student');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'student should not be empty'
    );
  });
  it('should fail validation when course is not valid type', async () => {
    DTO.course = 'invalid' as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('course');
    expect(errors[0].constraints?.['isObjectId']).toBe(
      'course must be a valid ObjectId'
    );
  });
  it('should fail validation when capacity is not valid type', async () => {
    DTO.student = 'invalid' as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('student');
    expect(errors[0].constraints?.['isObjectId']).toBe(
      'student must be a valid ObjectId'
    );
  });
});
