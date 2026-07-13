import { useEffect, useState } from 'react';

export function useQuizTimer(
    totalSeconds: number | null,
    resetKey: number,
    paused: boolean,
): number | null {
    const [trackedResetKey, setTrackedResetKey] = useState(resetKey);
    const [secondsLeft, setSecondsLeft] = useState<number | null>(totalSeconds);

    if (resetKey !== trackedResetKey) {
        setTrackedResetKey(resetKey);
        setSecondsLeft(totalSeconds);
    }

    useEffect(() => {
        if (totalSeconds === null || paused) {
            return;
        }

        const interval = setInterval(() => {
            setSecondsLeft((current) => {
                if (current === null || current <= 1) {
                    clearInterval(interval);

                    return 0;
                }

                return current - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [totalSeconds, resetKey, paused]);

    return secondsLeft;
}
