import { Head, Link, router } from '@inertiajs/react';
import { BookOpenCheck, Plus, Search, SquarePen, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    create as createCourse,
    destroy as destroyCourse,
    index as coursesIndex,
    show as showCourse,
    edit as editCourse,
} from '@/routes/courses';
import type { CourseCategory, CourseSummary, SelectOption } from '@/types';

type CoursesIndexProps = {
    courses: CourseSummary[];
    categoryOptions: SelectOption<CourseCategory>[];
};

const allCategories = 'all';

export default function CoursesIndex({
    courses,
    categoryOptions,
}: CoursesIndexProps) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<
        CourseCategory | typeof allCategories
    >(allCategories);

    const visibleCourses = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return courses.filter((course) => {
            const matchesSearch =
                normalizedSearch.length === 0 ||
                course.subject_code.toLowerCase().includes(normalizedSearch) ||
                course.subject_name.toLowerCase().includes(normalizedSearch);
            const matchesCategory =
                category === allCategories || course.category === category;

            return matchesSearch && matchesCategory;
        });
    }, [category, courses, search]);

    const totalLessons = courses.reduce(
        (total, course) => total + course.lessons_count,
        0,
    );

    const requestDelete = (course: CourseSummary) => {
        if (
            !window.confirm(
                `Delete ${course.subject_code}? This will remove its lessons and files.`,
            )
        ) {
            return;
        }

        router.delete(destroyCourse.url(course.id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Courses" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="font-mono text-xs font-medium text-muted-foreground uppercase">
                            Library
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold">Courses</h1>
                    </div>
                    <Button asChild>
                        <Link href={createCourse()}>
                            <Plus />
                            New course
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <section className="rounded-lg border border-border bg-card p-5">
                        <p className="text-sm text-muted-foreground">Courses</p>
                        <p className="mt-3 text-3xl font-semibold">
                            {courses.length}
                        </p>
                    </section>
                    <section className="rounded-lg border border-border bg-card p-5">
                        <p className="text-sm text-muted-foreground">Lessons</p>
                        <p className="mt-3 text-3xl font-semibold">
                            {totalLessons}
                        </p>
                    </section>
                    <section className="rounded-lg border border-border bg-card p-5">
                        <p className="text-sm text-muted-foreground">
                            Major subjects
                        </p>
                        <p className="mt-3 text-3xl font-semibold">
                            {
                                courses.filter(
                                    (course) => course.category === 'major',
                                ).length
                            }
                        </p>
                    </section>
                </div>

                <section className="rounded-lg border border-border bg-card">
                    <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                className="pl-9"
                                placeholder="Search subject code or name"
                            />
                        </div>
                        <Select
                            value={category}
                            onValueChange={(value) =>
                                setCategory(
                                    value as
                                        CourseCategory | typeof allCategories,
                                )
                            }
                        >
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={allCategories}>
                                    All categories
                                </SelectItem>
                                {categoryOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {visibleCourses.length === 0 ? (
                        <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
                            <BookOpenCheck className="size-10 text-muted-foreground" />
                            <h2 className="mt-4 text-lg font-semibold">
                                No courses found
                            </h2>
                            <p className="mt-2 max-w-md text-sm text-muted-foreground">
                                Create a course to start grouping lessons by
                                grading period.
                            </p>
                            <Button asChild className="mt-5">
                                <Link href={createCourse()}>
                                    <Plus />
                                    New course
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {visibleCourses.map((course) => (
                                <article
                                    key={course.id}
                                    className="flex flex-col gap-4 p-4 transition-colors hover:bg-accent/40 md:flex-row md:items-center md:justify-between"
                                >
                                    <Link
                                        href={showCourse(course.id)}
                                        className="min-w-0 flex-1"
                                    >
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-mono text-sm font-semibold">
                                                {course.subject_code}
                                            </span>
                                            <Badge variant="secondary">
                                                {course.category_label}
                                            </Badge>
                                        </div>
                                        <h2 className="mt-2 text-lg font-semibold">
                                            {course.subject_name}
                                        </h2>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {course.lessons_count}{' '}
                                            {course.lessons_count === 1
                                                ? 'lesson'
                                                : 'lessons'}
                                        </p>
                                    </Link>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Link href={editCourse(course.id)}>
                                                <SquarePen />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                requestDelete(course)
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
            </div>
        </>
    );
}

CoursesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Courses',
            href: coursesIndex(),
        },
    ],
};
