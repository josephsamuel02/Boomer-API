// src/mongodb/mongodb.service.ts
import { Injectable } from "@nestjs/common";
import { MongoClient, Db } from "mongodb";

@Injectable()
export class MongoDBService {
  private client: MongoClient;
  private db: Db;

  constructor() {
    const uri = process.env.DATABASE_URL;
    this.client = new MongoClient(uri);
    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db("artsony");
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("MongoDB connection error:", error);
    }
  }

  getDatabase(): Db {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return this.db;
  }

  async closeConnection() {
    await this.client.close();
  }
}
