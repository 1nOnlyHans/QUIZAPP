<?php

namespace Tests\Feature;

use App\Models\AcademicPeriod;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Reviewer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ReviewerManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_from_reviewers(): void
    {
        $this->get(route('reviewers.index'))->assertRedirect(route('login'));
    }

    public function test_students_can_create_a_reviewer_with_items_and_linked_lessons(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->for($user)->create();
        $lessonA = $this->lesson($course);
        $lessonB = $this->lesson($course);

        $this
            ->actingAs($user)
            ->post(route('courses.reviewers.store', $course), [
                'title' => 'Pointers Reviewer',
                'description' => 'Core terms',
                'lesson_ids' => [$lessonA->id, $lessonB->id],
                'items' => [
                    ['term' => 'Pointer', 'definition' => 'Stores a memory address'],
                    ['term' => 'Reference', 'definition' => 'An alias for a variable'],
                ],
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('reviewers.show', Reviewer::query()->firstOrFail()));

        $reviewer = Reviewer::query()->firstOrFail();

        $this->assertSame($course->id, $reviewer->course_id);
        $this->assertSame('Pointers Reviewer', $reviewer->title);
        $this->assertEqualsCanonicalizing(
            [$lessonA->id, $lessonB->id],
            $reviewer->lessons()->pluck('lessons.id')->all(),
        );

        $items = $reviewer->items()->get();
        $this->assertCount(2, $items);
        $this->assertSame('Pointer', $items[0]->term);
        $this->assertSame(0, $items[0]->position);
        $this->assertSame('Reference', $items[1]->term);
        $this->assertSame(1, $items[1]->position);
    }

    public function test_reviewer_validation_rejects_bad_input(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->for($user)->create();
        $otherCourseLesson = $this->lesson(Course::factory()->for($user)->create());

        $this
            ->actingAs($user)
            ->post(route('courses.reviewers.store', $course), [
                'title' => '',
                'items' => [],
            ])
            ->assertSessionHasErrors(['title', 'items']);

        $this
            ->actingAs($user)
            ->post(route('courses.reviewers.store', $course), [
                'title' => 'Missing definitions',
                'items' => [
                    ['term' => 'Only term', 'definition' => ''],
                    ['term' => '', 'definition' => 'Only definition'],
                ],
            ])
            ->assertSessionHasErrors(['items.0.definition', 'items.1.term']);

        $this
            ->actingAs($user)
            ->post(route('courses.reviewers.store', $course), [
                'title' => 'Cross-course lesson',
                'lesson_ids' => [$otherCourseLesson->id],
                'items' => [
                    ['term' => 'Term', 'definition' => 'Definition'],
                ],
            ])
            ->assertSessionHasErrors('lesson_ids.0');
    }

    public function test_updating_a_reviewer_replaces_items_and_resyncs_lessons(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->for($user)->create();
        $lessonA = $this->lesson($course);
        $lessonB = $this->lesson($course);

        $reviewer = Reviewer::factory()->for($course)->create();
        $reviewer->lessons()->sync([$lessonA->id]);
        $reviewer->items()->createMany([
            ['term' => 'Old term', 'definition' => 'Old definition', 'position' => 0],
        ]);

        $this
            ->actingAs($user)
            ->patch(route('reviewers.update', $reviewer), [
                'title' => 'Updated title',
                'lesson_ids' => [$lessonB->id],
                'items' => [
                    ['term' => 'New term', 'definition' => 'New definition'],
                ],
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('reviewers.show', $reviewer));

        $reviewer->refresh();

        $this->assertSame('Updated title', $reviewer->title);
        $this->assertSame([$lessonB->id], $reviewer->lessons()->pluck('lessons.id')->all());

        $items = $reviewer->items()->get();
        $this->assertCount(1, $items);
        $this->assertSame('New term', $items[0]->term);
    }

    public function test_deleting_a_reviewer_cascades_items_and_pivot(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->for($user)->create();
        $lesson = $this->lesson($course);

        $reviewer = Reviewer::factory()->for($course)->create();
        $reviewer->lessons()->sync([$lesson->id]);
        $reviewer->items()->createMany([
            ['term' => 'Term', 'definition' => 'Definition', 'position' => 0],
        ]);
        $reviewerId = $reviewer->id;

        $this
            ->actingAs($user)
            ->delete(route('reviewers.destroy', $reviewer))
            ->assertRedirect(route('reviewers.index'));

        $this->assertNull($reviewer->fresh());
        $this->assertDatabaseMissing('reviewer_items', ['reviewer_id' => $reviewerId]);
        $this->assertDatabaseMissing('lesson_reviewer', ['reviewer_id' => $reviewerId]);
    }

    public function test_students_cannot_manage_reviewers_they_do_not_own(): void
    {
        $owner = User::factory()->create();
        $student = User::factory()->create();
        $course = Course::factory()->for($owner)->create();
        $reviewer = Reviewer::factory()->for($course)->create();

        $this
            ->actingAs($student)
            ->post(route('courses.reviewers.store', $course), [
                'title' => 'Unauthorized',
                'items' => [['term' => 'Term', 'definition' => 'Definition']],
            ])
            ->assertForbidden();

        $this->actingAs($student)->get(route('reviewers.show', $reviewer))->assertForbidden();
        $this->actingAs($student)->get(route('reviewers.edit', $reviewer))->assertForbidden();
        $this
            ->actingAs($student)
            ->patch(route('reviewers.update', $reviewer), [
                'title' => 'Hijack',
                'items' => [['term' => 'Term', 'definition' => 'Definition']],
            ])
            ->assertForbidden();
        $this->actingAs($student)->delete(route('reviewers.destroy', $reviewer))->assertForbidden();

        $this->assertNotNull($reviewer->fresh());
    }

    public function test_index_only_lists_reviewers_for_the_authenticated_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        Reviewer::factory()->for(Course::factory()->for($user))->create(['title' => 'Mine']);
        Reviewer::factory()->for(Course::factory()->for($otherUser))->create(['title' => 'Theirs']);

        $this
            ->actingAs($user)
            ->get(route('reviewers.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('reviewers/index')
                ->has('reviewers', 1)
                ->where('reviewers.0.title', 'Mine'));
    }

    private function lesson(Course $course): Lesson
    {
        return Lesson::factory()
            ->for($course)
            ->create(['academic_period_id' => $this->period()->id]);
    }

    private function period(): AcademicPeriod
    {
        return AcademicPeriod::query()->ordered()->firstOrFail();
    }
}
