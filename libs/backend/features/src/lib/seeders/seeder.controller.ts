import { Controller, HttpStatus } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { MongoSeederService } from './mongo-seeder.service';
import { NeoSeederService } from './neo-seeder.service';

@Controller('seeder')
export class SeederController {
  private TAG = 'SeederController';

  constructor(
    private mongoSeeder: MongoSeederService,
    private neoSeeder: NeoSeederService,
  ) {}

  @Get('all')
  async runAllSeeds(): Promise<void> {
    Logger.log('Full seed: started', this.TAG);
    await this.runMongoSeed();
    await this.runNeo4jSeed();
    Logger.log('Full seed: completed', this.TAG);
  }

  @Get('mongo')
  async runMongoSeed(): Promise<void> {
    Logger.log('MongoDb seed: started', this.TAG);
    await this.mongoSeeder.clearCollections();
    await this.mongoSeeder.seedAll();
    Logger.log('MongoDb seed: completed', this.TAG);
  }

  @Get('neo4j')
  async runNeo4jSeed(): Promise<void> {
    Logger.log('Neo4j seed: started', this.TAG);
    await this.neoSeeder.clearNeo4j();
    await this.neoSeeder.seedAll();
    Logger.log('Neo4j seed: completed', this.TAG);
  }
}
