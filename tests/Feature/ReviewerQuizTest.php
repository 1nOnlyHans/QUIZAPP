<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Reviewer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ReviewerQuizTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_from_quiz_routes(): void
    {
        $reviewer = Reviewer::factory()->for(Course::factory())->create();

        $this->get(route('reviewers.quiz.create', $reviewer))->assertRedirect(route('login'));
        $this->get(route('reviewers.quiz.show', $reviewer))->assertRedirect(route('login'));
    }

    public function test_quiz_create_renders_item_count_and_type_options(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->for($user)->create();
        $reviewer = Reviewer::factory()->for($course)->create();
        $reviewer->items()->createMany([
            ['term' => 'Alpha', 'definition' => 'First', 'position' => 0],
            ['term' => 'Beta', 'definition' => 'Second', 'position' => 1],
            ['term' => 'Gamma', 'definition' => 'Third', 'position' => 2],
        ]);

        $this
            ->actingAs($user)
            ->get(route('reviewers.quiz.create', $reviewer))
            ->assertInertia(fn (Assert $page) => $page
                ->component('reviewers/quiz/create')
                ->where('reviewer.items_count', 3)
                ->has('typeOptions', 3));
    }

    public function test_quiz_show_defaults_to_multiple_choice_with_all_items(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->for($user)->create();
        $reviewer = Reviewer::factory()->for($course)->create();
        $reviewer->items()->createMany([
            ['term' => 'Alpha', 'definition' => 'First', 'position' => 0],
            ['term' => 'Beta', 'definition' => 'Second', 'position' => 1],
        ]);

        $this
            ->actingAs($user)
            ->get(route('reviewers.quiz.show', $reviewer))
            ->assertInertia(fn (Assert $page) => $page
                ->component('reviewers/quiz/show')
                ->where('type', 'multiple_choice')
                ->where('count', 2)
                ->has('reviewer.items', 2));
    }

    public function test_quiz_show_clamps_count_query_param(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->for($user)->create();
        $reviewer = Reviewer::factory()->for($course)->create();
        $reviewer->items()->createMany([
            ['term' => 'Alpha', 'definition' => 'First', 'position' => 0],
            ['term' => 'Beta', 'definition' => 'Second', 'position' => 1],
        ]);

        $this
            ->actingAs($user)
            ->get(route('reviewers.quiz.show', $reviewer).'?type=identification&count=999')
            ->assertInertia(fn (Assert $page) => $page
                ->where('type', 'identification')
                ->where('count', 2));

        $this
            ->actingAs($user)
            ->get(route('reviewers.quiz.show', $reviewer).'?count=0')
            ->assertInertia(fn (Assert $page) => $page
                ->where('count', 1));
    }

    public function test_quiz_show_returns_not_found_when_reviewer_has_no_items(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->for($user)->create();
        $reviewer = Reviewer::factory()->for($course)->create();

        $this
            ->actingAs($user)
            ->get(route('reviewers.quiz.show', $reviewer))
            ->assertNotFound();
    }

    public function test_students_cannot_access_quiz_routes_for_reviewers_they_do_not_own(): void
    {
        $owner = User::factory()->create();
        $student = User::factory()->create();
        $course = Course::factory()->for($owner)->create();
        $reviewer = Reviewer::factory()->for($course)->create();
        $reviewer->items()->create(['term' => 'Alpha', 'definition' => 'First', 'position' => 0]);

        $this->actingAs($student)->get(route('reviewers.quiz.create', $reviewer))->assertForbidden();
        $this->actingAs($student)->get(route('reviewers.quiz.show', $reviewer))->assertForbidden();
    }
}
