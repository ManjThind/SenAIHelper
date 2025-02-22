import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Assessment } from "@shared/schema";
import { ArrowLeft, Loader2, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  initializeInteractiveAssessment,
  getNextInteraction,
  InteractionResponse,
} from "@/lib/interactive-assessment";

export default function InteractiveAssessmentPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentResponse, setCurrentResponse] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [responses, setResponses] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<InteractionResponse["analysis"] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

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
        title: "Assessment updated",
        description: "Interactive assessment data has been saved",
      });
    },
  });

  useEffect(() => {
    async function initializeAssessment() {
      try {
        await initializeInteractiveAssessment();
        // Get first question
        if (assessment?.childAge) {
          const interaction = await getNextInteraction(
            assessment.childAge,
            [],
            []
          );
          setQuestions([interaction.nextQuestion]);
        }
      } catch (err) {
        toast({
          title: "Initialization Error",
          description: "Could not initialize interactive assessment",
          variant: "destructive",
        });
      }
    }
    initializeAssessment();
  }, [assessment?.childAge]);

  async function handleSubmitResponse() {
    if (!currentResponse.trim() || !assessment?.childAge) return;

    setIsLoading(true);
    try {
      const newResponses = [...responses, currentResponse];
      const interaction = await getNextInteraction(
        assessment.childAge,
        questions,
        newResponses
      );

      setResponses(newResponses);
      setQuestions([...questions, interaction.nextQuestion]);
      setAnalysis(interaction.analysis);
      setCurrentResponse("");

      // Save to assessment
      updateAssessment.mutate({
        questionnaireData: {
          ...(assessment?.questionnaireData || {}),
          interactiveAssessment: {
            questions: [...questions, interaction.nextQuestion],
            responses: newResponses,
            analysis: interaction.analysis,
          },
        },
      });
    } catch (err) {
      toast({
        title: "Assessment Error",
        description: "Failed to process response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/assessment/select-type")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assessment Types
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Interactive Assessment</h1>
          <p className="text-muted-foreground">
            AI-guided interactive evaluation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Question and Response Section */}
        <Card>
          <CardHeader>
            <CardTitle>Current Question</CardTitle>
            <CardDescription>
              Respond to the AI-generated questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.length > 0 && (
              <div className="space-y-4">
                <p className="text-lg font-medium">
                  {questions[questions.length - 1]}
                </p>
                <Textarea
                  placeholder="Enter your observation of the child's response..."
                  value={currentResponse}
                  onChange={(e) => setCurrentResponse(e.target.value)}
                  rows={4}
                  className="w-full"
                />
                <Button
                  onClick={handleSubmitResponse}
                  className="w-full"
                  disabled={isLoading || !currentResponse.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Submit Response
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Section */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Analysis</CardTitle>
            <CardDescription>
              Real-time insights and observations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis ? (
              <>
                <div>
                  <h3 className="font-semibold mb-2">Communication</h3>
                  <p className="text-sm text-muted-foreground">
                    {analysis.communication}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Engagement</h3>
                  <p className="text-sm text-muted-foreground">
                    {analysis.engagement}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Comprehension</h3>
                  <p className="text-sm text-muted-foreground">
                    {analysis.comprehension}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Suggestions</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground">
                Analysis will appear after the first response
              </p>
            )}
          </CardContent>
        </Card>

        {/* History Section */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Interaction History</CardTitle>
            <CardDescription>Previous questions and responses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.slice(0, -1).map((question, index) => (
                <div key={index} className="border-b pb-4">
                  <p className="font-medium mb-2">Q: {question}</p>
                  <p className="text-muted-foreground">
                    A: {responses[index] || "No response"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
