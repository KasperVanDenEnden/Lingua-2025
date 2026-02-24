import { Controller, HttpStatus } from '@nestjs/common';
import { Get }  from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { SeederService } from './seeder.service';

@Controller('seeder')
export class SeederController {
    private TAG = 'SeederController';
      constructor(private seederService: SeederService) {}


    @Get('run')
      async runSeed(): Promise<void> {
        Logger.log('Running seed process', this.TAG);
        await this.seederService.clearCollections();
          
        await this.seederService.seedUsers();
        await this.seederService.seedLocations();
        await this.seederService.seedRooms();
        // await this.seederService.seedCourses();
        // await this.seederService.seedLessons();
        // await this.seederService.seedCourseRegistrations();  
        
        Logger.log('Completed seed process', this.TAG);
    }
}
