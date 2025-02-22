import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Assessment, QuestionnaireData, VoiceAnalysisData } from "@shared/schema";
import { Camera, Mic, Check, Square } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AssessmentPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

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
        description: "The assessment has been updated successfully",
      });
    },
  });

  const startRecording = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(audioStream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((chunks) => [...chunks, event.data]);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(recordedChunks, { type: 'audio/webm;codecs=opus' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Simple volume calculation from audio data
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(await audioBlob.arrayBuffer());
        const channelData = audioBuffer.getChannelData(0);

        let sum = 0;
        for (let i = 0; i < channelData.length; i++) {
          sum += Math.abs(channelData[i]);
        }
        const volume = sum / channelData.length;

        // Update assessment with new recording
        const currentData = assessment?.voiceAnalysisData as VoiceAnalysisData || {
          pitch: 0,
          volume: 0,
          clarity: 0,
          recordings: []
        };

        updateAssessment.mutate({
          voiceAnalysisData: {
            ...currentData,
            volume: volume * 100,
            recordings: [...currentData.recordings, audioUrl]
          }
        });

        // Clean up
        audioContext.close();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      toast({
        title: "Recording Error",
        description: "Could not start voice recording",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordedChunks([]);
    }
  };

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
    if (!videoRef.current || !window.FaceDetector) return;

    try {
      const detector = new window.FaceDetector();
      const faces = await detector.detect(videoRef.current);

      updateAssessment.mutate({
        facialAnalysisData: faces,
      });
    } catch (err) {
      toast({
        title: "Analysis Error",
        description: "Could not analyze facial features",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Facial Analysis Card */}
        <Card>
          <CardHeader>
            <CardTitle>Facial Analysis</CardTitle>
            <CardDescription>
              Capture and analyze facial expressions
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
            </div>
            <Button onClick={handleCapture} className="w-full">
              <Camera className="mr-2 h-4 w-4" />
              Capture Expression
            </Button>
          </CardContent>
        </Card>

        {/* Voice Analysis Card */}
        <Card>
          <CardHeader>
            <CardTitle>Voice Analysis</CardTitle>
            <CardDescription>
              Record and analyze speech patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "default"}
                className="w-full"
              >
                {isRecording ? (
                  <>
                    <Square className="mr-2 h-4 w-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    Start Recording
                  </>
                )}
              </Button>

              {(assessment?.voiceAnalysisData as VoiceAnalysisData)?.recordings?.length > 0 && (
                <div className="space-y-2">
                  <Label>Recorded Samples</Label>
                  <div className="space-y-2">
                    {(assessment.voiceAnalysisData as VoiceAnalysisData).recordings.map((recording, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <audio src={recording} controls className="w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Behavioral Assessment Card */}
        <Card>
          <CardHeader>
            <CardTitle>Behavioral Assessment</CardTitle>
            <CardDescription>
              Complete the questionnaire below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Does the child maintain eye contact?</Label>
              <Textarea
                placeholder="Describe the child's eye contact behavior..."
                value={(assessment?.questionnaireData as QuestionnaireData)?.eyeContact || ""}
                onChange={(e) =>
                  updateAssessment.mutate({
                    questionnaireData: {
                      ...(assessment?.questionnaireData as QuestionnaireData || {}),
                      eyeContact: e.target.value,
                    },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>How does the child respond to their name?</Label>
              <Textarea
                placeholder="Describe the child's response..."
                value={(assessment?.questionnaireData as QuestionnaireData)?.nameResponse || ""}
                onChange={(e) =>
                  updateAssessment.mutate({
                    questionnaireData: {
                      ...(assessment?.questionnaireData as QuestionnaireData || {}),
                      nameResponse: e.target.value,
                    },
                  })
                }
              />
            </div>

            <Button
              onClick={() => {
                updateAssessment.mutate({
                  status: "completed",
                });
                navigate("/");
              }}
              className="w-full"
            >
              <Check className="mr-2 h-4 w-4" />
              Complete Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}