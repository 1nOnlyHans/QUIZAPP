import { Head } from '@inertiajs/react';
import CourseForm from '@/components/courses/course-form';
import { index as coursesIndex } from '@/routes/courses';
import type { CourseCategory, CourseSummary, SelectOption } from '@/types';

type EditCourseProps = {
    course: CourseSummary;
    categoryOptions: SelectOption<CourseCategory>[];
};

export default function EditCourse({
    course,
    categoryOptions,
}: EditCourseProps) {
    return (
        <>
            <Head title={`Edit ${course.subject_code}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div>
                    <p className="font-mono text-xs font-medium text-muted-foreground uppercase">
                        {course.subject_code}
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold">
                        Edit course
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        Update the subject details students see in their course
                        library.
                    </p>
                </div>

                <section className="rounded-lg border border-border bg-card p-6">
                    <CourseForm
                        course={course}
                        categoryOptions={categoryOptions}
                    />
                </section>
            </div>
        </>
    );
}

EditCourse.layout = {
    breadcrumbs: [
        {
            title: 'Courses',
            href: coursesIndex(),
        },
        {
            title: 'Edit course',
            href: coursesIndex(),
        },
    ],
};
