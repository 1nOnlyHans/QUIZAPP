<?php

namespace App\Http\Controllers;

use App\Http\Requests\Reviewers\StoreReviewerRequest;
use App\Http\Requests\Reviewers\UpdateReviewerRequest;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Reviewer;
use App\Models\ReviewerItem;
use App\Models\User;
use App\Services\ReviewerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ReviewerController extends Controller
{
    public function __construct(
        private readonly ReviewerService $reviewers,
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Reviewer::class);

        /** @var User $user */
        $user = $request->user();

        $reviewers = Reviewer::query()
            ->with('course:id,subject_code,subject_name,category')
            ->withCount(['items', 'lessons'])
            ->whereHas('course', fn ($query) => $query->where('user_id', $user->id))
            ->orderBy('title')
            ->get()
            ->map(fn (Reviewer $reviewer): array => $this->reviewerSummary($reviewer));

        return Inertia::render('reviewers/index', [
            'reviewers' => $reviewers,
        ]);
    }

    public function create(Course $course): Response
    {
        Gate::authorize('create', [Reviewer::class, $course]);

        return Inertia::render('reviewers/create', [
            'course' => $this->courseData($course),
            'lessonOptions' => $this->lessonOptions($course),
        ]);
    }

    public function store(StoreReviewerRequest $request, Course $course): RedirectResponse
    {
        $reviewer = $this->reviewers->create($course, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Reviewer created.')]);

        return to_route('reviewers.show', $reviewer);
    }

    public function show(Reviewer $reviewer): Response
    {
        Gate::authorize('view', $reviewer);

        $reviewer->load(['course', 'items', 'lessons.academicPeriod']);

        return Inertia::render('reviewers/show', [
            'reviewer' => $this->reviewerDetail($reviewer),
        ]);
    }

    public function edit(Reviewer $reviewer): Response
    {
        Gate::authorize('update', $reviewer);

        $reviewer->load(['course', 'items', 'lessons']);

        return Inertia::render('reviewers/edit', [
            'reviewer' => $this->reviewerDetail($reviewer),
            'course' => $this->courseData($reviewer->course),
            'lessonOptions' => $this->lessonOptions($reviewer->course),
        ]);
    }

    public function update(UpdateReviewerRequest $request, Reviewer $reviewer): RedirectResponse
    {
        $this->reviewers->update($reviewer, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Reviewer updated.')]);

        return to_route('reviewers.show', $reviewer);
    }

    public function destroy(Reviewer $reviewer): RedirectResponse
    {
        Gate::authorize('delete', $reviewer);

        $this->reviewers->delete($reviewer);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Reviewer deleted.')]);

        return to_route('reviewers.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function reviewerSummary(Reviewer $reviewer): array
    {
        return [
            'id' => $reviewer->id,
            'title' => $reviewer->title,
            'description' => $reviewer->description,
            'items_count' => $reviewer->items_count ?? $reviewer->items()->count(),
            'lessons_count' => $reviewer->lessons_count ?? $reviewer->lessons()->count(),
            'course' => [
                'id' => $reviewer->course->id,
                'subject_code' => $reviewer->course->subject_code,
                'subject_name' => $reviewer->course->subject_name,
            ],
            'created_at' => $reviewer->created_at?->toISOString(),
            'updated_at' => $reviewer->updated_at?->toISOString(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function reviewerDetail(Reviewer $reviewer): array
    {
        return [
            ...$this->reviewerSummary($reviewer),
            'items_count' => $reviewer->items->count(),
            'lessons_count' => $reviewer->lessons->count(),
            'lesson_ids' => $reviewer->lessons->pluck('id')->all(),
            'items' => $reviewer->items
                ->map(fn (ReviewerItem $item): array => [
                    'id' => $item->id,
                    'term' => $item->term,
                    'definition' => $item->definition,
                    'position' => $item->position,
                ])
                ->all(),
            'lessons' => $reviewer->lessons
                ->map(fn (Lesson $lesson): array => [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                    'academic_period_name' => $lesson->academicPeriod?->name,
                ])
                ->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function courseData(Course $course): array
    {
        return [
            'id' => $course->id,
            'subject_code' => $course->subject_code,
            'subject_name' => $course->subject_name,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function lessonOptions(Course $course): array
    {
        return $course->lessons()
            ->with('academicPeriod:id,name,sort_order')
            ->orderBy('title')
            ->get()
            ->map(fn (Lesson $lesson): array => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'academic_period_name' => $lesson->academicPeriod?->name,
            ])
            ->all();
    }
}
