export interface VoiceMetrics {
  pitch: number;
  volume: number;
  clarity: number;
  wordCount: number;
  speakingRate: number;
  pauseCount: number;
}

export async function initializeVoiceAnalysis() {
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;

  return { audioContext, analyser };
}

export async function analyzeAudioStream(audioData: Float32Array): Promise<VoiceMetrics> {
  // Calculate metrics from raw audio data
  const volume = calculateVolume(audioData);
  const { pitch, clarity } = calculateSpectralFeatures(audioData);
  const { wordCount, speakingRate } = estimateWordMetrics(audioData);
  const pauseCount = detectPauses(audioData);

  return {
    pitch,
    volume,
    clarity,
    wordCount,
    speakingRate,
    pauseCount
  };
}

function calculateVolume(audioData: Float32Array): number {
  const sum = audioData.reduce((acc, val) => acc + val * val, 0);
  return Math.min(Math.sqrt(sum / audioData.length) * 100, 100);
}

function calculateSpectralFeatures(audioData: Float32Array) {
  // Simplified spectral analysis
  let sumAmplitude = 0;
  let maxAmplitude = 0;

  for (let i = 0; i < audioData.length; i++) {
    const amplitude = Math.abs(audioData[i]);
    sumAmplitude += amplitude;
    maxAmplitude = Math.max(maxAmplitude, amplitude);
  }

  return {
    pitch: maxAmplitude * 1000, // Simplified pitch estimation
    clarity: (sumAmplitude / audioData.length) * 100
  };
}

function estimateWordMetrics(audioData: Float32Array) {
  // Simple energy-based word detection
  let crossings = 0;
  for (let i = 1; i < audioData.length; i++) {
    if (audioData[i] * audioData[i - 1] < 0) {
      crossings++;
    }
  }

  const estimatedWords = Math.max(1, Math.floor(crossings / 100));

  return {
    wordCount: estimatedWords,
    speakingRate: estimatedWords * 60 // Words per minute
  };
}

function detectPauses(audioData: Float32Array): number {
  let pauseCount = 0;
  let inPause = false;
  const threshold = 0.01;

  for (let i = 0; i < audioData.length; i++) {
    if (Math.abs(audioData[i]) < threshold) {
      if (!inPause) {
        pauseCount++;
        inPause = true;
      }
    } else {
      inPause = false;
    }
  }

  return pauseCount;
}