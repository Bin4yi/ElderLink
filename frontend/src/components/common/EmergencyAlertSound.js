// frontend/src/components/common/EmergencyAlertSound.js
import { useEffect, useRef } from 'react';

const EmergencyAlertSound = ({ severity, play = false, onComplete }) => {
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!play) {
      stopSound();
      return;
    }

    // Create audio context
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      console.warn('Web Audio API not supported');
      return;
    }

    const playEmergencySound = () => {
      // Stop any existing sound
      stopSound();

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      // Create oscillator (generates the tone)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;

      // Connect nodes: oscillator -> gain -> destination
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Set frequency based on severity
      const frequencies = {
        critical: [800, 1000],  // Alternating high pitched
        high: [600, 800],       // Medium-high pitch
        medium: [400, 600]      // Lower pitch
      };

      const [freq1, freq2] = frequencies[severity] || frequencies.medium;

      // Configure sound
      oscillator.type = 'sine';
      oscillator.frequency.value = freq1;

      // Set volume (0 to 1)
      gainNode.gain.value = 0.3;

      // Start the sound
      const now = audioContext.currentTime;
      oscillator.start(now);

      // Alternate frequency for emergency effect
      let toggle = false;
      intervalRef.current = setInterval(() => {
        if (oscillatorRef.current) {
          oscillatorRef.current.frequency.value = toggle ? freq2 : freq1;
          toggle = !toggle;
        }
      }, 200);

      // Auto-stop after 5 seconds for critical, 3 seconds for others
      const duration = severity === 'critical' ? 5000 : 3000;
      setTimeout(() => {
        stopSound();
        if (onComplete) onComplete();
      }, duration);
    };

    playEmergencySound();

    // For critical alerts, repeat every 2 seconds
    let repeatInterval;
    if (severity === 'critical') {
      repeatInterval = setInterval(() => {
        playEmergencySound();
      }, 7000); // 5 seconds sound + 2 seconds gap
    }

    return () => {
      stopSound();
      if (repeatInterval) clearInterval(repeatInterval);
    };
  }, [play, severity, onComplete]);

  const stopSound = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {
        // Already stopped
      }
      oscillatorRef.current = null;
    }

    if (gainNodeRef.current) {
      try {
        gainNodeRef.current.disconnect();
      } catch (e) {
        // Already disconnected
      }
      gainNodeRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {
        // Already closed
      }
      audioContextRef.current = null;
    }
  };

  return null; // This component doesn't render anything
};

export default EmergencyAlertSound;
