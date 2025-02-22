import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Assessment } from "@shared/schema";
import { ArrowLeft, Brain, Loader2, CheckCircle2, AlertTriangle, ChartBar } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { generateAIDiagnosis } from "@/lib/ai-diagnostic-analysis";

export default function AIDiagnosticPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: assessment } = useQuery<Assessment>({
    queryKey: [`/api/assessments/${id}`],
    enabled: !!id,
  });

  const updateAssessment = useMutation({
    mutationFn: async (data: Partial<Assessment>) => {
      const res = await apiRequest("PATCH", `/api/assessments/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assessments/${id}`] });
      toast({
        title: "Assessment Updated",
        description: "AI diagnostic data has been saved",
      });
    },
  });

  const handleGenerateDiagnosis = async () => {
    if (!assessment) return;

    setIsAnalyzing(true);
    try {
      const result = await generateAIDiagnosis(
        {
          facialAnalysis: assessment.facialAnalysisData,
          voiceAnalysis: assessment.voiceAnalysisData,
          writingAnalysis: assessment.writingAnalysisData,
          attentionAnalysis: assessment.attentionAnalysisData,
          questionnaire: assessment.questionnaireData,
        },
        assessment.childAge
      );

      updateAssessment.mutate({
        aiDiagnosticData: result,
      });
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Could not generate AI diagnosis",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8 pb-6 border-b">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/assessment/${id}`)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                AI Diagnostic Analysis
              </h1>
              <p className="text-muted-foreground mt-1">
                Comprehensive AI-driven assessment analysis
              </p>
            </div>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Brain className="h-5 w-5" />
              </div>
              <CardTitle>Generate Analysis</CardTitle>
            </div>
            <CardDescription>
              Use AI to analyze all assessment data and generate insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGenerateDiagnosis}
              className="w-full"
              disabled={isAnalyzing}
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing Assessment Data...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-5 w-5" />
                  Generate AI Diagnosis
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {assessment?.aiDiagnosticData && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                    <ChartBar className="h-5 w-5" />
                  </div>
                  <CardTitle>Assessment Metrics</CardTitle>
                </div>
                <CardDescription>Key developmental areas analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%]">Area</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(assessment.aiDiagnosticData.metrics).map(
                      ([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="font-medium capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-2 rounded-full bg-primary"
                                style={{ width: `${value * 100}%` }}
                              />
                              <span className="text-sm">
                                {(value * 100).toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-green-100 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <CardTitle>Primary Findings</CardTitle>
                  </div>
                  <CardDescription>
                    Key observations with{" "}
                    {(assessment.aiDiagnosticData.diagnosis.confidenceLevel * 100).toFixed(1)}%
                    {" "}confidence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {assessment.aiDiagnosticData.diagnosis.primaryFindings.map(
                      (finding, index) => (
                        <li
                          key={index}
                          className="text-muted-foreground flex items-start gap-2"
                        >
                          <span className="mt-1">•</span>
                          {finding}
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-amber-100 text-amber-600">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <CardTitle>Secondary Observations</CardTitle>
                  </div>
                  <CardDescription>Additional behavioral patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {assessment.aiDiagnosticData.diagnosis.secondaryObservations.map(
                      (observation, index) => (
                        <li
                          key={index}
                          className="text-muted-foreground flex items-start gap-2"
                        >
                          <span className="mt-1">•</span>
                          {observation}
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                    <Brain className="h-5 w-5" />
                  </div>
                  <CardTitle>Recommendations</CardTitle>
                </div>
                <CardDescription>
                  Suggested interventions and support strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {assessment.aiDiagnosticData.recommendations.map(
                    (recommendation, index) => (
                      <li
                        key={index}
                        className="text-muted-foreground flex items-start gap-2"
                      >
                        <span className="mt-1">•</span>
                        {recommendation}
                      </li>
                    )
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}