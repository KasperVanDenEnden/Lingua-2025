import { Types } from 'mongoose';
import { validate } from 'class-validator';
import { CreateCourseDto } from './course.dto';
import { CourseStatus, Language } from '@lingua/api';
describe('CourseDto Tests', () => {
  let DTO: CreateCourseDto;
  beforeEach(() => {
    DTO = new CreateCourseDto();
    DTO.status = CourseStatus.Active; //@todo Write tests
    DTO.teacher = new Types.ObjectId();
    DTO.assistants = [new Types.ObjectId(), new Types.ObjectId()];
    DTO.title = 'Title';
    DTO.description = 'Description';
    DTO.language = Language.Dutch;
  });
  it('should pass validation with valid data', async () => {
    const errors = await validate(DTO);
    expect(errors.length).toBe(0);
  });
  it('should fail validation when teacher is missing', async () => {
    DTO.teacher = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('teacher');
    expect(errors[0].constraints?.['isNotEmpty']).toBe('TeacherId us required');
  });
  it('should fail validation when title is missing', async () => {
    DTO.title = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('title');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'title should not be empty'
    );
  });
  it('should fail validation when description is missing', async () => {
    DTO.description = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('description');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'description should not be empty'
    );
  });
  it('should fail validation when language is missing', async () => {
    DTO.language = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('language');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'language should not be empty'
    );
  });
  it('should fail validation when teacher is not valid type', async () => {
    DTO.teacher = 'invalid' as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('teacher');
    expect(errors[0].constraints?.['isObjectId']).toBe(
      'teacher must be a valid ObjectId'
    );
  });
  it('should fail validation when capacity is not valid type', async () => {
    DTO.assistants = 'invalid' as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('assistants');
    expect(errors[0].constraints?.['isObjectId']).toBe(
      'Each asstisant must be a valid ObjectId'
    );
  });
  it('should fail validation when floor is not valid type', async () => {
    DTO.title = 0 as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('title');
    expect(errors[0].constraints?.['isString']).toBe('title must be a string');
  });
  it('should fail validation when description is not valid type', async () => {
    DTO.description = 0 as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('description');
    expect(errors[0].constraints?.['isString']).toBe(
      'description must be a string'
    );
  });
  it('should fail validation when language is not valid type', async () => {
    DTO.language = 'invalid' as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('language');
    expect(errors[0].constraints?.['isEnum']).toBe(
      'Language must be a valid enum value'
    );
  });
});
