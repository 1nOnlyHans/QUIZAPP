import type { FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { buildIdentificationQuestions, normalize } from '@/lib/quiz';
import { cn } from '@/lib/utils';
import type { QuizItem } from '@/types';

export type IdentificationResult = {
    type: 'identification';
    total: number;
    correct: number;
    reviewed: {
        prompt: string;
        givenLabel: string | null;
        correctLabel: string;
        isCorrect: boolean;
    }[];
};

type QuizIdentificationProps = {
    items: QuizItem[];
    count: number;
    onFinish: (result: IdentificationResult) => void;
};

export default function QuizIdentification({
    items,
    count,
    onFinish,
}: QuizIdentificationProps) {
    const [questions] = useState(() =>
        buildIdentificationQuestions(items, count),
    );
    const [index, setIndex] = useState(0);
    const [value, setValue] = useState('');
    const [checked, setChecked] = useState(false);
    const [reviewed, setReviewed] = useState<IdentificationResult['reviewed']>(
        [],
    );

    const question = questions[index];
    const isCorrect =
        checked && normalize(value) === normalize(question.answer);

    const check = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (checked || value.trim().length === 0) {
            return;
        }

        setChecked(true);
    };

    const next = () => {
        const entry = {
            prompt: question.prompt,
            givenLabel: value.trim().length > 0 ? value : null,
            correctLabel: question.answer,
            isCorrect: normalize(value) === normalize(question.answer),
        };
        const nextReviewed = [...reviewed, entry];

        if (index + 1 < questions.length) {
            setReviewed(nextReviewed);
            setIndex(index + 1);
            setValue('');
            setChecked(false);

            return;
        }

        onFinish({
            type: 'identification',
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
                    Definition
                </p>
                <p className="mt-3 text-xl font-semibold text-balance">
                    {question.prompt}
                </p>
            </div>

            <form onSubmit={check} className="space-y-3">
                <Input
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    disabled={checked}
                    autoFocus
                    placeholder="Type the term"
                    className={cn(
                        checked && isCorrect && 'border-green-600',
                        checked && !isCorrect && 'border-red-600',
                    )}
                />

                {checked && !isCorrect && (
                    <p className="text-sm text-muted-foreground">
                        Correct answer:{' '}
                        <span className="font-medium text-foreground">
                            {question.answer}
                        </span>
                    </p>
                )}

                <div className="flex justify-end">
                    {checked ? (
                        <Button type="button" onClick={next}>
                            {index + 1 < questions.length ? 'Next' : 'Finish'}
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            disabled={value.trim().length === 0}
                        >
                            Check
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}
