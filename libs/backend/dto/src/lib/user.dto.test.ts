import { Role } from '@lingua/api';
import { CreateUserDto } from './user.dto';
import { validate } from 'class-validator';
describe('UserDto Tests', () => {
  let DTO: CreateUserDto;
  beforeEach(() => {
    DTO = new CreateUserDto();
    DTO.role = Role.Teacher;
    DTO.firstname = 'John';
    DTO.lastname = 'Doe';
    DTO.email = 'j.doe@test.com';
    DTO.password = 'password123';
  });
  it('should pass validation with valid data', async () => {
    const errors = await validate(DTO);
    expect(errors.length).toBe(0);
  });
  it('should fail validation when location is missing', async () => {
    DTO.role = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('role');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'role should not be empty'
    );
  });
  it('should fail validation when firstname is missing', async () => {
    DTO.firstname = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('firstname');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'firstname should not be empty'
    );
  });
  it('should fail validation when lastname is missing', async () => {
    DTO.lastname = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('lastname');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'lastname should not be empty'
    );
  });
  it('should fail validation when email is missing', async () => {
    DTO.email = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'email should not be empty'
    );
  });
  it('should fail validation when password is missing', async () => {
    DTO.password = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'password should not be empty'
    );
  });
  it('should fail validation when location is not valid type', async () => {
    DTO.firstname = 0 as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('firstname');
    expect(errors[0].constraints?.['isString']).toBe(
      'firstname must be a string'
    );
  });
  it('should fail validation when lastname is not valid type', async () => {
    DTO.lastname = 0 as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('lastname');
    expect(errors[0].constraints?.['isString']).toBe(
      'lastname must be a string'
    );
  });
  it('should fail validation when role is not valid type', async () => {
    DTO.role = 'invalid' as Role;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('role');
    expect(errors[0].constraints?.['isEnum']).toBe(
      'Role must be a valid enum value'
    );
  });
  it('should fail validation when email is not valid type', async () => {
    DTO.email = 0 as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints?.['isString']).toBe('email must be a string');
  });
  it('should fail validation when password is not valid type', async () => {
    DTO.password = 0 as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints?.['isString']).toBe(
      'password must be a string'
    );
  });
  it('should fail validation when email is not a valid email', async () => {
    DTO.email = 'invalid' as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints?.['isEmail']).toBe('email must be an email');
  });
});
