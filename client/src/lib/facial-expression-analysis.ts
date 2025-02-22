import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@mediapipe/face_detection';
import { FacialAnalysisData } from '@shared/schema';

interface EmotionMetrics {
  happiness: number;
  sadness: number;
  anger: number;
  surprise: number;
  neutral: number;
  fear: number;
}

export async function analyzeFacialExpression(
  video: HTMLVideoElement
): Promise<FacialAnalysisData> {
  // Initialize face detection
  const detector = await tf.loadGraphModel('/models/face_expression_model');

  // Get video frame as tensor
  const videoTensor = tf.browser.fromPixels(video);
  const resized = tf.image.resizeBilinear(videoTensor, [224, 224]);
  const normalized = resized.div(255.0);
  const batched = normalized.expandDims(0);

  // Run prediction
  const predictions = await detector.predict(batched);
  const emotionScores = await predictions.data();

  // Calculate metrics
  const metrics: EmotionMetrics = {
    happiness: emotionScores[0],
    sadness: emotionScores[1], 
    anger: emotionScores[2],
    surprise: emotionScores[3],
    neutral: emotionScores[4],
    fear: emotionScores[5]
  };

  // Generate suggestions based on emotional state
  const suggestions = generateSuggestions(metrics);

  // Calculate overall emotional engagement score
  const overallScore = calculateOverallScore(metrics);

  // Cleanup tensors
  videoTensor.dispose();
  resized.dispose();
  normalized.dispose();
  batched.dispose();
  predictions.dispose();

  return {
    metrics,
    suggestions,
    overallScore,
    timestamp: new Date().toISOString(),
  };
}

function generateSuggestions(metrics: EmotionMetrics): string[] {
  const suggestions: string[] = [];

  if (metrics.happiness > 0.7) {
    suggestions.push("Strong positive emotional engagement detected");
  }
  if (metrics.sadness > 0.7) {
    suggestions.push("Consider activities to improve emotional state");
  }
  if (metrics.anger > 0.6) {
    suggestions.push("Recommend calming exercises or breaks");
  }
  if (metrics.fear > 0.6) {
    suggestions.push("Consider reducing environmental stressors");
  }
  if (metrics.neutral > 0.8) {
    suggestions.push("Encourage more emotional expression and engagement");
  }

  return suggestions;
}

function calculateOverallScore(metrics: EmotionMetrics): number {
  const weights = {
    happiness: 0.3,
    sadness: 0.15,
    anger: 0.15,
    surprise: 0.15,
    neutral: 0.15,
    fear: 0.1,
  };

  return Object.entries(metrics).reduce(
    (score, [key, value]) => score + value * weights[key as keyof EmotionMetrics],
    0
  );
}