# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

"KWIZ" — a Laravel 13 + Inertia.js + React 19 app, built from `laravel/react-starter-kit`. The starter-kit scaffolding (Fortify auth: login/registration/2FA/passkeys, settings) is largely untouched; the app-specific domain is a course/lesson material manager (`Course` → `Lesson`, categorized by `AcademicPeriod`) with a dashboard overview.

## Commands

Setup: `composer setup` (installs deps, copies `.env`, generates key, migrates, builds assets).

Dev server: `composer dev` (runs `php artisan dev`, which concurrently runs the PHP server, queue listener, and Vite). `npm run dev` runs Vite alone.

Build: `npm run build` (`npm run build:ssr` for SSR bundle).

Full CI check (mirrors `composer ci:check`): `npm run lint:check`, `npm run format:check`, `npm run types:check` (tsc), and PHP tests.

PHP:
- Lint/format: `composer lint` (Pint, applies fixes) / `composer lint:check` (check only)
- Static analysis: `composer types:check` (PHPStan/Larastan, level 7, config in `phpstan.neon`)
- Full test suite incl. lint+types: `composer test`
- Tests only: `php artisan test`
- Single test file: `php artisan test tests/Feature/CourseManagementTest.php`
- Single test by name: `php artisan test --filter=test_method_name`

JS/TS:
- Lint: `npm run lint` (fixes) / `npm run lint:check`
- Format: `npm run format` (Prettier, targets `resources/`) / `npm run format:check`
- Type check: `npm run types:check` (`tsc --noEmit`)

Run one PHP script ad hoc: `php artisan tinker`.

## Architecture

**Backend flow**: routes (`routes/web.php`, `routes/settings.php`) → Controllers (thin, in `app/Http/Controllers`) → `App\Http\Requests\*` for validation → `App\Services\*` for business logic/persistence → Eloquent models. Controllers call `Gate::authorize(...)` explicitly per action rather than using `authorize()` in FormRequests; policies live in `app/Policies` and are registered in `AppServiceProvider::boot()`.

- **Courses/Lessons domain**: `Course` belongsTo `User`, hasMany `Lesson`. `Lesson` belongsTo `Course` and `AcademicPeriod`. `LessonMaterialType` enum (`file`/`link`) drives whether a lesson stores an uploaded file (via `LessonService::storeFile`, disk `local`, path `lessons/{user_id}/{course_id}/...`) or an `external_url`. `CourseCategory` enum is `major`/`minor`. Both enums expose an `options()` static used to feed `<select>` props to the frontend.
- **Services own persistence + side effects**: `CourseService` and `LessonService` wrap DB writes in `DB::transaction`; deleting a course cascades to delete lesson files via `LessonService::deleteStoredFile`. Controllers never touch `Storage` or transactions directly except for streaming file responses (`LessonController::inline/download`).
- Controllers hand-build response arrays (e.g. `courseSummary`, `courseDetail`, `lessonData` in `CourseController`) rather than using API Resources — keep new endpoints consistent with that pattern unless refactoring intentionally.
- Route-model binding uses `scopeBindings()` on the authenticated route group in `routes/web.php`, so nested resources like `courses/{course}/lessons/{lesson}` require the lesson to actually belong to that course.
- Authorization ownership check is always `record->user_id === $user->id` (courses) or traced through the parent course (lessons) — see `CoursePolicy`/`LessonPolicy`.
- `HandleInertiaRequests` shares `auth.user`, `name` (app name), and `sidebarOpen` (from a cookie) on every Inertia response.
- `AppServiceProvider` sets app-wide defaults: `CarbonImmutable` as the date class, destructive DB commands prohibited in production, and stronger password rules in production only.

**Frontend flow**: Inertia pages live in `resources/js/pages/**`, one file per route action (e.g. `pages/courses/{index,create,edit,show}.tsx`, `pages/courses/lessons/view.tsx`). Layout selection happens centrally in `resources/js/app.tsx` (`createInertiaApp`'s `layout` callback) based on page name prefix (`auth/*` → `AuthLayout`, `settings/*` → `AppLayout`+`SettingsLayout`, `welcome` → none, else `AppLayout`) — new page directories should follow this naming convention rather than setting a `.layout` per-page unless overriding breadcrumbs.

- Pages set breadcrumbs via a static `PageComponent.layout = { breadcrumbs: [...] }` (see `pages/courses/create.tsx`).
- Routes/URLs are never hand-written as strings — use generated Wayfinder helpers from `resources/js/routes/**` and `resources/js/actions/**` (e.g. `import { create, index } from '@/routes/courses'`). These are generated from PHP routes (`php artisan wayfinder:generate --with-form`) and are gitignored-style generated code — do not hand-edit; also excluded from ESLint (see `eslint.config.js` ignores).
- `resources/js/components/ui/*` is shadcn/ui-style generated primitives (Radix + `class-variance-authority`) — also excluded from lint, treat as vendored.
- Domain-specific components live in `resources/js/components/courses/*` (e.g. `course-form.tsx`).
- Path alias `@/*` → `resources/js/*` (set in both `tsconfig.json` and relied on throughout).
- Import order and type-only imports are enforced by ESLint (`import/order` alphabetized, `consistent-type-imports`); Prettier handles formatting including Tailwind class sorting (`prettier-plugin-tailwindcss`).

**Enums as the value/label bridge**: PHP enums (`CourseCategory`, `LessonMaterialType`) are the source of truth for select-style options; controllers pass `Enum::options()` as Inertia props, and the frontend types (`SelectOption<T>`) consume `{ value, label }` pairs — extend the enum, not the frontend, when adding new categories/types.

**Chisel scaffolding**: `chisel.php` / `chisel-paths.php` at the repo root are from `laravel/chisel`, the starter-kit's post-install feature-toggle tool (enables/disables auth features like 2FA, passkeys, registration, email verification and deletes the unused code). They're normally deleted by the installer after running once; their presence here means the installer step may not have been run — don't delete them unprompted, and don't treat `// <feature>` style comment markers in Fortify/auth files as dead code without checking if Chisel still references them.

## Testing conventions

PHPUnit (not Pest) feature tests live in `tests/Feature`, organized by domain (`Auth/`, `Settings/`, plus `CourseManagementTest.php`, `LessonManagementTest.php`, `DashboardTest.php`). Test DB is in-memory SQLite (`phpunit.xml`), queue/session/cache drivers are swapped to array/sync for speed. `RefreshDatabase`-style Feature tests are expected for anything touching the DB.
