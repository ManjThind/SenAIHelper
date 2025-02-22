import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Camera, Brain, ArrowLeft, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

const assessmentTypes = [
  {
    id: "voice",
    title: "Voice Analysis",
    description: "Analyze speech patterns and vocal characteristics",
    icon: Mic,
    color: "text-blue-500",
  },
  {
    id: "facial",
    title: "Facial Expression Analysis",
    description: "Evaluate facial expressions and emotional responses",
    icon: Camera,
    color: "text-green-500",
  },
  {
    id: "interactive",
    title: "Interactive Analysis",
    description: "Assess social interaction and communication skills",
    icon: Brain,
    color: "text-purple-500",
  },
  {
    id: "behavioral",
    title: "Behavioral Analysis",
    description: "Monitor and analyze behavioral patterns",
    icon: Activity,
    color: "text-orange-500",
  },
];

export default function AssessmentTypePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const createAssessment = useMutation({
    mutationFn: async (assessmentType: string) => {
      const res = await apiRequest("POST", "/api/assessments", {
        userId: user?.id,
        childName: "Test Child", // This should come from a form
        childAge: 5, // This should come from a form
        status: "in_progress",
        type: assessmentType
      });
      return res.json();
    },
    onSuccess: (assessment) => {
      toast({
        title: "Assessment Created",
        description: "Starting your new assessment session",
      });
      navigate(`/assessment/${assessment.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not create assessment",
        variant: "destructive",
      });
    },
  });

  const handleTypeSelect = (typeId: string) => {
    createAssessment.mutate(typeId);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Select Assessment Type</h1>
          <p className="text-muted-foreground">
            Choose the type of assessment you want to conduct
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assessmentTypes.map((type) => (
          <Card 
            key={type.id} 
            className="hover:bg-accent/5 transition-colors cursor-pointer"
            onClick={() => handleTypeSelect(type.id)}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <type.icon className={`h-5 w-5 mr-2 ${type.color}`} />
                {type.title}
              </CardTitle>
              <CardDescription>{type.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}