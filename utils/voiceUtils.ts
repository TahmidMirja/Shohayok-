// Robust wrapper for Web Speech API with T-3000 fault tolerance

export const speak = (text: string) => {
  if (!window.speechSynthesis) return;
  
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  
  const voices = window.speechSynthesis.getVoices();
  // Primary: Google Bangla, Secondary: Any Bangla, Tertiary: Default
  const banglaVoice = voices.find(v => v.lang === 'bn-BD') || 
                      voices.find(v => v.lang.includes('bn'));
  
  if (banglaVoice) {
    utterance.voice = banglaVoice;
    utterance.lang = banglaVoice.lang;
  } else {
    utterance.lang = 'bn-BD';
  }

  utterance.rate = 1.0;
  utterance.pitch = 0.9; // Slightly deeper T-3000 tone
  
  window.speechSynthesis.speak(utterance);
};

export const startListening = (
  onResult: (text: string) => void,
  onEnd: () => void,
  onError: (error: string) => void
): any => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    onError("SPEECH_ENGINE_NOT_FOUND: আপনার ব্রাউজার স্পিচ রিকগনিশন সাপোর্ট করে না।");
    onEnd();
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'bn-BD';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onresult = (event: any) => {
    if (event.results && event.results[0]) {
      const text = event.results[0][0].transcript;
      onResult(text);
    }
  };

  recognition.onerror = (event: any) => {
    let errorMessage = `VOICE_FAULT: ${event.error}`;
    
    if (event.error === 'network') {
      errorMessage = "UPLINK_FAILURE: ইন্টারনেট সংযোগে সমস্যা। ভয়েস সার্ভার ডিসকানেক্টেড।";
    } else if (event.error === 'not-allowed') {
      errorMessage = "ACCESS_DENIED: মাইক্রোফোন ব্যবহারের অনুমতি নেই।";
    } else if (event.error === 'no-speech') {
      errorMessage = "NO_INPUT_DETECTED: কোন শব্দ শোনা যাচ্ছে না।";
    }
    
    onError(errorMessage);
    onEnd();
  };

  recognition.onend = () => {
    onEnd();
  };

  try {
    recognition.start();
  } catch (e) {
    onError("RECOGNITION_INIT_FAILED: সিস্টেম রিস্টার্ট করুন।");
    onEnd();
  }
  
  return recognition;
};
