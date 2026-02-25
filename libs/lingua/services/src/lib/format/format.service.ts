import { Injectable } from '@angular/core';
import { ILocation, IRoom } from '@lingua/api';

@Injectable({
  providedIn: 'root',
})
export class FormatService {
  getLocationAddress(location: ILocation): string {
    return [
        `${location?.street} ${location?.number}`.trim(),
        `${location?.postal} ${location?.city}`.trim(),
        location?.province
      ].filter(Boolean).join(', ');
  }

  getRoomSlug(room: IRoom): string {
    const location = (room.location as ILocation);

    if (!location) return 'No available slug';

    return `${room.slug}`;
  }

  
}
