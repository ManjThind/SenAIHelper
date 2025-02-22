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
import { ArrowLeft, Brain, Loader2 } from "lucide-react";
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
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(`/assessment/${id}`)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assessment
        </Button>
        <div>
          <h1 className="text-3xl font-bold">AI Diagnostic Analysis</h1>
          <p className="text-muted-foreground">
            Comprehensive AI-driven assessment analysis
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Generate Analysis</CardTitle>
            <CardDescription>
              Use AI to analyze all assessment data and generate insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGenerateDiagnosis}
              className="w-full"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Generate AI Diagnosis
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {assessment?.aiDiagnosticData && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Assessment Metrics</CardTitle>
                <CardDescription>Key developmental areas analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Area</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(assessment.aiDiagnosticData.metrics).map(
                      ([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </TableCell>
                          <TableCell>{(value * 100).toFixed(1)}%</TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Diagnostic Findings</CardTitle>
                <CardDescription>
                  Primary and secondary observations with {(
                    assessment.aiDiagnosticData.diagnosis.confidenceLevel * 100
                  ).toFixed(1)}
                  % confidence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Primary Findings</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {assessment.aiDiagnosticData.diagnosis.primaryFindings.map(
                      (finding, index) => (
                        <li key={index} className="text-muted-foreground">
                          {finding}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Secondary Observations
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    {assessment.aiDiagnosticData.diagnosis.secondaryObservations.map(
                      (observation, index) => (
                        <li key={index} className="text-muted-foreground">
                          {observation}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>
                  Suggested interventions and support strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {assessment.aiDiagnosticData.recommendations.map(
                    (recommendation, index) => (
                      <li key={index} className="text-muted-foreground">
                        {recommendation}
                      </li>
                    )
                  )}
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
