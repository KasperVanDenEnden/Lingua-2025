import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SchemasModule } from '@lingua/schemas';
import { MongooseModule } from '@nestjs/mongoose';
import { environment } from '@lingua/util-env';
import { FeaturesModule } from '@lingua/features';
import { Neo4jModule } from '@lingua/neo4j';

@Module({
  imports: [
    FeaturesModule,
    SchemasModule,
    MongooseModule.forRoot(environment.mongoDbUrl),
    Neo4jModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
