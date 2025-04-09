import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCipherHistorySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Endpoint for server-side encryption (optional enhancement)
  app.post('/api/encrypt', (req, res) => {
    try {
      const { text, algorithm, key } = req.body;
      
      if (!text || !algorithm || !key) {
        return res.status(400).json({ 
          message: 'Missing required parameters: text, algorithm, and key are required' 
        });
      }

      // In a real implementation, we would use the Node.js crypto module here
      // This is just a placeholder to demonstrate the API structure
      res.json({ 
        success: true,
        message: 'Encryption is handled client-side using crypto-js'
      });

    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: `Server error during encryption: ${error.message}` });
      } else {
        res.status(500).json({ message: 'Unknown server error during encryption' });
      }
    }
  });

  // Endpoint for server-side decryption (optional enhancement)
  app.post('/api/decrypt', (req, res) => {
    try {
      const { text, algorithm, key } = req.body;
      
      if (!text || !algorithm || !key) {
        return res.status(400).json({ 
          message: 'Missing required parameters: text, algorithm, and key are required' 
        });
      }

      // In a real implementation, we would use the Node.js crypto module here
      // This is just a placeholder to demonstrate the API structure
      res.json({ 
        success: true,
        message: 'Decryption is handled client-side using crypto-js'
      });
      
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: `Server error during decryption: ${error.message}` });
      } else {
        res.status(500).json({ message: 'Unknown server error during decryption' });
      }
    }
  });

  // Save cipher operation history
  app.post('/api/cipher-history', async (req, res) => {
    try {
      const historyData = insertCipherHistorySchema.parse(req.body);
      const savedHistory = await storage.saveCipherHistory(historyData);
      res.status(201).json(savedHistory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: 'Invalid data format', 
          errors: error.errors
        });
      } else if (error instanceof Error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
      } else {
        res.status(500).json({ message: 'Unknown server error' });
      }
    }
  });

  // Get all cipher history entries (with optional limit)
  app.get('/api/cipher-history', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const histories = await storage.getCipherHistories(limit);
      res.json(histories);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
      } else {
        res.status(500).json({ message: 'Unknown server error' });
      }
    }
  });

  // Get a specific cipher history entry by ID
  app.get('/api/cipher-history/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      
      const history = await storage.getCipherHistoryById(id);
      if (!history) {
        return res.status(404).json({ message: 'History entry not found' });
      }
      
      res.json(history);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
      } else {
        res.status(500).json({ message: 'Unknown server error' });
      }
    }
  });
  
  // Clear all cipher history
  app.delete('/api/cipher-history', async (req, res) => {
    try {
      await storage.clearCipherHistories();
      res.status(200).json({ message: 'All history records cleared successfully' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
      } else {
        res.status(500).json({ message: 'Unknown server error' });
      }
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
