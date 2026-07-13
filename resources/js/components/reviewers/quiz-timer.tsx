import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

type QuizTimerProps = {
    secondsLeft: number;
};

const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
};

export default function QuizTimer({ secondsLeft }: QuizTimerProps) {
    return (
        <span
            className={cn(
                'flex items-center gap-1.5 font-mono text-sm font-medium',
                secondsLeft > 60 && 'text-muted-foreground',
                secondsLeft <= 60 && secondsLeft > 15 && 'text-amber-600',
                secondsLeft <= 15 && 'text-red-600',
            )}
        >
            <Clock className="size-4" />
            {formatTime(secondsLeft)}
        </span>
    );
}
