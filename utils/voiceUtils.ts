// Simple wrapper for Web Speech API

export const speak = (text: string, voiceURI?: string) => {
  if (!window.speechSynthesis) return;
  
  // Cancel previous
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Try to find a Bangla voice if available, otherwise default
  const voices = window.speechSynthesis.getVoices();
  const banglaVoice = voices.find(v => v.lang.includes('bn'));
  
  if (banglaVoice) {
    utterance.voice = banglaVoice;
    utterance.lang = banglaVoice.lang;
  }

  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  
  window.speechSynthesis.speak(utterance);
};

export const startListening = (
  onResult: (text: string) => void,
  onEnd: () => void
): any => { // Returns recognition instance
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    alert("Voice input not supported in this browser.");
    onEnd();
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'bn-BD'; // Default to Bangla (Bangladesh)
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    const text = event.results[0][0].transcript;
    onResult(text);
  };

  recognition.onerror = (event: any) => {
    console.error("Speech recognition error", event.error);
    onEnd();
  };

  recognition.onend = () => {
    onEnd();
  };

  recognition.start();
  return recognition;
};
