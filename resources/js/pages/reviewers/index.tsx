import { Head, Link, router } from '@inertiajs/react';
import { Layers, NotebookText, Plus, SquarePen, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { index as coursesIndex } from '@/routes/courses';
import { create as createReviewer } from '@/routes/courses/reviewers';
import {
    destroy as destroyReviewer,
    edit as editReviewer,
    index as reviewersIndex,
    show as showReviewer,
} from '@/routes/reviewers';
import type { ReviewerSummary } from '@/types';

type ReviewersIndexProps = {
    reviewers: ReviewerSummary[];
};

type CourseGroup = {
    id: number;
    subject_code: string;
    subject_name: string;
    reviewers: ReviewerSummary[];
};

export default function ReviewersIndex({ reviewers }: ReviewersIndexProps) {
    const groups = useMemo<CourseGroup[]>(() => {
        const byCourse = new Map<number, CourseGroup>();

        for (const reviewer of reviewers) {
            const existing = byCourse.get(reviewer.course.id);

            if (existing) {
                existing.reviewers.push(reviewer);
            } else {
                byCourse.set(reviewer.course.id, {
                    ...reviewer.course,
                    reviewers: [reviewer],
                });
            }
        }

        return [...byCourse.values()].sort((a, b) =>
            a.subject_name.localeCompare(b.subject_name),
        );
    }, [reviewers]);

    const totalItems = reviewers.reduce(
        (sum, reviewer) => sum + reviewer.items_count,
        0,
    );

    const requestDelete = (reviewer: ReviewerSummary) => {
        if (!window.confirm(`Delete ${reviewer.title}?`)) {
            return;
        }

        router.delete(destroyReviewer.url(reviewer.id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Reviewers" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                    <div>
                        <p className="font-mono text-xs font-medium text-muted-foreground uppercase">
                            Reviewers
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold">
                            Study reviewers
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                            Build term-and-definition sets from your lessons and
                            review them as cards or a simple list.
                        </p>
                    </div>
                </div>

                {reviewers.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card p-12 text-center">
                        <NotebookText className="size-10 text-muted-foreground" />
                        <h2 className="text-lg font-semibold">
                            No reviewers yet
                        </h2>
                        <p className="max-w-md text-sm text-muted-foreground">
                            Open a course and create a reviewer to start
                            collecting terms and definitions.
                        </p>
                        <Button asChild>
                            <Link href={coursesIndex()}>Go to courses</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-lg border border-border bg-card p-5">
                                <p className="text-sm text-muted-foreground">
                                    Reviewers
                                </p>
                                <p className="mt-2 text-3xl font-semibold">
                                    {reviewers.length}
                                </p>
                            </div>
                            <div className="rounded-lg border border-border bg-card p-5">
                                <p className="text-sm text-muted-foreground">
                                    Courses
                                </p>
                                <p className="mt-2 text-3xl font-semibold">
                                    {groups.length}
                                </p>
                            </div>
                            <div className="rounded-lg border border-border bg-card p-5">
                                <p className="text-sm text-muted-foreground">
                                    Total items
                                </p>
                                <p className="mt-2 text-3xl font-semibold">
                                    {totalItems}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {groups.map((group) => (
                                <section
                                    key={group.id}
                                    className="rounded-lg border border-border bg-card"
                                >
                                    <div className="flex items-center justify-between gap-3 border-b border-border p-4">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-mono text-sm font-semibold">
                                                {group.subject_code}
                                            </span>
                                            <h2 className="text-lg font-semibold">
                                                {group.subject_name}
                                            </h2>
                                        </div>
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Link
                                                href={createReviewer(group.id)}
                                            >
                                                <Plus />
                                                New reviewer
                                            </Link>
                                        </Button>
                                    </div>

                                    <div className="divide-y divide-border">
                                        {group.reviewers.map((reviewer) => (
                                            <article
                                                key={reviewer.id}
                                                className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between"
                                            >
                                                <Link
                                                    href={showReviewer(
                                                        reviewer.id,
                                                    )}
                                                    className="min-w-0 flex-1"
                                                >
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="font-medium">
                                                            {reviewer.title}
                                                        </h3>
                                                        <Badge variant="secondary">
                                                            {
                                                                reviewer.items_count
                                                            }{' '}
                                                            items
                                                        </Badge>
                                                        <Badge variant="outline">
                                                            <Layers className="size-3" />
                                                            {
                                                                reviewer.lessons_count
                                                            }{' '}
                                                            lessons
                                                        </Badge>
                                                    </div>
                                                    {reviewer.description && (
                                                        <p className="mt-2 text-sm text-muted-foreground">
                                                            {
                                                                reviewer.description
                                                            }
                                                        </p>
                                                    )}
                                                </Link>

                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Link
                                                            href={editReviewer(
                                                                reviewer.id,
                                                            )}
                                                        >
                                                            <SquarePen />
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            requestDelete(
                                                                reviewer,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

ReviewersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Reviewers',
            href: reviewersIndex(),
        },
    ],
};
