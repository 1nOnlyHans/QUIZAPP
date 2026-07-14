import { Plus, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { buildEnumerationQuestions, scoreEnumeration } from '@/lib/quiz';
import type { QuizItem } from '@/types';

export type EnumerationGroupResult = {
    group: string | null;
    prompt: string;
    expectedCount: number;
    matched: string[];
    missed: string[];
    extra: string[];
};

export type EnumerationResult = {
    type: 'enumeration';
    timedOut?: boolean;
    groups: EnumerationGroupResult[];
};

type QuizEnumerationProps = {
    reviewerTitle: string;
    items: QuizItem[];
    timeExpired?: boolean;
    onFinish: (result: EnumerationResult) => void;
};

export default function QuizEnumeration({
    reviewerTitle,
    items,
    timeExpired = false,
    onFinish,
}: QuizEnumerationProps) {
    const [questions] = useState(() =>
        buildEnumerationQuestions(reviewerTitle, items),
    );
    const [entriesByQuestion, setEntriesByQuestion] = useState<string[][]>(() =>
        questions.map(() => ['']),
    );

    const updateEntry = (
        questionIndex: number,
        entryIndex: number,
        value: string,
    ) => {
        setEntriesByQuestion((current) =>
            current.map((entries, index) =>
                index === questionIndex
                    ? entries.map((entry, current) =>
                          current === entryIndex ? value : entry,
                      )
                    : entries,
            ),
        );
    };

    const addEntry = (questionIndex: number) => {
        setEntriesByQuestion((current) =>
            current.map((entries, index) =>
                index === questionIndex ? [...entries, ''] : entries,
            ),
        );
    };

    const removeEntry = (questionIndex: number, entryIndex: number) => {
        setEntriesByQuestion((current) =>
            current.map((entries, index) =>
                index === questionIndex
                    ? entries.filter((_, current) => current !== entryIndex)
                    : entries,
            ),
        );
    };

    const finish = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const groups: EnumerationGroupResult[] = questions.map(
            (question, index) => ({
                group: question.group,
                prompt: question.prompt,
                expectedCount: question.expectedTerms.length,
                ...scoreEnumeration(
                    question.expectedTerms,
                    entriesByQuestion[index] ?? [],
                ),
            }),
        );

        onFinish({ type: 'enumeration', groups });
    };

    const hasFinalizedRef = useRef(false);

    useEffect(() => {
        if (!timeExpired || hasFinalizedRef.current) {
            return;
        }

        hasFinalizedRef.current = true;

        const groups: EnumerationGroupResult[] = questions.map(
            (question, index) => ({
                group: question.group,
                prompt: question.prompt,
                expectedCount: question.expectedTerms.length,
                ...scoreEnumeration(
                    question.expectedTerms,
                    entriesByQuestion[index] ?? [],
                ),
            }),
        );

        onFinish({ type: 'enumeration', timedOut: true, groups });
    }, [timeExpired, questions, entriesByQuestion, onFinish]);

    return (
        <form onSubmit={finish} className="mx-auto w-full max-w-2xl space-y-6">
            {questions.map((question, questionIndex) => (
                <div key={questionIndex} className="space-y-4">
                    <div className="rounded-xl border border-border bg-card p-8 text-center">
                        <p className="font-mono text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Enumerate
                        </p>
                        <p className="mt-3 text-xl font-semibold text-balance">
                            List everything you remember from &quot;
                            {question.prompt}&quot;
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {question.expectedTerms.length} terms total.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {(entriesByQuestion[questionIndex] ?? []).map(
                            (entry, entryIndex) => (
                                <div
                                    key={entryIndex}
                                    className="flex items-center gap-2"
                                >
                                    <span className="w-6 shrink-0 text-right font-mono text-xs text-muted-foreground">
                                        {entryIndex + 1}
                                    </span>
                                    <Input
                                        value={entry}
                                        onChange={(event) =>
                                            updateEntry(
                                                questionIndex,
                                                entryIndex,
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Type a term you remember"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            removeEntry(
                                                questionIndex,
                                                entryIndex,
                                            )
                                        }
                                        disabled={
                                            (entriesByQuestion[questionIndex]
                                                ?.length ?? 0) === 1
                                        }
                                        aria-label="Remove entry"
                                    >
                                        <Trash2 />
                                    </Button>
                                </div>
                            ),
                        )}
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => addEntry(questionIndex)}
                    >
                        <Plus />
                        Add another
                    </Button>
                </div>
            ))}

            <div className="flex items-center justify-end">
                <Button type="submit">Finish</Button>
            </div>
        </form>
    );
}
