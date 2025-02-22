export interface VoiceMetrics {
  pitch: number;
  volume: number;
  clarity: number;
  wordCount: number;
  speakingRate: number;
  pauseCount: number;
}

let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;

export async function initializeVoiceAnalysis() {
  audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;

  return { audioContext, analyser };
}

export async function analyzeAudioStream(audioData: Float32Array): Promise<VoiceMetrics> {
  if (!analyser) {
    throw new Error('Voice analysis not initialized');
  }

  const frequencyData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(frequencyData);

  // Calculate metrics
  const metrics = {
    pitch: calculatePitch(frequencyData),
    volume: calculateVolume(audioData),
    clarity: calculateClarity(frequencyData),
    wordCount: estimateWordCount(frequencyData),
    speakingRate: calculateSpeakingRate(frequencyData),
    pauseCount: detectPauses(audioData)
  };

  return metrics;
}

function calculatePitch(frequencyData: Uint8Array): number {
  // Find dominant frequency
  let maxValue = 0;
  let maxIndex = 0;

  for (let i = 0; i < frequencyData.length; i++) {
    if (frequencyData[i] > maxValue) {
      maxValue = frequencyData[i];
      maxIndex = i;
    }
  }

  // Convert bin index to frequency (Hz)
  return maxIndex * (audioContext?.sampleRate || 44100) / analyser!.fftSize;
}

function calculateVolume(audioData: Float32Array): number {
  // Calculate RMS volume
  const sum = audioData.reduce((acc, val) => acc + val * val, 0);
  return Math.min(Math.sqrt(sum / audioData.length) * 100, 100);
}

function calculateClarity(frequencyData: Uint8Array): number {
  // Calculate spectral centroid
  let weightedSum = 0;
  let sum = 0;

  for (let i = 0; i < frequencyData.length; i++) {
    weightedSum += i * frequencyData[i];
    sum += frequencyData[i];
  }

  return Math.min((weightedSum / sum) / frequencyData.length * 100, 100);
}

function estimateWordCount(frequencyData: Uint8Array): number {
  // Count energy peaks above threshold
  let peaks = 0;
  const threshold = 128; // Half of max byte value

  for (let i = 1; i < frequencyData.length - 1; i++) {
    if (frequencyData[i] > threshold && 
        frequencyData[i] > frequencyData[i-1] && 
        frequencyData[i] > frequencyData[i+1]) {
      peaks++;
    }
  }

  return Math.max(1, Math.floor(peaks / 5)); // Approximate syllables to words
}

function calculateSpeakingRate(frequencyData: Uint8Array): number {
  const wordCount = estimateWordCount(frequencyData);
  // Assuming 1 second of audio data
  return wordCount * 60; // Words per minute
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