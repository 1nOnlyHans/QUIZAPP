import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Check, CircleDot, Command, Sparkles } from 'lucide-react';
import { dashboard, login, register } from '@/routes';

const features = [
    {
        eyebrow: 'Quiz builder',
        title: 'Create quizzes for any class or topic.',
        body: 'Add questions, multiple-choice answers, correct options, and descriptions in one focused workspace.',
    },
    {
        eyebrow: 'Student mode',
        title: 'Let learners answer with less friction.',
        body: 'Students can move through timed attempts, submit answers, and see a clear completion state.',
    },
    {
        eyebrow: 'Results',
        title: 'Review scores and attempts quickly.',
        body: 'QuizApp keeps performance, progress, and recent activity easy to scan after every assessment.',
    },
];

const steps = ['Choose quiz', 'Answer questions', 'Submit score'];

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="QuizApp" />
            <main className="min-h-screen bg-background text-foreground">
                <header className="border-b border-border bg-background/90">
                    <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                        <Link
                            href={dashboard()}
                            className="flex items-center gap-2 text-sm font-semibold"
                        >
                            <span className="flex size-8 items-center justify-center rounded-md border border-border bg-card">
                                <Command className="size-4" />
                            </span>
                            QuizApp
                        </Link>

                        <div className="flex items-center gap-2 text-sm">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex h-9 items-center rounded-md bg-primary px-3 font-medium text-primary-foreground"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="inline-flex h-9 items-center rounded-md border border-border bg-card px-3 font-medium text-foreground"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-flex h-9 items-center rounded-md bg-primary px-3 font-medium text-primary-foreground"
                                    >
                                        Sign up
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                <section className="relative overflow-hidden border-b border-border">
                    <div className="absolute inset-x-0 top-0 mx-auto h-[30rem] max-w-5xl bg-[radial-gradient(circle_at_18%_30%,rgba(80,227,194,0.45),transparent_24%),radial-gradient(circle_at_42%_22%,rgba(0,124,240,0.38),transparent_28%),radial-gradient(circle_at_62%_36%,rgba(121,40,202,0.28),transparent_28%),radial-gradient(circle_at_78%_28%,rgba(255,0,128,0.22),transparent_24%),radial-gradient(circle_at_84%_58%,rgba(249,203,40,0.24),transparent_22%)] blur-3xl" />
                    <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-32">
                        <div className="max-w-2xl">
                            <p className="mb-5 font-mono text-xs font-medium tracking-normal text-muted-foreground uppercase">
                                QuizApp assessment platform
                            </p>
                            <h1 className="text-5xl leading-[0.95] font-semibold tracking-[-0.05em] text-balance md:text-6xl">
                                Build quizzes. Take attempts. See results
                                instantly.
                            </h1>
                            <p className="mt-6 max-w-xl text-base leading-6 text-[#4d4d4d] dark:text-muted-foreground">
                                QuizApp gives teachers and learners a clean
                                place to create assessments, answer questions,
                                and understand scores without extra clutter.
                            </p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href={auth.user ? dashboard() : register()}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-base font-medium text-primary-foreground"
                                >
                                    Create a quiz
                                    <ArrowRight className="size-4" />
                                </Link>
                                <Link
                                    href={auth.user ? dashboard() : login()}
                                    className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-5 text-base font-medium text-foreground"
                                >
                                    Log in to answer
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_1px_rgba(0,0,0,0.04)]">
                            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                                <div>
                                    <p className="font-mono text-xs text-muted-foreground uppercase">
                                        Quiz preview
                                    </p>
                                    <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em]">
                                        General Knowledge
                                    </h2>
                                </div>
                                <span className="rounded-full border border-border px-3 py-1 font-mono text-xs">
                                    08 questions
                                </span>
                            </div>

                            <div className="mb-3 rounded-lg border border-border bg-background p-4">
                                <p className="font-mono text-xs text-muted-foreground uppercase">
                                    Current question
                                </p>
                                <p className="mt-2 text-sm font-medium">
                                    Which planet is known as the Red Planet?
                                </p>
                                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                    {['Earth', 'Mars', 'Venus', 'Jupiter'].map(
                                        (choice) => (
                                            <span
                                                key={choice}
                                                className={`rounded-md border px-3 py-2 text-sm ${
                                                    choice === 'Mars'
                                                        ? 'border-primary bg-card text-foreground'
                                                        : 'border-border text-muted-foreground'
                                                }`}
                                            >
                                                {choice}
                                            </span>
                                        ),
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {steps.map((step, index) => (
                                    <div
                                        key={step}
                                        className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
                                    >
                                        <span className="flex size-8 items-center justify-center rounded-full border border-border bg-card">
                                            {index === 1 ? (
                                                <CircleDot className="size-4 text-[#0070f3]" />
                                            ) : (
                                                <Check className="size-4" />
                                            )}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium">
                                                {step}
                                            </p>
                                            <div className="mt-2 h-1.5 rounded-full bg-secondary">
                                                <div
                                                    className="h-full rounded-full bg-primary"
                                                    style={{
                                                        width: `${(index + 1) * 28}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 rounded-lg border border-border bg-[#fafafa] p-4 font-mono text-sm leading-6 dark:bg-background">
                                <p className="text-muted-foreground">
                                    quiz.submitAttempt()
                                </p>
                                <p>
                                    <span className="text-[#0070f3]">
                                        score
                                    </span>
                                    {' = '}
                                    <span>7 / 8 correct</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-6 py-20">
                    <div className="mb-8 flex items-end justify-between gap-6">
                        <div>
                            <p className="font-mono text-xs font-medium text-muted-foreground uppercase">
                                Built for QuizApp
                            </p>
                            <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-0.04em]">
                                The essentials for creating and taking quizzes.
                            </h2>
                        </div>
                        <Sparkles className="hidden size-6 text-[#0070f3] sm:block" />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {features.map((feature) => (
                            <article
                                key={feature.title}
                                className="rounded-xl border border-border bg-card p-6 shadow-[0_1px_1px_rgba(0,0,0,0.04)]"
                            >
                                <p className="font-mono text-xs font-medium text-muted-foreground uppercase">
                                    {feature.eyebrow}
                                </p>
                                <h3 className="mt-4 text-xl font-semibold tracking-[-0.02em]">
                                    {feature.title}
                                </h3>
                                <p className="mt-3 text-sm leading-5 text-[#4d4d4d] dark:text-muted-foreground">
                                    {feature.body}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="border-t border-border px-6 py-16">
                    <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                        <h2 className="max-w-2xl text-4xl leading-tight font-semibold tracking-[-0.05em]">
                            Ready to start your next quiz?
                        </h2>
                        <Link
                            href={auth.user ? dashboard() : register()}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-base font-medium text-primary-foreground"
                        >
                            Continue
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>
                </section>
            </main>
        </>
    );
}
