import { Plus, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { buildEnumerationQuestion, scoreEnumeration } from '@/lib/quiz';
import type { QuizItem } from '@/types';

export type EnumerationResult = {
    type: 'enumeration';
    prompt: string;
    expectedCount: number;
    timedOut?: boolean;
    matched: string[];
    missed: string[];
    extra: string[];
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
    const [question] = useState(() =>
        buildEnumerationQuestion(reviewerTitle, items),
    );
    const [entries, setEntries] = useState<string[]>(['']);

    const updateEntry = (index: number, value: string) => {
        setEntries(
            entries.map((entry, current) =>
                current === index ? value : entry,
            ),
        );
    };

    const addEntry = () => setEntries([...entries, '']);

    const removeEntry = (index: number) => {
        setEntries(entries.filter((_, current) => current !== index));
    };

    const finish = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const score = scoreEnumeration(question.expectedTerms, entries);

        onFinish({
            type: 'enumeration',
            prompt: question.prompt,
            expectedCount: question.expectedTerms.length,
            ...score,
        });
    };

    const hasFinalizedRef = useRef(false);

    useEffect(() => {
        if (!timeExpired || hasFinalizedRef.current) {
            return;
        }

        hasFinalizedRef.current = true;

        const score = scoreEnumeration(question.expectedTerms, entries);

        onFinish({
            type: 'enumeration',
            prompt: question.prompt,
            expectedCount: question.expectedTerms.length,
            timedOut: true,
            ...score,
        });
    }, [timeExpired, question, entries, onFinish]);

    return (
        <form onSubmit={finish} className="mx-auto w-full max-w-2xl space-y-6">
            <div className="rounded-xl border border-border bg-card p-8 text-center">
                <p className="font-mono text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Enumerate
                </p>
                <p className="mt-3 text-xl font-semibold text-balance">
                    List everything you remember from &quot;{question.prompt}
                    &quot;
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                    {question.expectedTerms.length} terms total.
                </p>
            </div>

            <div className="space-y-3">
                {entries.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <span className="w-6 shrink-0 text-right font-mono text-xs text-muted-foreground">
                            {index + 1}
                        </span>
                        <Input
                            value={entry}
                            onChange={(event) =>
                                updateEntry(index, event.target.value)
                            }
                            placeholder="Type a term you remember"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeEntry(index)}
                            disabled={entries.length === 1}
                            aria-label="Remove entry"
                        >
                            <Trash2 />
                        </Button>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between">
                <Button type="button" variant="outline" onClick={addEntry}>
                    <Plus />
                    Add another
                </Button>
                <Button type="submit">Finish</Button>
            </div>
        </form>
    );
}
