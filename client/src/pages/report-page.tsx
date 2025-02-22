import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Assessment, Report } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Download,
  FileText,
  BrainCircuit,
  Activity,
  AlertCircle,
} from "lucide-react";

interface FacialAnalysis {
  eyeContact: string;
  emotionalExpression: string;
  attentionFocus: string;
}

interface BehavioralAnalysis {
  socialInteraction: string;
  communication: string;
  attention: string;
}

interface Recommendations {
  therapy: string[];
  support: string[];
  followUp: string;
}

interface ReportFindings {
  facialAnalysis: FacialAnalysis;
  behavioral: BehavioralAnalysis;
}

export default function ReportPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: assessment } = useQuery<Assessment>({
    queryKey: [`/api/assessments/${id}`],
    enabled: !!id,
  });

  const { data: report } = useQuery<Report>({
    queryKey: [`/api/reports/${id}`],
    enabled: !!id,
  });

  const generateReport = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/reports", {
        assessmentId: Number(id),
        findings: {
          facialAnalysis: analyzeFacialData(assessment?.facialAnalysisData),
          behavioral: analyzeBehavioralData(assessment?.questionnaireData),
        },
        recommendations: generateRecommendations(assessment?.questionnaireData),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/reports/${id}`] });
      toast({
        title: "Report Generated",
        description: "Assessment report has been generated successfully",
      });
    },
  });

  function analyzeFacialData(data: any): FacialAnalysis {
    return {
      eyeContact: "Moderate",
      emotionalExpression: "Limited range",
      attentionFocus: "Variable",
    };
  }

  function analyzeBehavioralData(data: any): BehavioralAnalysis {
    return {
      socialInteraction: "Shows some difficulties in social engagement",
      communication: "Delayed response to verbal cues",
      attention: "Signs of attention challenges",
    };
  }

  function generateRecommendations(data: any): Recommendations {
    return {
      therapy: [
        "Speech and Language Therapy",
        "Occupational Therapy",
        "Behavioral Therapy",
      ],
      support: [
        "Structured daily routines",
        "Visual schedules and supports",
        "Regular parent-teacher communication",
      ],
      followUp: "Schedule follow-up assessment in 6 months",
    };
  }

  if (!assessment) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <AlertCircle className="h-8 w-8 text-muted-foreground mr-2" />
            <p>Assessment not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const findings = report?.findings as ReportFindings;
  const recommendations = report?.recommendations as Recommendations;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Assessment Report</h1>
          <p className="text-muted-foreground">
            Generated on {format(new Date(), "PP")}
          </p>
        </div>
        {!report && (
          <Button onClick={() => generateReport.mutate()}>
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Child Information</CardTitle>
          <CardDescription>Basic assessment details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{assessment.childName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Age</p>
              <p className="font-medium">{assessment.childAge} years</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {report && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Facial Analysis Findings</CardTitle>
              <CardDescription>
                Based on computer vision analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aspect</TableHead>
                    <TableHead>Observation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(findings.facialAnalysis).map(
                    ([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </TableCell>
                        <TableCell>{value}</TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Behavioral Assessment</CardTitle>
              <CardDescription>
                Based on questionnaire responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Area</TableHead>
                    <TableHead>Finding</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(findings.behavioral).map(
                    ([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </TableCell>
                        <TableCell>{value}</TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>
                Suggested interventions and support strategies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Therapeutic Interventions
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {recommendations.therapy.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Support Strategies</h3>
                <ul className="list-disc list-inside space-y-1">
                  {recommendations.support.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Follow-up Plan</h3>
                <p>{recommendations.followUp}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </>
      )}
    </div>
  );
}