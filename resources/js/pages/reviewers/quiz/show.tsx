import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import QuizEnumeration from '@/components/reviewers/quiz-enumeration';
import type { EnumerationResult } from '@/components/reviewers/quiz-enumeration';
import QuizIdentification from '@/components/reviewers/quiz-identification';
import type { IdentificationResult } from '@/components/reviewers/quiz-identification';
import QuizMultipleChoice from '@/components/reviewers/quiz-multiple-choice';
import type { MultipleChoiceResult } from '@/components/reviewers/quiz-multiple-choice';
import QuizResults from '@/components/reviewers/quiz-results';
import {
    index as reviewersIndex,
    show as showReviewer,
} from '@/routes/reviewers';
import type { QuizItem, QuizType } from '@/types';

type QuizReviewer = {
    id: number;
    title: string;
    description: string | null;
    items: QuizItem[];
};

type ShowQuizProps = {
    reviewer: QuizReviewer;
    type: QuizType;
    count: number;
};

type Result = MultipleChoiceResult | IdentificationResult | EnumerationResult;

export default function ShowQuiz({ reviewer, type, count }: ShowQuizProps) {
    const [attempt, setAttempt] = useState(0);
    const [result, setResult] = useState<Result | null>(null);

    const retake = () => {
        setResult(null);
        setAttempt((current) => current + 1);
    };

    return (
        <>
            <Head title={`Quiz - ${reviewer.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="font-mono text-xs font-medium text-muted-foreground uppercase">
                            {reviewer.title}
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold">Quiz</h1>
                    </div>
                    <Link
                        href={showReviewer(reviewer.id)}
                        className="text-sm text-muted-foreground hover:text-foreground"
                    >
                        Exit quiz
                    </Link>
                </div>

                {result ? (
                    <QuizResults
                        reviewerId={reviewer.id}
                        result={result}
                        onRetake={retake}
                    />
                ) : type === 'multiple_choice' ? (
                    <QuizMultipleChoice
                        key={attempt}
                        items={reviewer.items}
                        count={count}
                        onFinish={setResult}
                    />
                ) : type === 'identification' ? (
                    <QuizIdentification
                        key={attempt}
                        items={reviewer.items}
                        count={count}
                        onFinish={setResult}
                    />
                ) : (
                    <QuizEnumeration
                        key={attempt}
                        reviewerTitle={reviewer.title}
                        items={reviewer.items}
                        onFinish={setResult}
                    />
                )}
            </div>
        </>
    );
}

ShowQuiz.layout = {
    breadcrumbs: [
        {
            title: 'Reviewers',
            href: reviewersIndex(),
        },
        {
            title: 'Quiz',
            href: reviewersIndex(),
        },
    ],
};
