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
import { useToast } from "@/hooks/use-toast";
import { Assessment } from "@shared/schema";
import { Camera, Loader2, ArrowLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { initializeFaceDetection, detectFace } from "@/lib/face-detection";

export default function FacialAnalysisPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

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
        description: "Facial analysis data has been saved",
      });
    },
  });

  useEffect(() => {
    const loadModels = async () => {
      try {
        await initializeFaceDetection();
        setModelsLoaded(true);
        toast({
          title: "Ready",
          description: "Face detection models loaded successfully",
        });
      } catch (err) {
        toast({
          title: "Model Loading Error",
          description: "Could not load face detection models",
          variant: "destructive",
        });
      }
    };
    loadModels();
  }, []);

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
    if (!videoRef.current || !modelsLoaded) return;

    setIsAnalyzing(true);
    try {
      const faceData = await detectFace(videoRef.current);
      if (!faceData) {
        toast({
          title: "No Face Detected",
          description: "Please ensure the subject is facing the camera",
          variant: "destructive",
        });
        return;
      }

      updateAssessment.mutate({
        facialAnalysisData: faceData,
      });
    } catch (err) {
      toast({
        title: "Analysis Error",
        description: "Could not analyze facial features",
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
          <h1 className="text-3xl font-bold">Facial Analysis</h1>
          <p className="text-muted-foreground">
            Record and analyze facial expressions
          </p>
        </div>
      </div>

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
            disabled={!modelsLoaded || isAnalyzing}
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
    </div>
  );
}
