import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md border border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_1px_1px_rgba(0,0,0,0.04)]">
                <AppLogoIcon className="size-5 fill-current text-current" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    QuizApp
                </span>
            </div>
        </>
    );
}
