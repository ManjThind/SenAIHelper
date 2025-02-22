import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { Assessment, QuestionnaireData } from "@shared/schema";
import { Square, Loader2, ArrowLeft, Camera, Mic, Check } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { initializeVoiceAnalysis, analyzeAudioStream, VoiceMetrics } from "@/lib/voice-analysis";
import { Progress } from "@/components/ui/progress";

export default function AssessmentPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceMetrics, setVoiceMetrics] = useState<VoiceMetrics | null>(null);
  const [voiceAnalysisReady, setVoiceAnalysisReady] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

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

  useEffect(() => {
    async function setupVoiceAnalysis() {
      try {
        const { audioContext, analyser } = await initializeVoiceAnalysis();
        setAudioContext(audioContext);
        setAnalyser(analyser);
        setVoiceAnalysisReady(true);
        toast({
          title: "Voice Analysis Ready",
          description: "Voice analysis system initialized successfully",
        });
      } catch (err) {
        toast({
          title: "Voice Analysis Error",
          description: "Could not initialize voice analysis",
          variant: "destructive",
        });
      }
    }
    setupVoiceAnalysis();

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (!audioContext || !analyser) {
        throw new Error('Voice analysis not initialized');
      }

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      source.connect(analyser);
      analyser.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = async (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const metrics = await analyzeAudioStream(inputData);
        setVoiceMetrics(metrics);

        const currentVoiceData = assessment?.voiceAnalysisData || {};
        updateAssessment.mutate({
          voiceAnalysisData: {
            ...currentVoiceData,
            metrics,
            recordings: currentVoiceData.recordings || []
          }
        });
      };

      processorRef.current = processor;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((chunks) => [...chunks, event.data]);
        }
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

      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }

      const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);

      const currentVoiceData = assessment?.voiceAnalysisData || {};
      updateAssessment.mutate({
        voiceAnalysisData: {
          ...currentVoiceData,
          recordings: [...(currentVoiceData.recordings || []), audioUrl]
        }
      });

      setRecordedChunks([]);
    }
  };

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
          <h1 className="text-3xl font-bold">Conduct Assessment</h1>
          <p className="text-muted-foreground">
            Record and analyze assessment data
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Facial Analysis</CardTitle>
            <CardDescription>
              Capture and analyze facial expressions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate(`/assessment/${id}/facial`)}
              className="w-full"
            >
              <Camera className="mr-2 h-4 w-4" />
              Start Facial Analysis
            </Button>
          </CardContent>
        </Card>

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
                disabled={!voiceAnalysisReady}
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

              {voiceMetrics && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Volume</span>
                      <span>{Math.round(voiceMetrics.volume)}%</span>
                    </div>
                    <Progress value={voiceMetrics.volume} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Clarity</span>
                      <span>{Math.round(voiceMetrics.clarity)}%</span>
                    </div>
                    <Progress value={voiceMetrics.clarity} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Speaking Rate</span>
                      <p className="font-medium">{voiceMetrics.speakingRate} words/min</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Word Count</span>
                      <p className="font-medium">{voiceMetrics.wordCount} words</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Pauses</span>
                      <p className="font-medium">{voiceMetrics.pauseCount} detected</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Pitch</span>
                      <p className="font-medium">{Math.round(voiceMetrics.pitch)}Hz</p>
                    </div>
                  </div>
                </div>
              )}

              {assessment?.voiceAnalysisData?.recordings?.length > 0 && (
                <div className="space-y-2">
                  <Label>Recorded Samples</Label>
                  <div className="space-y-2">
                    {assessment.voiceAnalysisData.recordings.map((recording, index) => (
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

        <Card className="md:col-span-2">
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
                value={assessment?.questionnaireData?.eyeContact || ""}
                onChange={(e) =>
                  updateAssessment.mutate({
                    questionnaireData: {
                      ...(assessment?.questionnaireData || {}),
                      eyeContact: e.target.value,
                    } as QuestionnaireData,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>How does the child respond to their name?</Label>
              <Textarea
                placeholder="Describe the child's response..."
                value={assessment?.questionnaireData?.nameResponse || ""}
                onChange={(e) =>
                  updateAssessment.mutate({
                    questionnaireData: {
                      ...(assessment?.questionnaireData || {}),
                      nameResponse: e.target.value,
                    } as QuestionnaireData,
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