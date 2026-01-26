import { type User, type InsertUser, type BotLog, type InsertBotLog, type DiscordUser } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getBotLogs(): Promise<BotLog[]>;
  createBotLog(message: string): Promise<BotLog>;
  // Discord user specific
  getDiscordUser(id: string): Promise<DiscordUser>;
  updateDiscordUserGenies(id: string, amount: number): Promise<DiscordUser>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private discordUsers: Map<string, DiscordUser>;
  private logs: BotLog[];

  constructor() {
    this.users = new Map();
    this.discordUsers = new Map();
    this.logs = [];
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getBotLogs(): Promise<BotLog[]> {
    return [...this.logs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 50);
  }

  async createBotLog(message: string): Promise<BotLog> {
    const log: BotLog = {
      id: randomUUID(),
      message,
      timestamp: new Date(),
    };
    this.logs.push(log);
    return log;
  }

  async getDiscordUser(id: string): Promise<DiscordUser> {
    let user = this.discordUsers.get(id);
    if (!user) {
      user = { id, genies: 100, lastClaimedDate: null };
      this.discordUsers.set(id, user);
    }
    return user;
  }

  async updateDiscordUserClaim(id: string, date: string): Promise<void> {
    const user = await this.getDiscordUser(id);
    user.lastClaimedDate = date;
    this.discordUsers.set(id, user);
  }

  async resetAllGenies(): Promise<void> {
    this.discordUsers.forEach((user, id) => {
      user.genies = 100;
      this.discordUsers.set(id, user);
    });
  }

  async grantToAll(amount: number): Promise<void> {
    this.discordUsers.forEach((user, id) => {
      user.genies += amount;
      this.discordUsers.set(id, user);
    });
  }

  async updateDiscordUserGenies(id: string, amount: number): Promise<DiscordUser> {
    const user = await this.getDiscordUser(id);
    user.genies = amount;
    this.discordUsers.set(id, user);
    return user;
  }

  async getAllDiscordUsers(): Promise<DiscordUser[]> {
    return Array.from(this.discordUsers.values());
  }
}

export const storage = new MemStorage();
