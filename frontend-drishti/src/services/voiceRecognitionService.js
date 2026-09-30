/**
 * Enhanced Voice Recognition Service using Web Speech Recognition API
 * Enables completely hands-free control for visually impaired users with continuous listening.
 */
class VoiceRecognitionService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.shouldStayListening = false;
    this.onCommand = null;
    this.onError = null;
    this.onStatusChange = null;

    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.isListening = true;
          if (this.onStatusChange) this.onStatusChange(true);
        };

        this.recognition.onend = () => {
          this.isListening = false;
          // Auto-restart if user wanted continuous listening mode
          if (this.shouldStayListening) {
            try {
              setTimeout(() => {
                if (this.shouldStayListening && !this.isListening) {
                  this.recognition.start();
                }
              }, 400);
            } catch (err) {
              console.warn('Auto-restart recognition error:', err);
              if (this.onStatusChange) this.onStatusChange(false);
            }
          } else {
            if (this.onStatusChange) this.onStatusChange(false);
          }
        };

        this.recognition.onerror = (event) => {
          console.warn('Speech recognition error event:', event.error);
          if (event.error === 'not-allowed') {
            this.shouldStayListening = false;
            this.isListening = false;
            if (this.onStatusChange) this.onStatusChange(false);
          }
          if (this.onError) this.onError(event.error);
        };

        this.recognition.onresult = (event) => {
          const last = event.results.length - 1;
          const phrase = event.results[last][0].transcript.trim().toLowerCase();
          console.log('🗣️ Drishti Voice Recognized:', phrase);
          this._handleTranscript(phrase);
        };
      }
    }
  }

  isSupported() {
    return Boolean(this.recognition);
  }

  start() {
    if (this.recognition) {
      this.shouldStayListening = true;
      if (!this.isListening) {
        try {
          this.recognition.start();
        } catch (err) {
          console.warn('Voice recognition start error:', err);
        }
      }
    }
  }

  stop() {
    this.shouldStayListening = false;
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('Voice recognition stop error:', err);
      }
    }
  }

  toggle() {
    if (this.isListening || this.shouldStayListening) this.stop();
    else this.start();
  }

  _handleTranscript(rawPhrase) {
    if (!this.onCommand) return;
    const phrase = rawPhrase.toLowerCase();

    // 1. RETAKE / GO BACK / RETURN TO CAMERA
    if (
      phrase.includes('go back') ||
      phrase.includes('back to camera') ||
      phrase.includes('back') ||
      phrase.includes('return') ||
      phrase.includes('scan again') ||
      phrase.includes('new scan') ||
      phrase.includes('retake') ||
      phrase.includes('re-take') ||
      phrase.includes('re take') ||
      phrase.includes('take again') ||
      phrase.includes('try again') ||
      phrase.includes('reset') ||
      phrase.includes('discard') ||
      phrase.includes('clear')
    ) {
      return this.onCommand({ type: 'RETAKE' });
    }

    // 2. TAP TO SCAN / CAPTURE
    if (
      phrase.includes('tap to scan') ||
      phrase.includes('scan') ||
      phrase.includes('capture') ||
      phrase.includes('take photo') ||
      phrase.includes('take picture') ||
      phrase.includes('snap') ||
      phrase.includes('look') ||
      phrase.includes('what is this') ||
      phrase.includes('start scan')
    ) {
      return this.onCommand({ type: 'CAPTURE' });
    }

    // 3. EMERGENCY / SOS
    if (
      phrase.includes('emergency') ||
      phrase.includes('sos') ||
      phrase.includes('call emergency') ||
      phrase.includes('help me') ||
      phrase.includes('danger call') ||
      phrase.includes('contact')
    ) {
      return this.onCommand({ type: 'EMERGENCY' });
    }

    // 4. SAFETY ALERT / HAZARD
    if (
      phrase.includes('safety alert') ||
      phrase.includes('tap to safety alert') ||
      phrase.includes('safety') ||
      phrase.includes('hazard') ||
      phrase.includes('danger') ||
      phrase.includes('obstacle') ||
      phrase.includes('warning') ||
      phrase.includes('stairs')
    ) {
      return this.onCommand({ type: 'MODE', mode: 'hazard' });
    }

    // 5. FIND OBJECT
    if (
      phrase.includes('find object') ||
      phrase.includes('find') ||
      phrase.includes('locate') ||
      phrase.includes('where is') ||
      phrase.includes('search object')
    ) {
      const target = phrase.replace(/find object|find|where is|locate|search object/gi, '').trim();
      return this.onCommand({ type: 'MODE', mode: 'object', prompt: target });
    }

    // 6. READ TEXT / MEDICINE / BOOK
    if (
      phrase.includes('read text') ||
      phrase.includes('read') ||
      phrase.includes('medicine') ||
      phrase.includes('document') ||
      phrase.includes('book') ||
      phrase.includes('label') ||
      phrase.includes('sign') ||
      phrase.includes('ocr')
    ) {
      return this.onCommand({ type: 'MODE', mode: 'text' });
    }

    // 7. CURRENCY
    if (
      phrase.includes('currency') ||
      phrase.includes('money') ||
      phrase.includes('rupee') ||
      phrase.includes('coin') ||
      phrase.includes('note') ||
      phrase.includes('cash') ||
      phrase.includes('how much')
    ) {
      return this.onCommand({ type: 'MODE', mode: 'currency' });
    }

    // 8. GENERAL SCENE
    if (
      phrase.includes('general') ||
      phrase.includes('describe') ||
      phrase.includes('surroundings') ||
      phrase.includes('people') ||
      phrase.includes('layout') ||
      phrase.includes('scene')
    ) {
      return this.onCommand({ type: 'MODE', mode: 'general' });
    }

    // 9. REPEAT
    if (
      phrase.includes('repeat') ||
      phrase.includes('again') ||
      phrase.includes('say that again') ||
      phrase.includes('say again')
    ) {
      return this.onCommand({ type: 'REPEAT' });
    }

    // 10. STOP / SILENCE
    if (
      phrase.includes('stop') ||
      phrase.includes('quiet') ||
      phrase.includes('mute') ||
      phrase.includes('silence')
    ) {
      return this.onCommand({ type: 'STOP' });
    }

    this.onCommand({ type: 'UNKNOWN', phrase: rawPhrase });
  }
}

export const voiceRecognitionService = new VoiceRecognitionService();
