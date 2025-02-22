import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024
const MODEL = 'claude-3-5-sonnet-20241022';

let anthropic: Anthropic | null = null;

export async function initializeInteractiveAssessment() {
  if (!anthropic) {
    anthropic = new Anthropic({
      apiKey: process.env.VITE_ANTHROPIC_API_KEY,
    });
  }
}

export interface InteractionResponse {
  nextQuestion: string;
  analysis: {
    communication: string;
    engagement: string;
    comprehension: string;
    suggestions: string[];
  };
}

const SYSTEM_PROMPT = `You are an expert child development specialist conducting an interactive assessment for potential signs of autism or ADHD. 
Your role is to:
1. Ask age-appropriate questions that help evaluate social communication, interaction patterns, and cognitive processing
2. Analyze responses for indicators related to autism and ADHD
3. Provide professional insights while maintaining a supportive, non-judgmental approach`;

export async function getNextInteraction(
  childAge: number,
  previousQuestions: string[],
  previousResponses: string[]
): Promise<InteractionResponse> {
  if (!anthropic) {
    throw new Error('Interactive assessment not initialized');
  }

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `${SYSTEM_PROMPT}

Child's age: ${childAge}

Previous questions and responses:
${previousQuestions.map((q, i) => `Q: ${q}\nA: ${previousResponses[i] || 'No response'}`).join('\n')}

Based on these interactions, provide the next appropriate question and analyze the responses so far. Format your response as JSON with:
{
  "nextQuestion": "your next question",
  "analysis": {
    "communication": "analysis of communication style",
    "engagement": "analysis of engagement level",
    "comprehension": "analysis of understanding and processing",
    "suggestions": ["suggestion1", "suggestion2"]
  }
}`
      }
    ],
    response_format: { type: 'json_object' }
  });

  try {
    const jsonResponse = JSON.parse(response.content[0].text);
    return {
      nextQuestion: jsonResponse.nextQuestion,
      analysis: {
        communication: jsonResponse.analysis.communication,
        engagement: jsonResponse.analysis.engagement,
        comprehension: jsonResponse.analysis.comprehension,
        suggestions: jsonResponse.analysis.suggestions,
      }
    };
  } catch (error) {
    throw new Error('Failed to parse assessment response');
  }
}