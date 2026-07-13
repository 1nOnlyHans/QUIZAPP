import { Head, Link, router } from '@inertiajs/react';
import {
    Download,
    Eye,
    ExternalLink,
    FileText,
    LinkIcon,
    SquarePen,
    Trash2,
} from 'lucide-react';
import LessonFormDialog from '@/components/courses/lesson-form-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    destroy as destroyCourse,
    edit as editCourse,
    index as coursesIndex,
} from '@/routes/courses';
import { destroy as destroyLesson } from '@/routes/courses/lessons';
import type {
    AcademicPeriod,
    CourseSummary,
    Lesson,
    LessonMaterialType,
    SelectOption,
} from '@/types';

type ShowCourseProps = {
    course: CourseSummary;
    periods: AcademicPeriod[];
    lessons: Lesson[];
    materialTypeOptions: SelectOption<LessonMaterialType>[];
};

const fileSize = (size: number | null) => {
    if (size === null) {
        return null;
    }

    if (size < 1024) {
        return `${size} B`;
    }

    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

export default function ShowCourse({
    course,
    periods,
    lessons,
    materialTypeOptions,
}: ShowCourseProps) {
    const lessonsByPeriod = periods.map((period) => ({
        period,
        lessons: lessons.filter(
            (lesson) => lesson.academic_period_id === period.id,
        ),
    }));

    const requestCourseDelete = () => {
        if (
            !window.confirm(
                `Delete ${course.subject_code}? This will remove its lessons and files.`,
            )
        ) {
            return;
        }

        router.delete(destroyCourse.url(course.id));
    };

    const requestLessonDelete = (lesson: Lesson) => {
        if (!window.confirm(`Delete ${lesson.title}?`)) {
            return;
        }

        router.delete(
            destroyLesson.url({
                course: course.id,
                lesson: lesson.id,
            }),
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head title={course.subject_code} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <section className="rounded-lg border border-border bg-card p-6">
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-sm font-semibold">
                                    {course.subject_code}
                                </span>
                                <Badge variant="secondary">
                                    {course.category_label}
                                </Badge>
                            </div>
                            <h1 className="mt-3 text-3xl font-semibold">
                                {course.subject_name}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {course.lessons_count}{' '}
                                {course.lessons_count === 1
                                    ? 'lesson'
                                    : 'lessons'}{' '}
                                organized across grading periods.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <LessonFormDialog
                                course={course}
                                periods={periods}
                                materialTypeOptions={materialTypeOptions}
                            />
                            <Button asChild variant="outline">
                                <Link href={editCourse(course.id)}>
                                    <SquarePen />
                                    Edit course
                                </Link>
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={requestCourseDelete}
                            >
                                <Trash2 />
                                Delete course
                            </Button>
                        </div>
                    </div>
                </section>

                <div className="grid gap-4">
                    {lessonsByPeriod.map(({ period, lessons: periodLessons }) => (
                        <section
                            key={period.id}
                            className="rounded-lg border border-border bg-card"
                        >
                            <div className="flex items-center justify-between gap-3 border-b border-border p-4">
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        {period.name}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {periodLessons.length}{' '}
                                        {periodLessons.length === 1
                                            ? 'material'
                                            : 'materials'}
                                    </p>
                                </div>
                            </div>

                            {periodLessons.length === 0 ? (
                                <div className="p-6 text-sm text-muted-foreground">
                                    No lessons added for this period yet.
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {periodLessons.map((lesson) => (
                                        <article
                                            key={lesson.id}
                                            className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {lesson.material_type ===
                                                    'file' ? (
                                                        <FileText className="size-4 text-muted-foreground" />
                                                    ) : (
                                                        <LinkIcon className="size-4 text-muted-foreground" />
                                                    )}
                                                    <h3 className="font-medium">
                                                        {lesson.title}
                                                    </h3>
                                                    <Badge variant="outline">
                                                        {
                                                            lesson.material_type_label
                                                        }
                                                    </Badge>
                                                </div>
                                                {lesson.description && (
                                                    <p className="mt-2 text-sm text-muted-foreground">
                                                        {lesson.description}
                                                    </p>
                                                )}
                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    {lesson.material_type ===
                                                    'file'
                                                        ? [
                                                              lesson.file_name,
                                                              fileSize(
                                                                  lesson.file_size,
                                                              ),
                                                          ]
                                                              .filter(Boolean)
                                                              .join(' - ')
                                                        : lesson.external_url}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                {lesson.material_type ===
                                                    'file' &&
                                                    lesson.preview_url && (
                                                        <Button
                                                            asChild
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            <Link
                                                                href={
                                                                    lesson.preview_url
                                                                }
                                                            >
                                                                <Eye />
                                                                View
                                                            </Link>
                                                        </Button>
                                                    )}
                                                {lesson.material_type ===
                                                    'file' &&
                                                    lesson.download_url && (
                                                        <Button
                                                            asChild
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            <a
                                                                href={
                                                                    lesson.download_url
                                                                }
                                                            >
                                                                <Download />
                                                                Download
                                                            </a>
                                                        </Button>
                                                    )}
                                                {lesson.material_type ===
                                                    'link' &&
                                                    lesson.external_url && (
                                                        <Button
                                                            asChild
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            <a
                                                                href={
                                                                    lesson.external_url
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                <ExternalLink />
                                                                Open
                                                            </a>
                                                        </Button>
                                                    )}
                                                <LessonFormDialog
                                                    course={course}
                                                    periods={periods}
                                                    materialTypeOptions={
                                                        materialTypeOptions
                                                    }
                                                    lesson={lesson}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        requestLessonDelete(
                                                            lesson,
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
                            )}
                        </section>
                    ))}
                </div>
            </div>
        </>
    );
}

ShowCourse.layout = {
    breadcrumbs: [
        {
            title: 'Courses',
            href: coursesIndex(),
        },
        {
            title: 'Course details',
            href: coursesIndex(),
        },
    ],
};
