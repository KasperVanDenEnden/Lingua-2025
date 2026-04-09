import { validate } from 'class-validator';
import { CreateCourseDto } from './course.dto';
import { CourseStatus, Language, Level } from '@lingua/api';

describe('CreateCourseDto Tests', () => {
  let DTO: CreateCourseDto;

  beforeEach(() => {
    DTO = new CreateCourseDto();
    DTO.status = CourseStatus.Active;
    DTO.title = 'Title';
    DTO.description = 'Description';
    DTO.price = 10;
    DTO.maxStudents = 15;
    DTO.starts = new Date();
    DTO.language = Language.Dutch;
    DTO.level = Level.A1;
    DTO.teachers = ['507f1f77bcf86cd799439011'];
  });

  it('should pass validation with valid data', async () => {
    const errors = await validate(DTO);
    expect(errors.length).toBe(0);
  });

  // === Missing === //

  it('should fail validation when status is missing', async () => {
    DTO.status = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('status');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'status should not be empty',
    );
  });

  it('should fail validation when title is missing', async () => {
    DTO.title = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('title');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'title should not be empty',
    );
  });

  it('should fail validation when description is missing', async () => {
    DTO.description = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('description');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'description should not be empty',
    );
  });

  it('should fail validation when price is missing', async () => {
    DTO.price = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('price');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'price should not be empty',
    );
  });

  it('should fail validation when maxStudents is missing', async () => {
    DTO.maxStudents = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('maxStudents');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'maxStudents should not be empty',
    );
  });

  it('should fail validation when starts is missing', async () => {
    DTO.starts = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('starts');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'starts should not be empty',
    );
  });

  it('should fail validation when language is missing', async () => {
    DTO.language = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('language');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'language should not be empty',
    );
  });

  it('should fail validation when level is missing', async () => {
    DTO.level = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('level');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'level should not be empty',
    );
  });

  it('should fail validation when teachers is missing', async () => {
    DTO.teachers = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('teachers');
    expect(errors[0].constraints?.['isArray']).toBeDefined();
  });

  it('should fail validation when teachers is empty array', async () => {
    DTO.teachers = [];
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('teachers');
    expect(errors[0].constraints?.['arrayMinSize']).toBe(
      'At least one teacher is required',
    );
  });

  // === Invalid type === //

  it('should fail validation when status is invalid type', async () => {
    DTO.status = 'invalid' as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('status');
    expect(errors[0].constraints?.['isEnum']).toBe(
      'Status must be a valid enum value',
    );
  });

  it('should fail validation when title is invalid type', async () => {
    DTO.title = 0 as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('title');
    expect(errors[0].constraints?.['isString']).toBe('title must be a string');
  });

  it('should fail validation when description is invalid type', async () => {
    DTO.description = 0 as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('description');
    expect(errors[0].constraints?.['isString']).toBe(
      'description must be a string',
    );
  });

  it('should fail validation when price is invalid type', async () => {
    DTO.price = 'invalid' as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('price');
    expect(errors[0].constraints?.['isNumber']).toBeDefined();
  });

  it('should fail validation when maxStudents is invalid type', async () => {
    DTO.maxStudents = 'invalid' as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('maxStudents');
    expect(errors[0].constraints?.['isNumber']).toBeDefined();
  });

  it('should fail validation when starts is invalid type', async () => {
    DTO.starts = 'invalid' as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('starts');
    expect(errors[0].constraints?.['isDate']).toBeDefined();
  });

  it('should fail validation when language is invalid type', async () => {
    DTO.language = 'invalid' as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('language');
    expect(errors[0].constraints?.['isEnum']).toBe(
      'Language must be a valid enum value',
    );
  });

  it('should fail validation when level is invalid type', async () => {
    DTO.level = 'invalid' as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('level');
    expect(errors[0].constraints?.['isEnum']).toBe(
      'Language must be a valid enum value', // let op: dit is de message uit de DTO
    );
  });

  it('should fail validation when teachers contains invalid ObjectId', async () => {
    DTO.teachers = ['invalid-id'];
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('teachers');
    expect(errors[0].constraints?.['isMongoId']).toBe(
      'Each teacher must be a valid ObjectId',
    );
  });

  // === Boundary values === //

  it('should fail validation when price exceeds maximum', async () => {
    DTO.price = 51;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('price');
    expect(errors[0].constraints?.['max']).toBe('price cannot exceed 50,00');
  });

  it('should fail validation when price is negative', async () => {
    DTO.price = -1;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('price');
    expect(errors[0].constraints?.['min']).toBe('price cannot be negative');
  });

  it('should fail validation when maxStudents exceeds maximum', async () => {
    DTO.maxStudents = 21;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('maxStudents');
    expect(errors[0].constraints?.['max']).toBe('maxStudents cannot exceed 20');
  });

  // === Optional fields === //

  it('should pass validation when ends is omitted', async () => {
    DTO.ends = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBe(0);
  });

  it('should pass validation when ends is null', async () => {
    DTO.ends = null as any;
    const errors = await validate(DTO);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when ends is invalid type', async () => {
    DTO.ends = 'invalid' as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('ends');
    expect(errors[0].constraints?.['isDate']).toBeDefined();
  });
});
