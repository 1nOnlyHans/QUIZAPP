import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Download,
    ExternalLink,
    Eye,
    FileWarning,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { index as coursesIndex, show as showCourse } from '@/routes/courses';
import type { CourseSummary, Lesson } from '@/types';

type ViewerType = 'pdf' | 'image' | 'text' | 'unsupported';

type LessonViewProps = {
    course: CourseSummary;
    lesson: Lesson;
    viewer: {
        type: ViewerType;
        inline_url: string;
        download_url: string;
    };
};

function FileViewer({
    lesson,
    viewer,
}: {
    lesson: Lesson;
    viewer: LessonViewProps['viewer'];
}) {
    if (viewer.type === 'image') {
        return (
            <div className="flex min-h-[560px] items-center justify-center bg-background p-4">
                <img
                    src={viewer.inline_url}
                    alt={lesson.title}
                    className="max-h-[calc(100vh-18rem)] max-w-full rounded-md object-contain shadow-[0_1px_1px_rgba(0,0,0,0.04)]"
                />
            </div>
        );
    }

    if (viewer.type === 'pdf' || viewer.type === 'text') {
        return (
            <iframe
                src={viewer.inline_url}
                title={lesson.title}
                className="h-[calc(100vh-18rem)] min-h-[560px] w-full bg-background"
            />
        );
    }

    return (
        <div className="flex min-h-[420px] flex-col items-center justify-center p-6 text-center">
            <FileWarning className="size-10 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">Preview unavailable</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
                This file type cannot be rendered by the browser. Download it to
                open it with the right app.
            </p>
            <Button asChild className="mt-5">
                <a href={viewer.download_url}>
                    <Download />
                    Download file
                </a>
            </Button>
        </div>
    );
}

export default function LessonView({
    course,
    lesson,
    viewer,
}: LessonViewProps) {
    return (
        <>
            <Head title={lesson.title} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <section className="rounded-lg border border-border bg-card p-5">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                        <div className="min-w-0">
                            <Button asChild variant="ghost" size="sm">
                                <Link href={showCourse(course.id)}>
                                    <ArrowLeft />
                                    Back to course
                                </Link>
                            </Button>
                            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <Eye className="size-4" />
                                <span className="font-mono">
                                    {course.subject_code}
                                </span>
                                <span>/</span>
                                <span>{lesson.academic_period_name}</span>
                            </div>
                            <h1 className="mt-2 text-2xl font-semibold">
                                {lesson.title}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {lesson.file_name}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button asChild variant="outline">
                                <a
                                    href={viewer.inline_url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <ExternalLink />
                                    Open tab
                                </a>
                            </Button>
                            <Button asChild>
                                <a href={viewer.download_url}>
                                    <Download />
                                    Download
                                </a>
                            </Button>
                        </div>
                    </div>
                </section>

                <section className="overflow-hidden rounded-lg border border-border bg-card">
                    <FileViewer lesson={lesson} viewer={viewer} />
                </section>
            </div>
        </>
    );
}

LessonView.layout = {
    breadcrumbs: [
        {
            title: 'Courses',
            href: coursesIndex(),
        },
        {
            title: 'File viewer',
            href: coursesIndex(),
        },
    ],
};
