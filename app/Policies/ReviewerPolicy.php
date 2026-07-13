<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\Reviewer;
use App\Models\User;

class ReviewerPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function create(User $user, Course $course): bool
    {
        return $course->user_id === $user->id;
    }

    public function view(User $user, Reviewer $reviewer): bool
    {
        return $reviewer->course()->where('user_id', $user->id)->exists();
    }

    public function update(User $user, Reviewer $reviewer): bool
    {
        return $this->view($user, $reviewer);
    }

    public function delete(User $user, Reviewer $reviewer): bool
    {
        return $this->view($user, $reviewer);
    }
}
