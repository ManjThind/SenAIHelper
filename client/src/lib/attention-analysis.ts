import * as tf from '@tensorflow/tfjs';
import { AttentionAnalysisData } from '@shared/schema';

interface AttentionMetrics {
  focusDuration: number;
  trackingAccuracy: number;
  distractibility: number;
  responseTime: number;
}

export async function analyzeAttention(
  trackingData: { x: number; y: number; timestamp: number }[]
): Promise<AttentionAnalysisData> {
  // Convert tracking data to tensor
  const trackingTensor = tf.tensor2d(
    trackingData.map(point => [point.x, point.y, point.timestamp])
  );

  // Analyze different aspects of attention
  const metrics: AttentionMetrics = {
    focusDuration: await analyzeFocusDuration(trackingTensor),
    trackingAccuracy: await analyzeTrackingAccuracy(trackingTensor),
    distractibility: await analyzeDistractibility(trackingTensor),
    responseTime: await analyzeResponseTime(trackingTensor),
  };

  // Calculate overall score
  const overallScore = calculateOverallScore(metrics);

  // Generate suggestions based on metrics
  const suggestions = generateSuggestions(metrics);

  return {
    metrics,
    suggestions,
    overallScore,
    timestamp: new Date().toISOString(),
  };
}

async function analyzeFocusDuration(data: tf.Tensor): Promise<number> {
  // Analyze continuous periods of focused attention
  return 0.75; // Placeholder value
}

async function analyzeTrackingAccuracy(data: tf.Tensor): Promise<number> {
  // Analyze accuracy in following visual targets
  return 0.8; // Placeholder value
}

async function analyzeDistractibility(data: tf.Tensor): Promise<number> {
  // Analyze response to distracting elements
  return 0.7; // Placeholder value
}

async function analyzeResponseTime(data: tf.Tensor): Promise<number> {
  // Analyze average response time to stimuli
  return 0.85; // Placeholder value
}

function calculateOverallScore(metrics: AttentionMetrics): number {
  const weights = {
    focusDuration: 0.3,
    trackingAccuracy: 0.3,
    distractibility: 0.2,
    responseTime: 0.2,
  };

  return Object.entries(metrics).reduce(
    (score, [key, value]) => score + value * weights[key as keyof AttentionMetrics],
    0
  );
}

function generateSuggestions(metrics: AttentionMetrics): string[] {
  const suggestions: string[] = [];

  if (metrics.focusDuration < 0.7) {
    suggestions.push("Consider shorter work periods with regular breaks");
  }
  if (metrics.trackingAccuracy < 0.7) {
    suggestions.push("Visual tracking exercises may be beneficial");
  }
  if (metrics.distractibility < 0.7) {
    suggestions.push("Recommend minimizing environmental distractions during tasks");
  }
  if (metrics.responseTime < 0.7) {
    suggestions.push("Practice activities that improve processing speed");
  }

  return suggestions;
}