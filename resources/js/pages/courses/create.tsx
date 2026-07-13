import { Head } from '@inertiajs/react';
import CourseForm from '@/components/courses/course-form';
import { create as createCourse, index as coursesIndex } from '@/routes/courses';
import type { CourseCategory, SelectOption } from '@/types';

type CreateCourseProps = {
    categoryOptions: SelectOption<CourseCategory>[];
};

export default function CreateCourse({ categoryOptions }: CreateCourseProps) {
    return (
        <>
            <Head title="Create course" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div>
                    <p className="font-mono text-xs font-medium text-muted-foreground uppercase">
                        Courses
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold">
                        Create course
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        Add a subject so lessons can be organized by grading
                        period.
                    </p>
                </div>

                <section className="rounded-lg border border-border bg-card p-6">
                    <CourseForm categoryOptions={categoryOptions} />
                </section>
            </div>
        </>
    );
}

CreateCourse.layout = {
    breadcrumbs: [
        {
            title: 'Courses',
            href: coursesIndex(),
        },
        {
            title: 'Create course',
            href: createCourse(),
        },
    ],
};
