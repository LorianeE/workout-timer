import { useEffect, useState } from "react";

export const useCountdown = (repDurationInSec: number) => {
  const [countdownInSec, setCountdownInSec] = useState(0);
  const [go, setGo] = useState(false);

  const getRemainingTime = (): { min: number; sec: number } => {
    const min = Math.floor(countdownInSec / 60);
    const sec = Math.floor(countdownInSec % 60);

    return { min, sec };
  };

  // Set countdown if repDuration change
  useEffect(() => {
    setCountdownInSec(repDurationInSec);
  }, [repDurationInSec]);

  // Countdown
  useEffect(() => {
    let interval: number | undefined;
    if (go) {
      interval = setInterval(() => {
        if (countdownInSec > 0) setCountdownInSec(countdownInSec - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [go, countdownInSec]);

  return {
    getRemainingTime,
    go,
    setGo,
  };
};
