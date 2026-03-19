export interface IEnvironment {
    SECRET_KEY: string;
    production: boolean;
    dataApiUrl: string;
    mongoDbUrl: string;
    neo4jUrl: string;
    neo4jUser: string;
    neo4jPassword: string;
}