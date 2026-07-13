import { Link } from '@inertiajs/react';
import type { EnumerationResult } from '@/components/reviewers/quiz-enumeration';
import type { IdentificationResult } from '@/components/reviewers/quiz-identification';
import type { MultipleChoiceResult } from '@/components/reviewers/quiz-multiple-choice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { show as showReviewer } from '@/routes/reviewers';

export type QuizResultSummary =
    MultipleChoiceResult | IdentificationResult | EnumerationResult;

type QuizResultsProps = {
    reviewerId: number;
    result: QuizResultSummary;
    onRetake: () => void;
};

export default function QuizResults({
    reviewerId,
    result,
    onRetake,
}: QuizResultsProps) {
    return (
        <div className="mx-auto w-full max-w-2xl space-y-6">
            {result.timedOut && (
                <p className="rounded-lg border border-amber-600/30 bg-amber-600/10 p-3 text-center text-sm text-amber-600">
                    Time&apos;s up — here&apos;s your progress so far.
                </p>
            )}

            <div className="rounded-xl border border-border bg-card p-8 text-center">
                <p className="font-mono text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Score
                </p>
                {result.type === 'enumeration' ? (
                    <p className="mt-3 text-3xl font-semibold">
                        {result.matched.length} / {result.expectedCount}
                    </p>
                ) : (
                    <p className="mt-3 text-3xl font-semibold">
                        {result.correct} / {result.total}
                    </p>
                )}
            </div>

            {result.type === 'enumeration' ? (
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-border bg-card p-4">
                        <p className="text-sm font-medium text-green-600">
                            Remembered
                        </p>
                        <ul className="mt-2 space-y-1 text-sm">
                            {result.matched.map((term) => (
                                <li key={term}>{term}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-4">
                        <p className="text-sm font-medium text-red-600">
                            Missed
                        </p>
                        <ul className="mt-2 space-y-1 text-sm">
                            {result.missed.map((term) => (
                                <li key={term}>{term}</li>
                            ))}
                        </ul>
                    </div>
                    {result.extra.length > 0 && (
                        <div className="rounded-lg border border-border bg-card p-4">
                            <p className="text-sm font-medium text-muted-foreground">
                                Not recognized
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                {result.extra.map((term, index) => (
                                    <li key={index}>{term}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ) : (
                <div className="divide-y divide-border rounded-lg border border-border bg-card">
                    {result.reviewed.map((entry, index) => (
                        <div key={index} className="flex flex-col gap-1 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm text-muted-foreground">
                                    {entry.prompt}
                                </p>
                                <Badge
                                    variant={
                                        entry.isCorrect
                                            ? 'secondary'
                                            : 'destructive'
                                    }
                                >
                                    {entry.isCorrect ? 'Correct' : 'Incorrect'}
                                </Badge>
                            </div>
                            {!entry.isCorrect && (
                                <p className="text-sm">
                                    Your answer:{' '}
                                    <span className="text-muted-foreground">
                                        {entry.givenLabel ?? '—'}
                                    </span>{' '}
                                    · Correct:{' '}
                                    <span className="font-medium">
                                        {entry.correctLabel}
                                    </span>
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
                <Button type="button" onClick={onRetake}>
                    Retake
                </Button>
                <Button asChild variant="outline">
                    <Link href={showReviewer(reviewerId)}>
                        Back to reviewer
                    </Link>
                </Button>
            </div>
        </div>
    );
}
