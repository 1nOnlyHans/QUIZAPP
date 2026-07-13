<?php

namespace App\Http\Controllers;

use App\Http\Requests\Lessons\StoreLessonRequest;
use App\Http\Requests\Lessons\UpdateLessonRequest;
use App\Models\Course;
use App\Models\Lesson;
use App\Services\LessonService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LessonController extends Controller
{
    public function __construct(
        private readonly LessonService $lessons,
    ) {}

    public function store(StoreLessonRequest $request, Course $course): RedirectResponse
    {
        Gate::authorize('create', [Lesson::class, $course]);

        $this->lessons->create($course, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Lesson added.')]);

        return to_route('courses.show', $course);
    }

    public function update(UpdateLessonRequest $request, Course $course, Lesson $lesson): RedirectResponse
    {
        Gate::authorize('update', $lesson);

        $this->lessons->update($lesson, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Lesson updated.')]);

        return to_route('courses.show', $course);
    }

    public function destroy(Course $course, Lesson $lesson): RedirectResponse
    {
        Gate::authorize('delete', $lesson);

        $this->lessons->delete($lesson);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Lesson deleted.')]);

        return to_route('courses.show', $course);
    }

    public function view(Course $course, Lesson $lesson): Response
    {
        Gate::authorize('view', $lesson);

        abort_unless($lesson->hasStoredFile(), 404);
        abort_if($lesson->file_disk === null || $lesson->file_path === null, 404);

        return Inertia::render('courses/lessons/view', [
            'course' => [
                'id' => $course->id,
                'subject_code' => $course->subject_code,
                'subject_name' => $course->subject_name,
                'category' => $course->category->value,
                'category_label' => $course->category->label(),
                'lessons_count' => $course->lessons()->count(),
                'created_at' => $course->created_at?->toISOString(),
                'updated_at' => $course->updated_at?->toISOString(),
            ],
            'lesson' => [
                'id' => $lesson->id,
                'course_id' => $lesson->course_id,
                'academic_period_id' => $lesson->academic_period_id,
                'academic_period_slug' => $lesson->academicPeriod?->slug,
                'academic_period_name' => $lesson->academicPeriod?->name,
                'title' => $lesson->title,
                'description' => $lesson->description,
                'material_type' => $lesson->material_type->value,
                'material_type_label' => $lesson->material_type->label(),
                'file_name' => $lesson->file_name,
                'file_mime_type' => $lesson->file_mime_type,
                'file_size' => $lesson->file_size,
                'external_url' => $lesson->external_url,
                'download_url' => route('courses.lessons.download', [$course, $lesson]),
                'preview_url' => route('courses.lessons.view', [$course, $lesson]),
                'created_at' => $lesson->created_at?->toISOString(),
                'updated_at' => $lesson->updated_at?->toISOString(),
            ],
            'viewer' => [
                'type' => $this->viewerType($lesson),
                'inline_url' => route('courses.lessons.inline', [$course, $lesson]),
                'download_url' => route('courses.lessons.download', [$course, $lesson]),
            ],
        ]);
    }

    public function inline(Course $course, Lesson $lesson): StreamedResponse
    {
        Gate::authorize('view', $lesson);

        abort_unless($lesson->hasStoredFile(), 404);
        abort_if($lesson->file_disk === null || $lesson->file_path === null, 404);

        return Storage::disk($lesson->file_disk)
            ->response(
                $lesson->file_path,
                $lesson->file_name ?? 'lesson-material',
                [
                    'Content-Type' => $lesson->file_mime_type ?? 'application/octet-stream',
                    'X-Content-Type-Options' => 'nosniff',
                ],
            );
    }

    public function download(Course $course, Lesson $lesson): StreamedResponse
    {
        Gate::authorize('view', $lesson);

        abort_unless($lesson->hasStoredFile(), 404);
        abort_if($lesson->file_disk === null || $lesson->file_path === null, 404);

        return Storage::disk($lesson->file_disk)
            ->download($lesson->file_path, $lesson->file_name ?? 'lesson-material');
    }

    private function viewerType(Lesson $lesson): string
    {
        $mimeType = $lesson->file_mime_type ?? '';

        if ($mimeType === 'application/pdf') {
            return 'pdf';
        }

        if (str_starts_with($mimeType, 'image/')) {
            return 'image';
        }

        if (str_starts_with($mimeType, 'text/')) {
            return 'text';
        }

        return 'unsupported';
    }
}
