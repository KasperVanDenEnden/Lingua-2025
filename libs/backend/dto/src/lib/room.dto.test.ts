import { Types } from 'mongoose';
import { CreateRoomDto } from './room.dto';
import { validate } from 'class-validator';
import { RoomStatus } from '@lingua/api';
describe('RoomDto Tests', () => {
  let DTO: CreateRoomDto;
  beforeEach(() => {
    DTO = new CreateRoomDto();
    DTO.location = new Types.ObjectId();
    DTO.capacity = 30;
    DTO.status = RoomStatus.Available; //@todo Write tests
    DTO.slug = 'Slug'; //@todo Write tests
    DTO.floor = 2;
    DTO.hasMonitor = true;
  });
  it('should pass validation with valid data', async () => {
    const errors = await validate(DTO);
    expect(errors.length).toBe(0);
  });
  it('should fail validation when location is missing', async () => {
    DTO.location = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('location');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'location should not be empty'
    );
  });
  it('should fail validation when capacity is missing', async () => {
    DTO.capacity = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('capacity');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'capacity should not be empty'
    );
  });
  it('should fail validation when floor is missing', async () => {
    DTO.floor = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('floor');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'floor should not be empty'
    );
  });
  it('should fail validation when hasMonitor is missing', async () => {
    DTO.hasMonitor = undefined as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('hasMonitor');
    expect(errors[0].constraints?.['isNotEmpty']).toBe(
      'hasMonitor should not be empty'
    );
  });
  it('should fail validation when location is not valid type', async () => {
    DTO.location = 'invalid' as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('location');
    expect(errors[0].constraints?.['isObjectId']).toBe(
      'location must be a valid ObjectId'
    );
  });
  it('should fail validation when capacity is not valid type', async () => {
    DTO.capacity = 'invalid' as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('capacity');
    expect(errors[0].constraints?.['isInt']).toBe(
      'capacity must be an integer number'
    );
  });
  it('should fail validation when floor is not valid type', async () => {
    DTO.floor = 'invalid' as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('floor');
    expect(errors[0].constraints?.['isInt']).toBe(
      'floor must be an integer number'
    );
  });
  it('should fail validation when hasMonitor is not valid type', async () => {
    DTO.hasMonitor = 'invalid' as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('hasMonitor');
    expect(errors[0].constraints?.['isBoolean']).toBe(
      'hasMonitor must be a boolean value'
    );
  });
  it('should fail validation when capacity is not minimal 0', async () => {
    DTO.capacity = -1 as any;
    const errors = await validate(DTO);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('capacity');
    expect(errors[0].constraints?.['min']).toBe(
      'capacity must not be less than 0'
    );
  });
});
