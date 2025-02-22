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
import { useToast } from "@/hooks/use-toast";
import { Assessment } from "@shared/schema";
import { Camera, Loader2, ArrowLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { analyzeFacialExpression } from "@/lib/facial-expression-analysis";

export default function FacialAnalysisPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
        description: "Facial analysis data has been saved",
      });
    },
  });

  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        toast({
          title: "Camera Error",
          description: "Could not access camera",
          variant: "destructive",
        });
      }
    }

    setupCamera();
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function handleCapture() {
    if (!videoRef.current) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeFacialExpression(videoRef.current);
      setAnalysis(result);

      updateAssessment.mutate({
        facialAnalysisData: result,
      });
    } catch (err) {
      toast({
        title: "Analysis Error",
        description: "Could not analyze facial expressions",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }

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
          <h1 className="text-3xl font-bold">Facial Expression Analysis</h1>
          <p className="text-muted-foreground">
            Analyze emotional expressions and responses
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Video Capture</CardTitle>
            <CardDescription>
              Record and analyze facial expressions in real-time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {isAnalyzing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
            </div>
            <Button
              onClick={handleCapture}
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
                  <Camera className="mr-2 h-4 w-4" />
                  Capture Expression
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Emotional expression metrics and insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysis ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Emotion Metrics</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Emotion</TableHead>
                        <TableHead>Intensity</TableHead>
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
                  <h3 className="text-lg font-semibold mb-2">Overall Emotional Engagement</h3>
                  <p className="text-2xl font-bold">
                    {(analysis.overallScore * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Capture an expression to see analysis results
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}