import React, { createContext, useContext, useState, useEffect } from 'react';
import { speechService } from '../services/speechService';
import { soundService } from '../services/soundService';

const AccessibilityContext = createContext(null);

export const AccessibilityProvider = ({ children }) => {
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('drishti_high_contrast') === 'true';
  });

  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('drishti_font_size') || 'normal'; // 'normal' | 'large' | 'xl'
  });

  const [speechRate, setSpeechRate] = useState(() => {
    return parseFloat(localStorage.getItem('drishti_speech_rate')) || 1.0;
  });

  const [speechPitch, setSpeechPitch] = useState(() => {
    return parseFloat(localStorage.getItem('drishti_speech_pitch')) || 1.0;
  });

  const [autoSpeak, setAutoSpeak] = useState(() => {
    const stored = localStorage.getItem('drishti_auto_speak');
    return stored === null ? true : stored === 'true';
  });

  const [audioCues, setAudioCues] = useState(() => {
    const stored = localStorage.getItem('drishti_audio_cues');
    return stored === null ? true : stored === 'true';
  });

  const [announcement, setAnnouncement] = useState('');

  // Apply high-contrast class to root body
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    localStorage.setItem('drishti_high_contrast', highContrast);
  }, [highContrast]);

  // Apply font size class
  useEffect(() => {
    document.documentElement.classList.remove('text-scale-large', 'text-scale-xl');
    if (fontSize === 'large') {
      document.documentElement.classList.add('text-scale-large');
    } else if (fontSize === 'xl') {
      document.documentElement.classList.add('text-scale-xl');
    }
    localStorage.setItem('drishti_font_size', fontSize);
  }, [fontSize]);

  // Sync speech service
  useEffect(() => {
    speechService.setRate(speechRate);
    localStorage.setItem('drishti_speech_rate', speechRate);
  }, [speechRate]);

  useEffect(() => {
    speechService.setPitch(speechPitch);
    localStorage.setItem('drishti_speech_pitch', speechPitch);
  }, [speechPitch]);

  useEffect(() => {
    soundService.setMuted(!audioCues);
    localStorage.setItem('drishti_audio_cues', audioCues);
  }, [audioCues]);

  useEffect(() => {
    localStorage.setItem('drishti_auto_speak', autoSpeak);
  }, [autoSpeak]);

  /**
   * Announce message to screen readers and optionally play TTS
   */
  const announce = (message, speakAloud = false) => {
    setAnnouncement(message);
    if (speakAloud && autoSpeak) {
      speechService.speak(message);
    }
  };

  /**
   * Haptic vibration feedback for mobile devices
   */
  const triggerHaptic = (pattern = [40, 60, 40]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Ignore unsupported devices
      }
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        setHighContrast,
        fontSize,
        setFontSize,
        speechRate,
        setSpeechRate,
        speechPitch,
        setSpeechPitch,
        autoSpeak,
        setAutoSpeak,
        audioCues,
        setAudioCues,
        announcement,
        announce,
        triggerHaptic,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
