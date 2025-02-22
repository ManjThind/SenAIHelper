import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertAssessmentSchema, insertReportSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

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

  app.get("/api/reports/:assessmentId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const report = await storage.getReportByAssessmentId(parseInt(req.params.assessmentId));
    if (!report) return res.sendStatus(404);
    res.json(report);
  });

  const httpServer = createServer(app);
  return httpServer;
}