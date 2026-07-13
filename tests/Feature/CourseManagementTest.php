<?php

namespace Tests\Feature;

use App\Enums\CourseCategory;
use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_from_course_pages(): void
    {
        $course = Course::factory()->create();

        $this->get(route('courses.index'))->assertRedirect(route('login'));
        $this->get(route('courses.create'))->assertRedirect(route('login'));
        $this->get(route('courses.show', $course))->assertRedirect(route('login'));
    }

    public function test_students_can_create_update_and_delete_their_own_courses(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post(route('courses.store'), [
                'subject_code' => 'cs101',
                'subject_name' => 'Computer Programming',
                'category' => CourseCategory::Major->value,
            ]);

        $course = Course::query()->where('subject_code', 'CS101')->firstOrFail();

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('courses.show', $course));

        $this->assertSame($user->id, $course->user_id);
        $this->assertSame('Computer Programming', $course->subject_name);

        $this
            ->actingAs($user)
            ->patch(route('courses.update', $course), [
                'subject_code' => 'IT204',
                'subject_name' => 'Systems Analysis',
                'category' => CourseCategory::Minor->value,
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('courses.show', $course));

        $course->refresh();

        $this->assertSame('IT204', $course->subject_code);
        $this->assertSame(CourseCategory::Minor, $course->category);

        $this
            ->actingAs($user)
            ->delete(route('courses.destroy', $course))
            ->assertRedirect(route('courses.index'));

        $this->assertNull($course->fresh());
    }

    public function test_course_fields_are_required_and_subject_code_is_unique_per_student(): void
    {
        $user = User::factory()->create();
        Course::factory()->for($user)->create(['subject_code' => 'CS101']);

        $this
            ->actingAs($user)
            ->post(route('courses.store'), [
                'subject_code' => '',
                'subject_name' => '',
                'category' => 'elective',
            ])
            ->assertSessionHasErrors(['subject_code', 'subject_name', 'category']);

        $this
            ->actingAs($user)
            ->post(route('courses.store'), [
                'subject_code' => 'cs101',
                'subject_name' => 'Duplicate Code',
                'category' => CourseCategory::Major->value,
            ])
            ->assertSessionHasErrors('subject_code');

        $anotherUser = User::factory()->create();

        $this
            ->actingAs($anotherUser)
            ->post(route('courses.store'), [
                'subject_code' => 'cs101',
                'subject_name' => 'Allowed for Another Student',
                'category' => CourseCategory::Major->value,
            ])
            ->assertSessionHasNoErrors();
    }

    public function test_students_cannot_access_or_manage_another_students_courses(): void
    {
        $owner = User::factory()->create();
        $student = User::factory()->create();
        $course = Course::factory()->for($owner)->create();

        $this->actingAs($student)->get(route('courses.show', $course))->assertForbidden();
        $this->actingAs($student)->get(route('courses.edit', $course))->assertForbidden();
        $this
            ->actingAs($student)
            ->patch(route('courses.update', $course), [
                'subject_code' => 'CS303',
                'subject_name' => 'Unauthorized Update',
                'category' => CourseCategory::Major->value,
            ])
            ->assertForbidden();
        $this->actingAs($student)->delete(route('courses.destroy', $course))->assertForbidden();

        $this->assertNotNull($course->fresh());
    }
}
