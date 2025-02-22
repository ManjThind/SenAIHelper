import { useEffect, useRef, useState } from "react";
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
import { ArrowLeft, Eye, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { analyzeAttention } from "@/lib/attention-analysis";

export default function AttentionAssessmentPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tracking, setTracking] = useState<{ x: number; y: number; timestamp: number }[]>([]);
  const [isAssessing, setIsAssessing] = useState(false);
  const [target, setTarget] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [analysis, setAnalysis] = useState<any>(null);

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
        description: "Attention assessment data has been saved",
      });
    },
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !isAssessing) return;

    const moveTarget = () => {
      const x = Math.random() * (canvas.width - 40);
      const y = Math.random() * (canvas.height - 40);
      setTarget({ x, y });
    };

    const drawTarget = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(target.x + 20, target.y + 20, 20, 0, Math.PI * 2);
      ctx.fillStyle = "#4f46e5";
      ctx.fill();
    };

    const targetInterval = setInterval(moveTarget, 2000);
    const drawInterval = setInterval(drawTarget, 16);

    return () => {
      clearInterval(targetInterval);
      clearInterval(drawInterval);
    };
  }, [isAssessing, target]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isAssessing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setTracking(prev => [...prev, { x, y, timestamp: Date.now() }]);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    return () => canvas.removeEventListener("mousemove", handleMouseMove);
  }, [isAssessing]);

  const startAssessment = () => {
    setIsAssessing(true);
    setTracking([]);
    setAnalysis(null);
  };

  const stopAssessment = async () => {
    setIsAssessing(false);
    try {
      const result = await analyzeAttention(tracking);
      setAnalysis(result);
      
      updateAssessment.mutate({
        attentionAnalysisData: result,
      });
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Failed to analyze attention data",
        variant: "destructive",
      });
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
          <h1 className="text-3xl font-bold">Attention Assessment</h1>
          <p className="text-muted-foreground">
            Measure focus and visual tracking abilities
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Visual Tracking Exercise</CardTitle>
            <CardDescription>
              Follow the moving target with your cursor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-white">
              <canvas
                ref={canvasRef}
                width={500}
                height={300}
                className="border border-dashed border-gray-300 rounded-lg w-full cursor-crosshair"
              />
              <div className="flex justify-end mt-4">
                {!isAssessing ? (
                  <Button onClick={startAssessment}>
                    <Target className="h-4 w-4 mr-2" />
                    Start Exercise
                  </Button>
                ) : (
                  <Button onClick={stopAssessment} variant="destructive">
                    Stop Exercise
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Attention metrics and insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysis ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Metrics</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Aspect</TableHead>
                        <TableHead>Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(analysis.metrics).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </TableCell>
                          <TableCell>{(Number(value) * 100).toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Suggestions</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.suggestions.map((suggestion: string, index: number) => (
                      <li key={index} className="text-muted-foreground">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Overall Score</h3>
                  <p className="text-2xl font-bold">
                    {(analysis.overallScore * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Complete the exercise to see analysis results
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
