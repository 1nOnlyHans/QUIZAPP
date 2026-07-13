import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

type ThemeToggleProps = {
    className?: string;
};

export default function ThemeToggle({ className }: ThemeToggleProps) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';
    const nextAppearance = isDark ? 'light' : 'dark';

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={cn(
                        'size-9 border-border bg-card text-foreground shadow-[0_1px_1px_rgba(0,0,0,0.04)] hover:bg-accent',
                        className,
                    )}
                    aria-label={`Switch to ${nextAppearance} mode`}
                    onClick={() => updateAppearance(nextAppearance)}
                >
                    {isDark ? (
                        <Sun className="size-4" />
                    ) : (
                        <Moon className="size-4" />
                    )}
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>Switch to {nextAppearance} mode</p>
            </TooltipContent>
        </Tooltip>
    );
}
