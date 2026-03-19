import { Controller, Get } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';

@Controller('neo4j')
export class Neo4jController {
    constructor(private readonly neo4jService: Neo4jService) {}

    @Get('health')
    getHealth() {
        return this.neo4jService.getHealth();
    }
}
