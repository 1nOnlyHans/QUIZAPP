import { Head, Link } from '@inertiajs/react';
import { CircleCheck, ListOrdered, Type } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
    index as reviewersIndex,
    show as showReviewer,
} from '@/routes/reviewers';
import { show as showQuiz } from '@/routes/reviewers/quiz';
import type { QuizType, SelectOption } from '@/types';

type QuizReviewer = {
    id: number;
    title: string;
    items_count: number;
};

type CreateQuizProps = {
    reviewer: QuizReviewer;
    typeOptions: SelectOption<QuizType>[];
};

const typeIcons: Record<QuizType, typeof CircleCheck> = {
    multiple_choice: CircleCheck,
    identification: Type,
    enumeration: ListOrdered,
};

const typeDescriptions: Record<QuizType, string> = {
    multiple_choice:
        'See a term, pick its correct definition from a few choices.',
    identification: 'See a definition, type in the matching term.',
    enumeration: 'Recall and list as many terms as you can from memory.',
};

export default function CreateQuiz({ reviewer, typeOptions }: CreateQuizProps) {
    const canUseMultipleChoice = reviewer.items_count >= 2;
    const [type, setType] = useState<QuizType>(
        canUseMultipleChoice ? 'multiple_choice' : 'identification',
    );
    const [count, setCount] = useState(reviewer.items_count);
    const [timerEnabled, setTimerEnabled] = useState(false);
    const [minutes, setMinutes] = useState(5);

    const showsCount = type !== 'enumeration';
    const clampedCount = Math.min(
        Math.max(count, 1),
        Math.max(reviewer.items_count, 1),
    );
    const clampedMinutes = Math.min(Math.max(minutes, 1), 120);

    return (
        <>
            <Head title={`Quiz - ${reviewer.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div>
                    <p className="font-mono text-xs font-medium text-muted-foreground uppercase">
                        {reviewer.title}
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold">Take a quiz</h1>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        Choose how you want to be quizzed on these{' '}
                        {reviewer.items_count}{' '}
                        {reviewer.items_count === 1 ? 'item' : 'items'}.
                    </p>
                </div>

                <div className="mx-auto w-full max-w-2xl space-y-6">
                    <div className="grid gap-3">
                        {typeOptions.map((option) => {
                            const Icon = typeIcons[option.value];
                            const disabled =
                                option.value === 'multiple_choice' &&
                                !canUseMultipleChoice;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() =>
                                        !disabled && setType(option.value)
                                    }
                                    disabled={disabled}
                                    className={cn(
                                        'flex items-start gap-3 rounded-lg border p-4 text-left transition-colors',
                                        type === option.value
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-ring',
                                        disabled &&
                                            'cursor-not-allowed opacity-50',
                                    )}
                                >
                                    <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                                    <span>
                                        <span className="block font-medium">
                                            {option.label}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {typeDescriptions[option.value]}
                                        </span>
                                        {disabled && (
                                            <span className="mt-1 block text-xs text-muted-foreground">
                                                Needs at least 2 items.
                                            </span>
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {showsCount ? (
                        <div className="grid gap-2">
                            <Label htmlFor="quiz-count">
                                Number of questions
                            </Label>
                            <Input
                                id="quiz-count"
                                type="number"
                                min={1}
                                max={reviewer.items_count}
                                value={count}
                                onChange={(event) =>
                                    setCount(Number(event.target.value) || 1)
                                }
                            />
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            You&apos;ll be asked to recall all{' '}
                            {reviewer.items_count} terms.
                        </p>
                    )}

                    <div className="grid gap-3">
                        <label className="flex items-center gap-3 text-sm">
                            <Checkbox
                                checked={timerEnabled}
                                onCheckedChange={(checked) =>
                                    setTimerEnabled(checked === true)
                                }
                            />
                            Enable timer
                        </label>

                        {timerEnabled && (
                            <div className="grid gap-2">
                                <Label htmlFor="quiz-minutes">
                                    Time limit (minutes)
                                </Label>
                                <Input
                                    id="quiz-minutes"
                                    type="number"
                                    min={1}
                                    max={120}
                                    value={minutes}
                                    onChange={(event) =>
                                        setMinutes(
                                            Number(event.target.value) || 1,
                                        )
                                    }
                                    className="max-w-32"
                                />
                                <p className="text-sm text-muted-foreground">
                                    The quiz auto-finishes when time runs out,
                                    scoring what you&apos;ve answered so far.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button asChild>
                            <Link
                                href={showQuiz(reviewer.id, {
                                    query: {
                                        type,
                                        count: String(clampedCount),
                                        ...(timerEnabled
                                            ? {
                                                  minutes:
                                                      String(clampedMinutes),
                                              }
                                            : {}),
                                    },
                                })}
                            >
                                Start quiz
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={showReviewer(reviewer.id)}>Cancel</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

CreateQuiz.layout = {
    breadcrumbs: [
        {
            title: 'Reviewers',
            href: reviewersIndex(),
        },
        {
            title: 'Take a quiz',
            href: reviewersIndex(),
        },
    ],
};
