<?php

namespace App\Services;

use App\Models\Course;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CourseService
{
    public function __construct(
        private readonly LessonService $lessons,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(User $user, array $data): Course
    {
        return $user->courses()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Course $course, array $data): Course
    {
        $course->update($data);

        return $course->refresh();
    }

    public function delete(Course $course): void
    {
        DB::transaction(function () use ($course): void {
            $course->lessons()->get()->each(
                fn ($lesson) => $this->lessons->deleteStoredFile($lesson),
            );

            $course->delete();
        });
    }
}
