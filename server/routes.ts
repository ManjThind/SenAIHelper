import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertAssessmentSchema, insertReportSchema, insertChildSchema, shopItems, ownedItems, AIDiagnosticData } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { Messages } from '@anthropic-ai/sdk'
import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024
const ANTHROPIC_MODEL = 'claude-3-5-sonnet-20241022';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Child routes
  app.post("/api/children", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const data = insertChildSchema.parse(req.body);
      const child = await storage.createChild({
        ...data,
        parentId: req.user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      res.status(201).json(child);
    } catch (error) {
      res.status(400).json({ error: "Invalid child data" });
    }
  });

  app.get("/api/children", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const children = await storage.getChildrenByParentId(req.user.id);
      res.json(children);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch children" });
    }
  });

  // Assessment routes
  app.post("/api/assessments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const data = insertAssessmentSchema.parse(req.body);
      const assessment = await storage.createAssessment({
        ...data,
        userId: req.user.id,
        dateCreated: new Date(),
        facialAnalysisData: null,
        questionnaireData: null,
        voiceAnalysisData: null,
        status: "in_progress",
        updatedAt: new Date()
      });
      res.status(201).json(assessment);
    } catch (error) {
      res.status(400).json({ error: "Invalid assessment data" });
    }
  });

  app.get("/api/assessments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const assessments = await storage.getAssessmentsByUserId(req.user.id);
    res.json(assessments);
  });

  app.get("/api/assessments/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const assessments = await storage.getAssessmentsByUserId(req.user.id);
    const assessment = assessments.find(a => a.id === parseInt(req.params.id));
    if (!assessment) return res.sendStatus(404);
    res.json(assessment);
  });

  app.patch("/api/assessments/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const assessments = await storage.getAssessmentsByUserId(req.user.id);
      const assessment = assessments.find(a => a.id === parseInt(req.params.id));
      if (!assessment) return res.sendStatus(404);

      const updated = await storage.updateAssessment(
        parseInt(req.params.id),
        {
          ...req.body,
          updatedAt: new Date()
        }
      );
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Invalid assessment data" });
    }
  });

  // Report routes
  app.post("/api/reports", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const data = insertReportSchema.parse(req.body);
      const report = await storage.createReport({
        ...data,
        dateGenerated: new Date(),
        status: "active"
      });
      res.status(201).json(report);
    } catch (error) {
      res.status(400).json({ error: "Invalid report data" });
    }
  });

  // Add new route to get all reports
  app.get("/api/reports", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const reports = await storage.getAllReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  app.get("/api/reports/:assessmentId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const report = await storage.getReportByAssessmentId(parseInt(req.params.assessmentId));
    if (!report) return res.sendStatus(404);
    res.json(report);
  });

  // New Shop Routes
  app.get("/api/shop/items", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const items = await db.select().from(shopItems);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shop items" });
    }
  });

  app.get("/api/shop/owned-items", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const items = await db
        .select()
        .from(ownedItems)
        .where(eq(ownedItems.userId, req.user.id));
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch owned items" });
    }
  });

  app.post("/api/shop/purchase", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { itemId } = req.body;
      if (!itemId) {
        return res.status(400).json({ error: "Item ID is required" });
      }

      // Check if the item exists
      const [item] = await db
        .select()
        .from(shopItems)
        .where(eq(shopItems.id, itemId));

      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }

      // Check if user already owns this item
      const [existingOwnership] = await db
        .select()
        .from(ownedItems)
        .where(eq(ownedItems.itemId, itemId))
        .where(eq(ownedItems.userId, req.user.id));

      if (existingOwnership) {
        return res.status(400).json({ error: "You already own this item" });
      }

      // Add the item to user's owned items
      const [newOwnedItem] = await db
        .insert(ownedItems)
        .values({
          userId: req.user.id,
          itemId: itemId,
          acquiredAt: new Date(),
        })
        .returning();

      res.status(201).json(newOwnedItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to purchase item" });
    }
  });

  // New AI Diagnostic route
  app.post("/api/ai-diagnostic", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { assessmentData, childAge } = req.body;

      const prompt = `
As an expert in Special Educational Needs (SEN) diagnostics, analyze the following assessment data for a ${childAge}-year-old child. 
Provide a comprehensive analysis focusing on key developmental areas.

Assessment Data:
${JSON.stringify(assessmentData, null, 2)}

Please provide a structured analysis in JSON format with the following structure:
{
  "metrics": {
    "communicationSkills": [0-1 score],
    "socialInteraction": [0-1 score],
    "behavioralPatterns": [0-1 score],
    "emotionalRegulation": [0-1 score],
    "cognitiveFunction": [0-1 score]
  },
  "diagnosis": {
    "primaryFindings": ["list of main diagnostic findings"],
    "secondaryObservations": ["list of additional observations"],
    "confidenceLevel": [0-1 confidence score]
  },
  "recommendations": ["list of specific recommendations for support and intervention"]
}`;

      const response = await anthropic.messages.create({
        model: ANTHROPIC_MODEL,
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: prompt
        }],
        system: "You are an expert SEN diagnostician with extensive experience in child development and educational psychology.",
      });

      const content = response.content[0].type === 'text' 
        ? response.content[0].text 
        : JSON.stringify({
            metrics: {
              communicationSkills: 0,
              socialInteraction: 0,
              behavioralPatterns: 0,
              emotionalRegulation: 0,
              cognitiveFunction: 0
            },
            diagnosis: {
              primaryFindings: ['Could not generate findings'],
              secondaryObservations: [],
              confidenceLevel: 0
            },
            recommendations: ['Please try again']
          });

      const analysis: AIDiagnosticData = {
        ...JSON.parse(content),
        timestamp: new Date().toISOString(),
      };

      res.json(analysis);
    } catch (error) {
      console.error('AI Diagnostic Error:', error);
      res.status(500).json({ error: 'Failed to generate AI diagnosis' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}