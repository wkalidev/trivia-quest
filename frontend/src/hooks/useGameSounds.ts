"use client";

import { useEffect, useRef } from "react";

function playBeep(frequency: number, duration: number, volume: number = 0.3) {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // Silent fail if audio not supported
  }
}

export function useGameSounds() {
  const enabledRef = useRef(true);

  const playCorrect = () => {
    if (!enabledRef.current) return;
    playBeep(523, 0.1, 0.3);
    setTimeout(() => playBeep(659, 0.1, 0.3), 100);
    setTimeout(() => playBeep(784, 0.2, 0.3), 200);
  };

  const playWrong = () => {
    if (!enabledRef.current) return;
    playBeep(200, 0.3, 0.3);
    setTimeout(() => playBeep(150, 0.3, 0.2), 200);
  };

  const playStreak = () => {
    if (!enabledRef.current) return;
    playBeep(523, 0.08, 0.2);
    setTimeout(() => playBeep(659, 0.08, 0.2), 80);
    setTimeout(() => playBeep(784, 0.08, 0.2), 160);
    setTimeout(() => playBeep(1047, 0.2, 0.3), 240);
  };

  const playTick = () => {
    if (!enabledRef.current) return;
    playBeep(800, 0.05, 0.1);
  };

  const toggle = () => {
    enabledRef.current = !enabledRef.current;
    return enabledRef.current;
  };

  return { playCorrect, playWrong, playStreak, playTick, toggle };
}