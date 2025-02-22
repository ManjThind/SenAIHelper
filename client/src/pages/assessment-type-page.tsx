import { Link, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Mic, Camera, Brain, ArrowLeft, Activity, FileText, Eye, Hand, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Child } from "@shared/schema";

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
    id: "writing",
    title: "Writing Assessment",
    description: "Evaluate handwriting, text organization, and comprehension",
    icon: FileText,
    color: "text-amber-500",
  },
  {
    id: "attention",
    title: "Attention Analysis",
    description: "Measure focus duration and visual tracking patterns",
    icon: Eye,
    color: "text-indigo-500",
  },
  {
    id: "motor",
    title: "Motor Skills",
    description: "Assess fine and gross motor skill development",
    icon: Hand,
    color: "text-rose-500",
  },
  {
    id: "sensory",
    title: "Sensory Processing",
    description: "Evaluate responses to various sensory stimuli",
    icon: Zap,
    color: "text-cyan-500",
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
  const [selectedChild, setSelectedChild] = useState<string>("");

  // Fetch children list
  const { data: children } = useQuery<Child[]>({
    queryKey: ["/api/children"],
  });

  const createAssessment = useMutation({
    mutationFn: async (assessmentType: string) => {
      if (!selectedChild) {
        throw new Error("Please select a child first");
      }
      const child = children?.find(c => c.id.toString() === selectedChild);
      if (!child) {
        throw new Error("Selected child not found");
      }

      const res = await apiRequest("POST", "/api/assessments", {
        userId: user?.id,
        childId: parseInt(selectedChild),
        childName: `${child.firstName} ${child.lastName}`,
        childAge: Math.floor((new Date().getTime() - new Date(child.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
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
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
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

      {/* Child Selection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Child</CardTitle>
          <CardDescription>Choose the child to assess</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedChild}
            onValueChange={setSelectedChild}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a child" />
            </SelectTrigger>
            <SelectContent>
              {children?.map((child) => (
                <SelectItem key={child.id} value={child.id.toString()}>
                  {child.firstName} {child.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!children?.length && (
            <p className="text-sm text-muted-foreground mt-2">
              No children profiles found. <Link href="/child/new" className="text-primary hover:underline">Add a child profile</Link> first.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assessmentTypes.map((type) => (
          <Card
            key={type.id}
            className={`hover:bg-accent/5 transition-colors cursor-pointer ${!selectedChild ? 'opacity-50 pointer-events-none' : ''}`}
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