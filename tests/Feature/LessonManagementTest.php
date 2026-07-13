<?php

namespace Tests\Feature;

use App\Enums\LessonMaterialType;
use App\Models\AcademicPeriod;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LessonManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_students_can_create_link_lessons_grouped_by_academic_period(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->for($user)->create();
        $period = $this->period('prelims');

        $this
            ->actingAs($user)
            ->post(route('courses.lessons.store', $course), [
                'title' => 'Pointers Reviewer',
                'description' => 'Core terms and examples',
                'academic_period_id' => $period->id,
                'material_type' => LessonMaterialType::Link->value,
                'external_url' => 'https://example.com/pointers',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('courses.show', $course));

        $lesson = Lesson::query()->firstOrFail();

        $this->assertSame($course->id, $lesson->course_id);
        $this->assertSame($period->id, $lesson->academic_period_id);
        $this->assertSame(LessonMaterialType::Link, $lesson->material_type);

        $this
            ->actingAs($user)
            ->get(route('courses.show', $course))
            ->assertInertia(fn (Assert $page) => $page
                ->component('courses/show')
                ->has('periods', 5)
                ->has('lessons', 1)
                ->where('lessons.0.academic_period_slug', 'prelims')
                ->where('lessons.0.title', 'Pointers Reviewer'));
    }

    public function test_lesson_requires_exactly_one_material_source(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->for($user)->create();
        $period = $this->period('midterm');

        $this
            ->actingAs($user)
            ->post(route('courses.lessons.store', $course), [
                'title' => 'Missing Material',
                'academic_period_id' => $period->id,
                'material_type' => LessonMaterialType::Link->value,
            ])
            ->assertSessionHasErrors('external_url');

        $this
            ->actingAs($user)
            ->post(route('courses.lessons.store', $course), [
                'title' => 'Conflicting Material',
                'academic_period_id' => $period->id,
                'material_type' => LessonMaterialType::Link->value,
                'external_url' => 'https://example.com/lesson',
                'material_file' => UploadedFile::fake()->create('lesson.pdf', 64, 'application/pdf'),
            ])
            ->assertSessionHasErrors('material_file');

        $this
            ->actingAs($user)
            ->post(route('courses.lessons.store', $course), [
                'title' => 'Missing File',
                'academic_period_id' => $period->id,
                'material_type' => LessonMaterialType::File->value,
            ])
            ->assertSessionHasErrors('material_file');
    }

    public function test_students_cannot_attach_or_manage_lessons_for_other_students_courses(): void
    {
        $owner = User::factory()->create();
        $student = User::factory()->create();
        $course = Course::factory()->for($owner)->create();
        $period = $this->period('finals');
        $lesson = Lesson::factory()
            ->for($course)
            ->create(['academic_period_id' => $period->id]);

        $this
            ->actingAs($student)
            ->post(route('courses.lessons.store', $course), [
                'title' => 'Unauthorized',
                'academic_period_id' => $period->id,
                'material_type' => LessonMaterialType::Link->value,
                'external_url' => 'https://example.com/unauthorized',
            ])
            ->assertForbidden();

        $this
            ->actingAs($student)
            ->patch(route('courses.lessons.update', [$course, $lesson]), [
                'title' => 'Unauthorized Update',
                'academic_period_id' => $period->id,
                'material_type' => LessonMaterialType::Link->value,
                'external_url' => 'https://example.com/unauthorized',
            ])
            ->assertForbidden();

        $this
            ->actingAs($student)
            ->delete(route('courses.lessons.destroy', [$course, $lesson]))
            ->assertForbidden();
    }

    public function test_uploaded_lessons_are_private_and_authorized_for_viewing_and_download(): void
    {
        Storage::fake('local');

        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $course = Course::factory()->for($user)->create();
        $period = $this->period('all');

        $this
            ->actingAs($user)
            ->post(route('courses.lessons.store', $course), [
                'title' => 'Syllabus',
                'academic_period_id' => $period->id,
                'material_type' => LessonMaterialType::File->value,
                'material_file' => UploadedFile::fake()->create('syllabus.pdf', 64, 'application/pdf'),
            ])
            ->assertSessionHasNoErrors();

        $lesson = Lesson::query()->firstOrFail();

        Storage::disk('local')->assertExists($lesson->file_path);

        $this
            ->actingAs($user)
            ->get(route('courses.lessons.view', [$course, $lesson]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('courses/lessons/view')
                ->where('lesson.title', 'Syllabus')
                ->where('viewer.type', 'pdf'));

        $inlineResponse = $this
            ->actingAs($user)
            ->get(route('courses.lessons.inline', [$course, $lesson]));

        $inlineResponse->assertOk();
        $this->assertStringContainsString(
            'inline',
            (string) $inlineResponse->headers->get('content-disposition'),
        );

        $this
            ->actingAs($user)
            ->get(route('courses.lessons.download', [$course, $lesson]))
            ->assertOk();

        $this
            ->actingAs($otherUser)
            ->get(route('courses.lessons.view', [$course, $lesson]))
            ->assertForbidden();

        $this
            ->actingAs($otherUser)
            ->get(route('courses.lessons.inline', [$course, $lesson]))
            ->assertForbidden();

        $this
            ->actingAs($otherUser)
            ->get(route('courses.lessons.download', [$course, $lesson]))
            ->assertForbidden();
    }

    public function test_deleting_a_course_deletes_lesson_files(): void
    {
        Storage::fake('local');

        $user = User::factory()->create();
        $course = Course::factory()->for($user)->create();
        $period = $this->period('all');

        $this
            ->actingAs($user)
            ->post(route('courses.lessons.store', $course), [
                'title' => 'Course Outline',
                'academic_period_id' => $period->id,
                'material_type' => LessonMaterialType::File->value,
                'material_file' => UploadedFile::fake()->create('outline.pdf', 64, 'application/pdf'),
            ])
            ->assertSessionHasNoErrors();

        $lesson = Lesson::query()->firstOrFail();
        $path = $lesson->file_path;

        Storage::disk('local')->assertExists($path);

        $this
            ->actingAs($user)
            ->delete(route('courses.destroy', $course))
            ->assertRedirect(route('courses.index'));

        Storage::disk('local')->assertMissing($path);
        $this->assertNull($lesson->fresh());
    }

    private function period(string $slug): AcademicPeriod
    {
        return AcademicPeriod::query()->where('slug', $slug)->firstOrFail();
    }
}
