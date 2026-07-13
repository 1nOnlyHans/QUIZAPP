import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { buildMultipleChoiceQuestions } from '@/lib/quiz';
import { cn } from '@/lib/utils';
import type { MultipleChoiceQuestion, QuizItem } from '@/types';

export type MultipleChoiceResult = {
    type: 'multiple_choice';
    total: number;
    correct: number;
    timedOut?: boolean;
    reviewed: {
        prompt: string;
        givenLabel: string | null;
        correctLabel: string;
        isCorrect: boolean;
    }[];
};

type QuizMultipleChoiceProps = {
    items: QuizItem[];
    count: number;
    timeExpired?: boolean;
    onFinish: (result: MultipleChoiceResult) => void;
};

export default function QuizMultipleChoice({
    items,
    count,
    timeExpired = false,
    onFinish,
}: QuizMultipleChoiceProps) {
    // Questions are shuffled with Math.random(), which must not run during
    // the initial render — under SSR that render is compared against the
    // server's own (differently) shuffled output, causing a hydration
    // mismatch. Generating them in an effect keeps the first render
    // deterministic (empty) on both server and client.
    const [questions, setQuestions] = useState<MultipleChoiceQuestion[]>([]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional client-only randomization, see comment above
        setQuestions(buildMultipleChoiceQuestions(items, count));
    }, [items, count]);

    const [index, setIndex] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [reviewed, setReviewed] = useState<MultipleChoiceResult['reviewed']>(
        [],
    );

    const question = questions[index] as MultipleChoiceQuestion | undefined;
    const answered = selected !== null;

    const hasFinalizedRef = useRef(false);

    useEffect(() => {
        if (!timeExpired || hasFinalizedRef.current || questions.length === 0) {
            return;
        }

        hasFinalizedRef.current = true;

        const remaining = questions
            .slice(index)
            .map((remainingQuestion, offset) => {
                if (offset === 0 && selected !== null) {
                    return {
                        prompt: remainingQuestion.prompt,
                        givenLabel: remainingQuestion.options[selected] ?? null,
                        correctLabel:
                            remainingQuestion.options[
                                remainingQuestion.correctIndex
                            ],
                        isCorrect: selected === remainingQuestion.correctIndex,
                    };
                }

                return {
                    prompt: remainingQuestion.prompt,
                    givenLabel: null,
                    correctLabel:
                        remainingQuestion.options[
                            remainingQuestion.correctIndex
                        ],
                    isCorrect: false,
                };
            });

        const finalReviewed = [...reviewed, ...remaining];

        onFinish({
            type: 'multiple_choice',
            total: questions.length,
            correct: finalReviewed.filter((item) => item.isCorrect).length,
            timedOut: true,
            reviewed: finalReviewed,
        });
    }, [timeExpired, questions, index, selected, reviewed, onFinish]);

    if (!question) {
        return null;
    }

    const choose = (optionIndex: number) => {
        if (answered) {
            return;
        }

        setSelected(optionIndex);
    };

    const next = () => {
        if (selected === null) {
            return;
        }

        const entry = {
            prompt: question.prompt,
            givenLabel: question.options[selected] ?? null,
            correctLabel: question.options[question.correctIndex],
            isCorrect: selected === question.correctIndex,
        };
        const nextReviewed = [...reviewed, entry];

        if (index + 1 < questions.length) {
            setReviewed(nextReviewed);
            setIndex(index + 1);
            setSelected(null);

            return;
        }

        onFinish({
            type: 'multiple_choice',
            total: questions.length,
            correct: nextReviewed.filter((item) => item.isCorrect).length,
            reviewed: nextReviewed,
        });
    };

    return (
        <div className="mx-auto w-full max-w-2xl space-y-6">
            <p className="text-center text-sm text-muted-foreground">
                Question {index + 1} / {questions.length}
            </p>

            <div className="rounded-xl border border-border bg-card p-8 text-center">
                <p className="font-mono text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Term
                </p>
                <p className="mt-3 text-2xl font-semibold text-balance">
                    {question.prompt}
                </p>
            </div>

            <div className="grid gap-3">
                {question.options.map((option, optionIndex) => {
                    const isCorrectOption =
                        optionIndex === question.correctIndex;
                    const isSelectedOption = optionIndex === selected;

                    return (
                        <button
                            key={optionIndex}
                            type="button"
                            onClick={() => choose(optionIndex)}
                            disabled={answered}
                            className={cn(
                                'rounded-lg border p-4 text-left text-sm transition-colors',
                                !answered && 'border-border hover:border-ring',
                                answered &&
                                    isCorrectOption &&
                                    'border-green-600 bg-green-600/10',
                                answered &&
                                    isSelectedOption &&
                                    !isCorrectOption &&
                                    'border-red-600 bg-red-600/10',
                                answered &&
                                    !isSelectedOption &&
                                    !isCorrectOption &&
                                    'border-border opacity-60',
                            )}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>

            <div className="flex justify-end">
                <Button type="button" onClick={next} disabled={!answered}>
                    {index + 1 < questions.length ? 'Next' : 'Finish'}
                </Button>
            </div>
        </div>
    );
}
