import { Injectable, PipeTransform } from '@nestjs/common';
import { ValidationException } from '../filters/validation.exception';
import { Types } from 'mongoose';

@Injectable()
export class StringObjectIdPipe
  implements PipeTransform<string, Types.ObjectId>
{
  transform(value: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new ValidationException([
        `Invalid ObjectId: ${value}`,
      ]);
    }

    return Types.ObjectId.createFromHexString(value);
  }
}