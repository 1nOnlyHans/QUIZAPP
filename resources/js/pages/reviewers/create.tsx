import { Head } from '@inertiajs/react';
import ReviewerForm from '@/components/reviewers/reviewer-form';
import { index as reviewersIndex } from '@/routes/reviewers';
import type { ReviewerCourse, ReviewerLessonOption } from '@/types';

type CreateReviewerProps = {
    course: ReviewerCourse;
    lessonOptions: ReviewerLessonOption[];
};

export default function CreateReviewer({
    course,
    lessonOptions,
}: CreateReviewerProps) {
    return (
        <>
            <Head title="Create reviewer" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div>
                    <p className="font-mono text-xs font-medium text-muted-foreground uppercase">
                        {course.subject_code}
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold">
                        Create reviewer
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        Add terms and definitions for {course.subject_name}.
                    </p>
                </div>

                <ReviewerForm course={course} lessonOptions={lessonOptions} />
            </div>
        </>
    );
}

CreateReviewer.layout = {
    breadcrumbs: [
        {
            title: 'Reviewers',
            href: reviewersIndex(),
        },
        {
            title: 'Create reviewer',
            href: reviewersIndex(),
        },
    ],
};
