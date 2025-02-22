import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Assessment, QuestionnaireData } from "@shared/schema";
import { ArrowLeft, Camera, Mic, Brain, FileText, Eye, Check, ClipboardList } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function AssessmentPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: assessment, isLoading } = useQuery<Assessment>({
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
        title: "Assessment updated",
        description: "The assessment has been updated successfully",
      });
    },
  });

  if (isLoading) {
    return <LoadingScreen message="Loading your assessment..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8 pb-6 border-b">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/assessment/select-type")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                Assessment Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Complete assessment modules for {assessment?.childName}
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              updateAssessment.mutate({
                status: "completed",
              });
              navigate("/");
            }}
            size="lg"
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            Complete Assessment
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <Camera className="h-5 w-5" />
                </div>
                <CardTitle>Facial Analysis</CardTitle>
              </div>
              <CardDescription>
                Capture and analyze facial expressions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate(`/assessment/${id}/facial`)}
                className="w-full"
                variant="outline"
              >
                Start Facial Analysis
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <Mic className="h-5 w-5" />
                </div>
                <CardTitle>Voice Analysis</CardTitle>
              </div>
              <CardDescription>
                Record and analyze speech patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate(`/assessment/${id}/voice`)}
                className="w-full"
                variant="outline"
              >
                Start Voice Analysis
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                  <Brain className="h-5 w-5" />
                </div>
                <CardTitle>Interactive Analysis</CardTitle>
              </div>
              <CardDescription>
                AI-guided interactive evaluation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate(`/assessment/${id}/interactive`)}
                className="w-full"
                variant="outline"
              >
                Start Interactive Analysis
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-amber-100 text-amber-600">
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle>Writing Analysis</CardTitle>
              </div>
              <CardDescription>
                Evaluate handwriting and text organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate(`/assessment/${id}/writing`)}
                className="w-full"
                variant="outline"
              >
                Start Writing Analysis
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
                  <Eye className="h-5 w-5" />
                </div>
                <CardTitle>Attention Analysis</CardTitle>
              </div>
              <CardDescription>
                Measure focus and visual tracking abilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate(`/assessment/${id}/attention`)}
                className="w-full"
                variant="outline"
              >
                Start Attention Analysis
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-rose-100 text-rose-600">
                  <Brain className="h-5 w-5" />
                </div>
                <CardTitle>AI Diagnostic Analysis</CardTitle>
              </div>
              <CardDescription>
                Get comprehensive AI-powered insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate(`/assessment/${id}/ai-diagnostic`)}
                className="w-full"
                variant="outline"
              >
                View AI Analysis
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-slate-100 text-slate-600">
                <ClipboardList className="h-5 w-5" />
              </div>
              <CardTitle>Behavioral Assessment</CardTitle>
            </div>
            <CardDescription>
              Complete the questionnaire below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base">Does the child maintain eye contact?</Label>
                <Textarea
                  placeholder="Describe the child's eye contact behavior..."
                  value={assessment?.questionnaireData?.eyeContact || ""}
                  onChange={(e) =>
                    updateAssessment.mutate({
                      questionnaireData: {
                        ...(assessment?.questionnaireData || {}),
                        eyeContact: e.target.value,
                      } as QuestionnaireData,
                    })
                  }
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base">How does the child respond to their name?</Label>
                <Textarea
                  placeholder="Describe the child's response..."
                  value={assessment?.questionnaireData?.nameResponse || ""}
                  onChange={(e) =>
                    updateAssessment.mutate({
                      questionnaireData: {
                        ...(assessment?.questionnaireData || {}),
                        nameResponse: e.target.value,
                      } as QuestionnaireData,
                    })
                  }
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}