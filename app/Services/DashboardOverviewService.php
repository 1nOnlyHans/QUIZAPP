<?php

namespace App\Services;

use App\Models\AcademicPeriod;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;

class DashboardOverviewService
{
    private const RECENT_LIMIT = 5;

    /**
     * @return array{
     *     totals: array{courses_count: int, lessons_count: int, file_lessons_count: int, link_lessons_count: int},
     *     period_stats: array<int, array{id: int, name: string, slug: string, lessons_count: int, percentage: int}>,
     *     recent_courses: array<int, array<string, mixed>>,
     *     recent_lessons: array<int, array<string, mixed>>
     * }
     */
    public function forUser(User $user): array
    {
        $lessonCountsByType = $this->lessonCountsByType($user);
        $lessonsCount = (int) $lessonCountsByType->sum();

        return [
            'totals' => [
                'courses_count' => Course::query()
                    ->where('user_id', $user->id)
                    ->count(),
                'lessons_count' => $lessonsCount,
                'file_lessons_count' => (int) ($lessonCountsByType->get('file') ?? 0),
                'link_lessons_count' => (int) ($lessonCountsByType->get('link') ?? 0),
            ],
            'period_stats' => $this->periodStats($user, $lessonsCount),
            'recent_courses' => $this->recentCourses($user),
            'recent_lessons' => $this->recentLessons($user),
        ];
    }

    /**
     * @return Collection<string, int>
     */
    private function lessonCountsByType(User $user): Collection
    {
        return Lesson::query()
            ->join('courses', 'lessons.course_id', '=', 'courses.id')
            ->where('courses.user_id', $user->id)
            ->select('lessons.material_type')
            ->selectRaw('count(*) as lessons_count')
            ->groupBy('lessons.material_type')
            ->pluck('lessons_count', 'lessons.material_type')
            ->map(fn (mixed $count): int => (int) $count);
    }

    /**
     * @return array<int, array{id: int, name: string, slug: string, lessons_count: int, percentage: int}>
     */
    private function periodStats(User $user, int $lessonsCount): array
    {
        $countsByPeriod = Lesson::query()
            ->join('courses', 'lessons.course_id', '=', 'courses.id')
            ->where('courses.user_id', $user->id)
            ->select('lessons.academic_period_id')
            ->selectRaw('count(*) as lessons_count')
            ->groupBy('lessons.academic_period_id')
            ->pluck('lessons_count', 'lessons.academic_period_id')
            ->map(fn (mixed $count): int => (int) $count);

        return AcademicPeriod::query()
            ->ordered()
            ->get()
            ->map(function (AcademicPeriod $period) use ($countsByPeriod, $lessonsCount): array {
                $count = (int) ($countsByPeriod->get($period->id) ?? 0);

                return [
                    'id' => $period->id,
                    'name' => $period->name,
                    'slug' => $period->slug,
                    'lessons_count' => $count,
                    'percentage' => $lessonsCount > 0
                        ? (int) round(($count / $lessonsCount) * 100)
                        : 0,
                ];
            })
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function recentCourses(User $user): array
    {
        return Course::query()
            ->where('user_id', $user->id)
            ->withCount('lessons')
            ->latest('updated_at')
            ->latest('id')
            ->limit(self::RECENT_LIMIT)
            ->get()
            ->map(fn (Course $course): array => [
                'id' => $course->id,
                'subject_code' => $course->subject_code,
                'subject_name' => $course->subject_name,
                'category' => $course->category->value,
                'category_label' => $course->category->label(),
                'lessons_count' => $course->lessons_count ?? 0,
                'updated_at' => $course->updated_at?->toISOString(),
            ])
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function recentLessons(User $user): array
    {
        /** @var EloquentCollection<int, Lesson> $lessons */
        $lessons = Lesson::query()
            ->with([
                'course:id,user_id,subject_code,subject_name',
                'academicPeriod:id,name,slug',
            ])
            ->whereHas('course', fn ($query) => $query->where('user_id', $user->id))
            ->latest('created_at')
            ->latest('id')
            ->limit(self::RECENT_LIMIT)
            ->get();

        return $lessons
            ->map(fn (Lesson $lesson): array => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'material_type' => $lesson->material_type->value,
                'material_type_label' => $lesson->material_type->label(),
                'created_at' => $lesson->created_at?->toISOString(),
                'course' => [
                    'id' => $lesson->course?->id,
                    'subject_code' => $lesson->course?->subject_code,
                    'subject_name' => $lesson->course?->subject_name,
                ],
                'academic_period' => [
                    'id' => $lesson->academicPeriod?->id,
                    'name' => $lesson->academicPeriod?->name,
                    'slug' => $lesson->academicPeriod?->slug,
                ],
            ])
            ->all();
    }
}
