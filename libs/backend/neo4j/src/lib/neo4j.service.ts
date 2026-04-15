import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import neo4j, { Driver, Session } from 'neo4j-driver';
import { environment } from '@lingua/util-env';
import { Id } from '@lingua/api';
import { RCMND_CYPHER } from '@lingua/api';

@Injectable()
export class Neo4jService implements OnModuleInit, OnApplicationShutdown {
  private driver!: Driver;

  async onModuleInit() {
    this.driver = neo4j.driver(
      environment.neo4jUrl,
      neo4j.auth.basic(environment.neo4jUser, environment.neo4jPassword),
    );
    await this.driver.verifyConnectivity();
    // await this.createConstraints();
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
      await session.run(
        `CREATE CONSTRAINT IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE`,
      );
      await session.run(
        `CREATE CONSTRAINT IF NOT EXISTS FOR (c:Course) REQUIRE c.id IS UNIQUE`,
      );
      await session.run(
        `CREATE CONSTRAINT IF NOT EXISTS FOR (l:Lesson) REQUIRE l.id IS UNIQUE`,
      );
      console.log('✅ Neo4j constraints created');
    } catch (err: any) {
      console.error('❌ Failed to create constraints:', err.message);
    } finally {
      await session.close();
    }
  }

  async run(cypher: string, params: Record<string, any> = {}) {
    const session = this.getSession();
    try {
      return await session.run(cypher, params);
    } finally {
      await session.close();
    }
  }

  async getRecomendations(id: Id) {
    const results = await this.run(RCMND_CYPHER, { userId: id });

    const mappedResults = results.records.map((record) => ({
      course: record.get('c').properties,
      rating: record.get('rating'),
      recommendedBy: record.get('friend').properties,
    }));

    const unique = Array.from(
      new Map(mappedResults.map((r) => [r.course.id, r])).values()
    );

    return unique;
  }
}
