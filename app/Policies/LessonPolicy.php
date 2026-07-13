<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\User;

class LessonPolicy
{
    public function create(User $user, Course $course): bool
    {
        return $course->user_id === $user->id;
    }

    public function view(User $user, Lesson $lesson): bool
    {
        return $lesson->course()->where('user_id', $user->id)->exists();
    }

    public function update(User $user, Lesson $lesson): bool
    {
        return $this->view($user, $lesson);
    }

    public function delete(User $user, Lesson $lesson): bool
    {
        return $this->view($user, $lesson);
    }
}
