import { Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import neo4j, { Driver, Session } from 'neo4j-driver';
import { environment } from '@lingua/util-env';

@Injectable()
export class Neo4jService implements OnModuleInit, OnApplicationShutdown {
    private driver!: Driver;

    async onModuleInit() {
            console.log('NEO4J URL:', environment.neo4jUrl);  // add this

        this.driver = neo4j.driver(
            environment.neo4jUrl,
            neo4j.auth.basic(
                environment.neo4jUser,
                environment.neo4jPassword,
            ),
        );
        await this.driver.verifyConnectivity();
        await this.createConstraints();
    }
    
    async onApplicationShutdown() {
        await this.driver?.close();
    }

    getSession(): Session {
        return this.driver.session();
    }

    async getHealth() {
        try {
            await this.driver.verifyConnectivity();
            return { status: 'ok', message: 'Neo4j connected' };
        } catch (err: any) {
            return { status: 'error', message: err.message };
        }
    }

    private async createConstraints() {
        const session = this.getSession();
        try {
            await session.run(`CREATE CONSTRAINT IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE`);
            await session.run(`CREATE CONSTRAINT IF NOT EXISTS FOR (c:Class) REQUIRE c.id IS UNIQUE`);
            await session.run(`CREATE CONSTRAINT IF NOT EXISTS FOR (l:Lesson) REQUIRE l.id IS UNIQUE`);
            await session.run(`CREATE CONSTRAINT IF NOT EXISTS FOR (r:Room) REQUIRE r.id IS UNIQUE`);
            await session.run(`CREATE CONSTRAINT IF NOT EXISTS FOR (loc:Location) REQUIRE loc.id IS UNIQUE`);
            console.log('✅ Neo4j constraints created');
        } catch (err: any) {
            console.error('❌ Failed to create constraints:', err.message);
        } finally {
            await session.close();
        }
    }
}
