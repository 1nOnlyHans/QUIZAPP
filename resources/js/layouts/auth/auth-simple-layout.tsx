import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-background p-6 md:p-10">
            <div className="absolute top-[-18rem] left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(80,227,194,0.32),transparent_28%),radial-gradient(circle_at_70%_35%,rgba(0,112,243,0.26),transparent_30%),radial-gradient(circle_at_50%_65%,rgba(255,0,128,0.18),transparent_32%),radial-gradient(circle_at_75%_70%,rgba(249,203,40,0.18),transparent_26%)] blur-3xl" />
            <div className="w-full max-w-sm">
                <div className="relative flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card shadow-[0_1px_1px_rgba(0,0,0,0.04)]">
                                <AppLogoIcon className="size-5 fill-current text-[var(--foreground)]" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-semibold tracking-[-0.02em]">
                                {title}
                            </h1>
                            <p className="text-center text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
