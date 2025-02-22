import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Assessment, Report } from "@shared/schema";
import { format } from "date-fns";
import { ArrowLeft, TrendingUp, Brain, Activity, AlertCircle } from "lucide-react";

export default function ProgressPage() {
  const [, navigate] = useLocation();

  // Fetch assessments
  const { data: assessments } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments"],
  });

  // Get completed assessments
  const completedAssessments = assessments?.filter(a => a.status === "completed") || [];

  // Calculate progress metrics
  const generateProgressData = (assessments: Assessment[]) => {
    return assessments.map(assessment => ({
      date: format(new Date(assessment.dateCreated), "MMM d"),
      engagement: assessment.questionnaireData?.interactiveAssessment?.analysis?.engagement === "High" ? 3 :
                 assessment.questionnaireData?.interactiveAssessment?.analysis?.engagement === "Medium" ? 2 : 1,
      communication: assessment.questionnaireData?.interactiveAssessment?.analysis?.communication === "Strong" ? 3 :
                    assessment.questionnaireData?.interactiveAssessment?.analysis?.communication === "Moderate" ? 2 : 1,
      comprehension: assessment.questionnaireData?.interactiveAssessment?.analysis?.comprehension === "Good" ? 3 :
                    assessment.questionnaireData?.interactiveAssessment?.analysis?.comprehension === "Fair" ? 2 : 1,
    }));
  };

  const progressData = generateProgressData(completedAssessments);

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
          <h1 className="text-3xl font-bold">Progress Tracking</h1>
          <p className="text-muted-foreground">
            Monitor assessment outcomes and development trends
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Assessments
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedAssessments.length}</div>
            <p className="text-xs text-muted-foreground">
              Completed evaluations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Engagement
            </CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progressData.length > 0
                ? Math.round(
                    (progressData.reduce((acc, curr) => acc + curr.engagement, 0) /
                      progressData.length) * 100
                  ) / 100
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Scale of 1-3
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Latest Assessment
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedAssessments[0]
                ? format(new Date(completedAssessments[0].dateCreated), "MMM d")
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Most recent evaluation
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Progress Trends</CardTitle>
          <CardDescription>
            Track development across key areas over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {progressData.length > 0 ? (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 3]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="engagement"
                    stroke="#8884d8"
                    name="Engagement"
                  />
                  <Line
                    type="monotone"
                    dataKey="communication"
                    stroke="#82ca9d"
                    name="Communication"
                  />
                  <Line
                    type="monotone"
                    dataKey="comprehension"
                    stroke="#ffc658"
                    name="Comprehension"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <AlertCircle className="h-8 w-8 text-muted-foreground mr-2" />
              <p>No progress data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Assessments</CardTitle>
          <CardDescription>
            Latest completed assessment details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {completedAssessments.slice(0, 5).map((assessment) => (
              <div
                key={assessment.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{assessment.childName}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(assessment.dateCreated), "PP")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => navigate(`/assessment/${assessment.id}`)}
                >
                  View Details
                </Button>
              </div>
            ))}
            {completedAssessments.length === 0 && (
              <p className="text-center text-muted-foreground">
                No completed assessments found
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
