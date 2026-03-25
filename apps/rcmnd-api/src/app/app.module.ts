import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Neo4jModule } from '@lingua/neo4j';

@Module({
  imports: [Neo4jModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
