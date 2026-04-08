import { Controller, Get, Logger, Param } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';
import { Id } from '@lingua/api';

@Controller('neo4j')
export class Neo4jController {
  private TAG = 'Neo4jController';

  constructor(private readonly neo4jService: Neo4jService) {}

  @Get('health')
  getHealth() {
    Logger.log('Neo4j connection check', this.TAG);
    return this.neo4jService.getHealth();
  }

  @Get('user/:id/rcmnd')
  getRecomendations(@Param('id') id: Id) {
    Logger.log('Get course recomendations', this.TAG);

    return this.neo4jService.getRecomendations(id);
  }
}
