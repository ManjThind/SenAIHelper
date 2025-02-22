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
    const data = insertAssessmentSchema.parse(req.body);
    const assessment = await storage.createAssessment({
      ...data,
      userId: req.user.id,
    });
    res.status(201).json(assessment);
  });

  app.get("/api/assessments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const assessments = await storage.getAssessmentsByUserId(req.user.id);
    res.json(assessments);
  });

  app.patch("/api/assessments/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const assessment = await storage.updateAssessment(
      parseInt(req.params.id),
      req.body
    );
    res.json(assessment);
  });

  // Report routes
  app.post("/api/reports", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const data = insertReportSchema.parse(req.body);
    const report = await storage.createReport(data);
    res.status(201).json(report);
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
