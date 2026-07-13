import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpenCheck,
    FileText,
    FolderOpen,
    LinkIcon,
    Plus,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import {
    create as createCourse,
    index as coursesIndex,
    show as showCourse,
} from '@/routes/courses';
import type {
    DashboardOverview,
    DashboardPeriodStat,
    DashboardRecentCourse,
    DashboardRecentLesson,
} from '@/types';

type DashboardProps = {
    overview: DashboardOverview;
};

type StatCardProps = {
    label: string;
    value: number;
    detail: string;
    icon: React.ComponentType<{ className?: string }>;
};

function formatDate(value: string | null) {
    if (value === null) {
        return 'No activity yet';
    }

    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(value));
}

function StatCard({ label, value, detail, icon: Icon }: StatCardProps) {
    return (
        <section className="rounded-lg border border-border bg-card p-5 shadow-[0_1px_1px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{label}</p>
                <Icon className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-4 text-3xl font-semibold">{value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
        </section>
    );
}

function PeriodRow({ stat }: { stat: DashboardPeriodStat }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium">{stat.name}</span>
                <span className="text-muted-foreground">
                    {stat.lessons_count}
                </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                    className="h-full rounded-full bg-foreground transition-[width]"
                    style={{ width: `${stat.percentage}%` }}
                />
            </div>
        </div>
    );
}

function EmptyPanel({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex min-h-48 flex-col items-center justify-center p-6 text-center">
            <FolderOpen className="size-9 text-muted-foreground" />
            <h2 className="mt-4 font-semibold">{title}</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {description}
            </p>
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}

function RecentCourseItem({ course }: { course: DashboardRecentCourse }) {
    return (
        <Link
            href={showCourse(course.id)}
            className="flex items-center justify-between gap-4 border-t border-border py-4 first:border-t-0 first:pt-0"
        >
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold">
                        {course.subject_code}
                    </span>
                    <Badge variant="secondary">{course.category_label}</Badge>
                </div>
                <p className="mt-1 truncate text-sm font-medium">
                    {course.subject_name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    Updated {formatDate(course.updated_at)}
                </p>
            </div>
            <div className="shrink-0 text-right">
                <p className="text-sm font-medium">{course.lessons_count}</p>
                <p className="text-xs text-muted-foreground">lessons</p>
            </div>
        </Link>
    );
}

function RecentLessonItem({ lesson }: { lesson: DashboardRecentLesson }) {
    return (
        <Link
            href={showCourse(lesson.course.id)}
            className="flex items-start justify-between gap-4 border-t border-border py-4 first:border-t-0 first:pt-0"
        >
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    {lesson.material_type === 'file' ? (
                        <FileText className="size-4 text-muted-foreground" />
                    ) : (
                        <LinkIcon className="size-4 text-muted-foreground" />
                    )}
                    <p className="truncate text-sm font-medium">
                        {lesson.title}
                    </p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                    {lesson.course.subject_code} / {lesson.academic_period.name}
                </p>
            </div>
            <p className="shrink-0 text-xs text-muted-foreground">
                {formatDate(lesson.created_at)}
            </p>
        </Link>
    );
}

export default function Dashboard({ overview }: DashboardProps) {
    const { totals, period_stats, recent_courses, recent_lessons } = overview;
    const hasCourses = totals.courses_count > 0;
    const hasLessons = totals.lessons_count > 0;

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="font-mono text-xs font-medium text-muted-foreground uppercase">
                            Personal library
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold">
                            Dashboard
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                            Your courses, lessons, and study materials at a
                            glance.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={createCourse()}>
                            <Plus />
                            New course
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Courses"
                        value={totals.courses_count}
                        detail="Subjects in your library"
                        icon={BookOpenCheck}
                    />
                    <StatCard
                        label="Lessons"
                        value={totals.lessons_count}
                        detail="Materials you added"
                        icon={FolderOpen}
                    />
                    <StatCard
                        label="Uploaded files"
                        value={totals.file_lessons_count}
                        detail="Private stored materials"
                        icon={FileText}
                    />
                    <StatCard
                        label="External links"
                        value={totals.link_lessons_count}
                        detail="Web resources saved"
                        icon={LinkIcon}
                    />
                </div>

                {!hasCourses && (
                    <section className="rounded-lg border border-border bg-card">
                        <EmptyPanel
                            title="Start with your first course"
                            description="Create a subject, then add lessons under All, Prelims, Midterm, Pre-Finals, or Finals."
                            action={
                                <Button asChild>
                                    <Link href={createCourse()}>
                                        <Plus />
                                        Create course
                                    </Link>
                                </Button>
                            }
                        />
                    </section>
                )}

                <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                    <section className="rounded-lg border border-border bg-card p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="font-semibold">
                                    Lessons by period
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Distribution across your grading periods
                                </p>
                            </div>
                            <Badge variant="outline">
                                {totals.lessons_count} total
                            </Badge>
                        </div>

                        <div className="mt-6 space-y-5">
                            {period_stats.map((stat) => (
                                <PeriodRow key={stat.id} stat={stat} />
                            ))}
                        </div>
                    </section>

                    <section className="rounded-lg border border-border bg-card p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="font-semibold">
                                    Recent lessons
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Latest materials you uploaded or saved
                                </p>
                            </div>
                            <Button asChild variant="outline" size="sm">
                                <Link href={coursesIndex()}>
                                    Courses
                                    <ArrowRight />
                                </Link>
                            </Button>
                        </div>

                        <div className="mt-5">
                            {hasLessons ? (
                                recent_lessons.map((lesson) => (
                                    <RecentLessonItem
                                        key={lesson.id}
                                        lesson={lesson}
                                    />
                                ))
                            ) : (
                                <EmptyPanel
                                    title="No lessons yet"
                                    description="Open a course and add a file or link to start building your study library."
                                />
                            )}
                        </div>
                    </section>
                </div>

                <section className="rounded-lg border border-border bg-card p-5">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="font-semibold">Recent courses</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Subjects with the latest updates
                            </p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href={coursesIndex()}>
                                View all
                                <ArrowRight />
                            </Link>
                        </Button>
                    </div>

                    <div className="mt-5">
                        {hasCourses ? (
                            recent_courses.map((course) => (
                                <RecentCourseItem
                                    key={course.id}
                                    course={course}
                                />
                            ))
                        ) : (
                            <EmptyPanel
                                title="No course activity yet"
                                description="Your recently updated courses will appear here after you create a subject."
                            />
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
