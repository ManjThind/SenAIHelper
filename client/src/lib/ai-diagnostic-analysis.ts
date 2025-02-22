import { AIDiagnosticData } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface AssessmentData {
  facialAnalysis?: any;
  voiceAnalysis?: any;
  writingAnalysis?: any;
  attentionAnalysis?: any;
  questionnaire?: any;
}

export async function generateAIDiagnosis(
  assessmentData: AssessmentData,
  childAge: number
): Promise<AIDiagnosticData> {
  try {
    const response = await apiRequest("POST", "/api/ai-diagnostic", {
      assessmentData,
      childAge,
    });

    const analysis = await response.json();
    if (!response.ok) {
      throw new Error(analysis.error || 'Failed to generate AI diagnosis');
    }

    return analysis;
  } catch (error) {
    console.error('AI Diagnosis Error:', error);
    throw new Error('Failed to generate AI diagnosis');
  }
}