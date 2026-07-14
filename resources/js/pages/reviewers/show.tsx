import { Head, Link, router } from '@inertiajs/react';
import { LayoutGrid, ListChecks, Rows3, SquarePen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ReviewerCards from '@/components/reviewers/reviewer-cards';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { show as showCourse } from '@/routes/courses';
import {
    destroy as destroyReviewer,
    edit as editReviewer,
    index as reviewersIndex,
} from '@/routes/reviewers';
import { create as createQuiz } from '@/routes/reviewers/quiz';
import type { ReviewerDetail } from '@/types';

type ShowReviewerProps = {
    reviewer: ReviewerDetail;
};

type ViewMode = 'cards' | 'list';

export default function ShowReviewer({ reviewer }: ShowReviewerProps) {
    const [mode, setMode] = useState<ViewMode>('cards');

    const requestDelete = () => {
        if (!window.confirm(`Delete ${reviewer.title}?`)) {
            return;
        }

        router.delete(destroyReviewer.url(reviewer.id));
    };

    return (
        <>
            <Head title={reviewer.title} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <section className="rounded-lg border border-border bg-card p-6">
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                        <div className="min-w-0">
                            <Link
                                href={showCourse(reviewer.course.id)}
                                className="font-mono text-sm font-semibold text-muted-foreground hover:text-foreground"
                            >
                                {reviewer.course.subject_code}
                            </Link>
                            <h1 className="mt-3 text-3xl font-semibold">
                                {reviewer.title}
                            </h1>
                            {reviewer.description && (
                                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                                    {reviewer.description}
                                </p>
                            )}
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <Badge variant="secondary">
                                    {reviewer.items_count} items
                                </Badge>
                                {reviewer.lessons.map((lesson) => (
                                    <Badge key={lesson.id} variant="outline">
                                        {lesson.title}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {reviewer.items.length > 0 && (
                                <Button asChild>
                                    <Link href={createQuiz(reviewer.id)}>
                                        <ListChecks />
                                        Take quiz
                                    </Link>
                                </Button>
                            )}
                            <Button asChild variant="outline">
                                <Link href={editReviewer(reviewer.id)}>
                                    <SquarePen />
                                    Edit
                                </Link>
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={requestDelete}
                            >
                                <Trash2 />
                                Delete
                            </Button>
                        </div>
                    </div>
                </section>

                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">Review</h2>
                    <ToggleGroup
                        type="single"
                        variant="outline"
                        value={mode}
                        onValueChange={(value) => {
                            if (value === 'cards' || value === 'list') {
                                setMode(value);
                            }
                        }}
                    >
                        <ToggleGroupItem value="cards" aria-label="Card view">
                            <LayoutGrid />
                            Cards
                        </ToggleGroupItem>
                        <ToggleGroupItem value="list" aria-label="List view">
                            <Rows3 />
                            List
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>

                {reviewer.items.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
                        This reviewer has no items yet. Edit it to add terms and
                        definitions.
                    </div>
                ) : mode === 'cards' ? (
                    <ReviewerCards items={reviewer.items} />
                ) : (
                    <div className="divide-y divide-border rounded-lg border border-border bg-card">
                        {reviewer.items.map((item, index) => (
                            <div
                                key={item.id ?? index}
                                className="grid gap-2 p-4 sm:grid-cols-[1fr_2fr] sm:gap-6"
                            >
                                <div className="flex flex-col items-baseline gap-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-mono text-xs text-muted-foreground">
                                            {index + 1}
                                        </span>
                                        <span className="font-semibold">
                                            {item.term}
                                        </span>
                                    </div>
                                    {item.group && (
                                        <span className="text-xs text-muted-foreground">
                                            {item.group}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {item.definitions.join(' · ')}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

ShowReviewer.layout = {
    breadcrumbs: [
        {
            title: 'Reviewers',
            href: reviewersIndex(),
        },
        {
            title: 'Reviewer',
            href: reviewersIndex(),
        },
    ],
};
