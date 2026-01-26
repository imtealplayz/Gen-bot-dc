import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { client } from "./discord";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.bot.status.path, (req, res) => {
    res.json({
      online: !!client.readyAt,
      tag: client.user?.tag || null,
      guilds: client.guilds.cache.size,
    });
  });

  app.get(api.bot.logs.path, async (req, res) => {
    const logs = await storage.getBotLogs();
    res.json(logs);
  });

  app.post('/api/bot/reconnect', async (req, res) => {
    try {
      if (!client.readyAt) {
        await client.login(process.env.DISCORD_TOKEN);
        res.json({ message: 'Reconnection attempt started' });
      } else {
        res.json({ message: 'Bot is already online' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to reconnect' });
    }
  });

  return httpServer;
}
