import { Head } from '@inertiajs/react';
import ReviewerForm from '@/components/reviewers/reviewer-form';
import { index as reviewersIndex } from '@/routes/reviewers';
import type {
    ReviewerCourse,
    ReviewerDetail,
    ReviewerLessonOption,
} from '@/types';

type EditReviewerProps = {
    reviewer: ReviewerDetail;
    course: ReviewerCourse;
    lessonOptions: ReviewerLessonOption[];
};

export default function EditReviewer({
    reviewer,
    course,
    lessonOptions,
}: EditReviewerProps) {
    return (
        <>
            <Head title={`Edit ${reviewer.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div>
                    <p className="font-mono text-xs font-medium text-muted-foreground uppercase">
                        {course.subject_code}
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold">
                        Edit reviewer
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        Update the terms, definitions, and linked lessons.
                    </p>
                </div>

                <ReviewerForm
                    course={course}
                    lessonOptions={lessonOptions}
                    reviewer={reviewer}
                />
            </div>
        </>
    );
}

EditReviewer.layout = {
    breadcrumbs: [
        {
            title: 'Reviewers',
            href: reviewersIndex(),
        },
        {
            title: 'Edit reviewer',
            href: reviewersIndex(),
        },
    ],
};
