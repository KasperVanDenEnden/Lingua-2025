import { Types } from 'mongoose';
import { CreateLocationDto } from './location.dto';
import { validate } from 'class-validator';
import { Province } from '@lingua/api';
describe('LocationDto Tests', () => {
  let DTO: CreateLocationDto;
  beforeEach(() => {
    DTO = new CreateLocationDto();
    DTO.slug = 'Slug'; //@todo Write tests
    DTO.floors = 4; //@todo Write tests
    DTO.rooms = 20; //@todo Write tests
    DTO.createdBy = new Types.ObjectId();
    DTO.street = 'Churckstreet';
    DTO.number = '1';
    DTO.city = 'Breda';
    DTO.postal = '1829EH';
    DTO.province = Province.NoordBrabant;
  });
  it('should pass validation with valid data', async () => {
    const errors = await validate(DTO);
    expect(errors.length).toBe(0);
  });
  it('should fail validation when createdBy is missing', async () => {
    DTO.createdBy = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('createdBy');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'createdBy should not be empty'
    );
  });
  it('should fail validation when street is missing', async () => {
    DTO.street = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('street');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'street should not be empty'
    );
  });
  it('should fail validation when number is missing', async () => {
    DTO.number = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('number');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'number should not be empty'
    );
  });
  it('should fail validation when createdBy is missing', async () => {
    DTO.city = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('city');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'city should not be empty'
    );
  });
  it('should fail validation when postal is missing', async () => {
    DTO.postal = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('postal');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'postal should not be empty'
    );
  });
  it('should fail validation when province is missing', async () => {
    DTO.province = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('province');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'province should not be empty'
    );
  });
  it('should fail validation when createdBy is not valid type', async () => {
    DTO.createdBy = 'invalid' as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('createdBy');
    expect(errors[0].constraints?.['isObjectId']).toBe(
      'createdBy must be a valid ObjectId'
    );
  });
  it('should fail validation when street is not valid type', async () => {
    DTO.street = 0 as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('street');
    expect(errors[0].constraints?.['isString']).toBe('street must be a string');
  });
  it('should fail validation when number is not valid type', async () => {
    DTO.number = 0 as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('number');
    expect(errors[0].constraints?.['isString']).toBe('number must be a string');
  });
  it('should fail validation when city is not valid type', async () => {
    DTO.city = 0 as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('city');
    expect(errors[0].constraints?.['isString']).toBe('city must be a string');
  });
  it('should fail validation when postal is not valid type', async () => {
    DTO.postal = 0 as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('postal');
    expect(errors[0].constraints?.['isString']).toBe('postal must be a string');
  });
  it('should fail validation when province is not valid type', async () => {
    DTO.province = 0 as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('province');
    expect(errors[0].constraints?.['isEnum']).toBe(
      'Province must be a valid enum value'
    );
  });
});
