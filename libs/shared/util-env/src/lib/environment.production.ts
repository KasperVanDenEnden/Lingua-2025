import { IEnvironment } from './environment.interface';

export const environment: IEnvironment = {
  production: true,
  dataApiUrl: 'nestjs-c9cxd8gzbyb7ajhr.westeurope-01.azurewebsites.net',
  rcmndApiUrl: 'rcmnd-api-g4dxdkcqd4fsaghr.westeurope-01.azurewebsites.net',
  mongoDbUrl: 
    'mongodb+srv://kvandenenden1_db_user:fjI2HGwNWM2pq0qv@lingua-db.v1sywge.mongodb.net/',
  SECRET_KEY: 'Blastoise',
  // NEO4J
  neo4jUrl: 'neo4j+s://02a90c73.databases.neo4j.io',
  neo4jUser: '02a90c73',
  neo4jPassword: 'JxsW1VyF9SeW0VyPQ8_yqO5EKgSEOqjSzbmBbRkvI0w',
};
