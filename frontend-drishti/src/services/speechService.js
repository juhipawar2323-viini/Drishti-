/**
 * Text-to-Speech service using Web Speech Synthesis API
 */
class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.selectedVoice = null;
    this.rate = 1.0;
    this.pitch = 1.0;
    this.volume = 1.0;
    this.isSpeaking = false;
    this.lastSpokenText = '';
    this.onStateChange = null;

    if (this.synth) {
      this._loadVoices();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () => this._loadVoices();
      }
    }
  }

  _loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    // Default to a clear English voice if available
    if (!this.selectedVoice && this.voices.length > 0) {
      const preferred = this.voices.find(v => v.lang.includes('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David')));
      this.selectedVoice = preferred || this.voices.find(v => v.lang.includes('en')) || this.voices[0];
    }
  }

  getVoices() {
    if (this.voices.length === 0 && this.synth) {
      this._loadVoices();
    }
    return this.voices;
  }

  setVoice(voiceUri) {
    const voice = this.voices.find(v => v.voiceURI === voiceUri);
    if (voice) {
      this.selectedVoice = voice;
    }
  }

  setRate(rate) {
    this.rate = Math.max(0.5, Math.min(2.5, rate));
  }

  setPitch(pitch) {
    this.pitch = Math.max(0.5, Math.min(1.5, pitch));
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  speak(text, { onStart, onEnd, onError, interrupt = true } = {}) {
    if (!this.synth || !text) return;

    if (interrupt) {
      this.stop();
    }

    this.lastSpokenText = text;

    // Clean text of technical markup or markdown symbols for smooth audio delivery
    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\{.*?\}/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = this.volume;

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.onStateChange) this.onStateChange(true);
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (this.onStateChange) this.onStateChange(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      if (this.onStateChange) this.onStateChange(false);
      if (onError) onError(e);
    };

    this.synth.speak(utterance);
  }

  repeatLast() {
    if (this.lastSpokenText) {
      this.speak(this.lastSpokenText);
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      if (this.onStateChange) this.onStateChange(false);
    }
  }

  pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }
}

export const speechService = new SpeechService();
