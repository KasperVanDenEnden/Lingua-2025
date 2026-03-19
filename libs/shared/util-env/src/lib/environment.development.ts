import { IEnvironment } from "./environment.interface";

export const environment: IEnvironment = {
    production: false,
    dataApiUrl: 'http://localhost:3000/api',
    // mongoDbUrl: 'mongodb://127.0.0.1:27017/lingua?replicaSet=rs0',
    mongoDbUrl: 'mongodb+srv://kvandenenden1_db_user:fjI2HGwNWM2pq0qv@lingua-db.v1sywge.mongodb.net/',
    SECRET_KEY: 'Blastoise',
    // NEO4J
    neo4jUrl: 'neo4j://127.0.0.1:7687',
    neo4jUser: 'neo4j',
    neo4jPassword: 'K!travel6'
}