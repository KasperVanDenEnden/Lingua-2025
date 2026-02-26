/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class BodyObjectIdsPipe implements PipeTransform<any, any> {
  transform(value: any, metadata: ArgumentMetadata): any {
    if (typeof value !== 'object' || value === null) {
      throw new BadRequestException(
        'Invalid input. Expecting an object with string properties.'
      );
    }

    const transformedObject: any = { ...value };

    // ✅ Alleen de velden die een ObjectId moeten zijn, converteren
    const objectIdFields = [
      'id',
      'createdBy',
      'teacher',
      'assistants',
      'room',
      'student',
      'location',
      'course',
      'assistant'
    ]; // Voeg hier relevante ID-velden toe

    objectIdFields.forEach((key) => {
      if (
        value[key] &&
        typeof value[key] === 'string' &&
        Types.ObjectId.isValid(value[key])
      ) {
        transformedObject[key] = new Types.ObjectId(value[key]);
      } else if (value[key]) {
        throw new BadRequestException(
          `Invalid ObjectId for property '${key}'.`
        );
      }
    });

    return transformedObject;
  }
}
