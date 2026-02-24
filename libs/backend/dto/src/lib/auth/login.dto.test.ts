import { validate } from 'class-validator';
import { LoginDto } from './login.dto';
describe('ClassDto Tests', () => {
  let DTO: LoginDto;
  beforeEach(() => {
    DTO = new LoginDto();
    DTO.email = 'j.doe@test.nl';
    DTO.password = 'password123';
  });
  it('should pass validation with valid data', async () => {
    const errors = await validate(DTO);
    expect(errors.length).toBe(0);
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
  it('should fail validation when email is not valid type', async () => {
    DTO.email = 0 as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints?.['isEmail']).toBe('email must be an email');
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
});
