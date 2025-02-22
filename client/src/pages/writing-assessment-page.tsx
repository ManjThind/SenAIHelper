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
import { ArrowLeft, FileText, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { analyzeHandwriting } from "@/lib/writing-analysis";

export default function WritingAssessmentPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<number[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
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
        description: "Writing assessment data has been saved",
      });
    },
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const handleMouseDown = (e: MouseEvent) => {
      setIsDrawing(true);
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctx.beginPath();
      ctx.moveTo(x, y);
      setStrokes([[x, y]]);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctx.lineTo(x, y);
      ctx.stroke();
      setStrokes(prev => [...prev, [x, y]]);
    };

    const handleMouseUp = () => {
      setIsDrawing(false);
      ctx.closePath();
      analyzeCurrentWriting();
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [isDrawing]);

  const analyzeCurrentWriting = async () => {
    try {
      const result = await analyzeHandwriting(strokes);
      setAnalysis(result);
      
      // Save analysis to assessment
      updateAssessment.mutate({
        writingAnalysisData: result,
      });
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Failed to analyze writing",
        variant: "destructive",
      });
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokes([]);
    setAnalysis(null);
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
          <h1 className="text-3xl font-bold">Writing Assessment</h1>
          <p className="text-muted-foreground">
            Analyze handwriting patterns and motor skills
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Writing Area</CardTitle>
            <CardDescription>
              Write or draw in the space below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-white">
              <canvas
                ref={canvasRef}
                width={500}
                height={300}
                className="border border-dashed border-gray-300 rounded-lg w-full"
              />
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={clearCanvas}
                  className="mr-2"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button onClick={analyzeCurrentWriting}>
                  <FileText className="h-4 w-4 mr-2" />
                  Analyze
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Writing metrics and suggestions
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
                            {key}
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
                Write something to see the analysis
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
