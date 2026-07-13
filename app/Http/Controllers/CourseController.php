<?php

namespace App\Http\Controllers;

use App\Enums\CourseCategory;
use App\Enums\LessonMaterialType;
use App\Http\Requests\Courses\StoreCourseRequest;
use App\Http\Requests\Courses\UpdateCourseRequest;
use App\Models\AcademicPeriod;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\User;
use App\Services\CourseService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function __construct(
        private readonly CourseService $courses,
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Course::class);

        /** @var User $user */
        $user = $request->user();

        $courses = Course::query()
            ->where('user_id', $user->id)
            ->withCount('lessons')
            ->orderBy('subject_name')
            ->orderBy('subject_code')
            ->get()
            ->map(fn (Course $course): array => $this->courseSummary($course));

        return Inertia::render('courses/index', [
            'courses' => $courses,
            'categoryOptions' => CourseCategory::options(),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Course::class);

        return Inertia::render('courses/create', [
            'categoryOptions' => CourseCategory::options(),
        ]);
    }

    public function store(StoreCourseRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $course = $this->courses->create($user, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Course created.')]);

        return to_route('courses.show', $course);
    }

    public function show(Course $course): Response
    {
        Gate::authorize('view', $course);

        $course->load([
            'lessons' => fn ($query) => $query
                ->with('academicPeriod')
                ->latest('updated_at')
                ->latest('id'),
        ])->loadCount('lessons');

        $periods = AcademicPeriod::query()
            ->ordered()
            ->get()
            ->map(fn (AcademicPeriod $period): array => $this->periodData($period));

        $lessons = $course->lessons
            ->map(fn (Lesson $lesson): array => $this->lessonData($lesson));

        return Inertia::render('courses/show', [
            'course' => $this->courseDetail($course),
            'periods' => $periods,
            'lessons' => $lessons,
            'materialTypeOptions' => LessonMaterialType::options(),
        ]);
    }

    public function edit(Course $course): Response
    {
        Gate::authorize('update', $course);

        return Inertia::render('courses/edit', [
            'course' => $this->courseSummary($course),
            'categoryOptions' => CourseCategory::options(),
        ]);
    }

    public function update(UpdateCourseRequest $request, Course $course): RedirectResponse
    {
        $this->courses->update($course, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Course updated.')]);

        return to_route('courses.show', $course);
    }

    public function destroy(Course $course): RedirectResponse
    {
        Gate::authorize('delete', $course);

        $this->courses->delete($course);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Course deleted.')]);

        return to_route('courses.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function courseSummary(Course $course): array
    {
        return [
            'id' => $course->id,
            'subject_code' => $course->subject_code,
            'subject_name' => $course->subject_name,
            'category' => $course->category->value,
            'category_label' => $course->category->label(),
            'lessons_count' => $course->lessons_count ?? 0,
            'created_at' => $course->created_at?->toISOString(),
            'updated_at' => $course->updated_at?->toISOString(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function courseDetail(Course $course): array
    {
        return [
            ...$this->courseSummary($course),
            'lessons_count' => $course->lessons_count ?? $course->lessons()->count(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function periodData(AcademicPeriod $period): array
    {
        return [
            'id' => $period->id,
            'name' => $period->name,
            'slug' => $period->slug,
            'sort_order' => $period->sort_order,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function lessonData(Lesson $lesson): array
    {
        $period = $lesson->academicPeriod;

        return [
            'id' => $lesson->id,
            'course_id' => $lesson->course_id,
            'academic_period_id' => $lesson->academic_period_id,
            'academic_period_slug' => $period?->slug,
            'academic_period_name' => $period?->name,
            'title' => $lesson->title,
            'description' => $lesson->description,
            'material_type' => $lesson->material_type->value,
            'material_type_label' => $lesson->material_type->label(),
            'file_name' => $lesson->file_name,
            'file_mime_type' => $lesson->file_mime_type,
            'file_size' => $lesson->file_size,
            'external_url' => $lesson->external_url,
            'preview_url' => $lesson->hasStoredFile()
                ? route('courses.lessons.view', [$lesson->course_id, $lesson->id])
                : null,
            'download_url' => $lesson->hasStoredFile()
                ? route('courses.lessons.download', [$lesson->course_id, $lesson->id])
                : null,
            'created_at' => $lesson->created_at?->toISOString(),
            'updated_at' => $lesson->updated_at?->toISOString(),
        ];
    }
}
