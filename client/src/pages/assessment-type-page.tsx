import { Link, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Camera, Brain, ArrowLeft, Activity } from "lucide-react";

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
          <Link key={type.id} href={`/assessment/new/${type.id}`}>
            <Card className="hover:bg-accent/5 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <type.icon className={`h-5 w-5 mr-2 ${type.color}`} />
                  {type.title}
                </CardTitle>
                <CardDescription>{type.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
