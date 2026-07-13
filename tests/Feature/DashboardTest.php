<?php

namespace Tests\Feature;

use App\Enums\CourseCategory;
use App\Enums\LessonMaterialType;
use App\Models\AcademicPeriod;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page(): void
    {
        $response = $this->get(route('dashboard'));

        $response->assertRedirect(route('login'));
    }

    public function test_empty_dashboard_has_zero_counts_and_periods(): void
    {
        $user = User::factory()->create();

        $this
            ->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->where('overview.totals.courses_count', 0)
                ->where('overview.totals.lessons_count', 0)
                ->where('overview.totals.file_lessons_count', 0)
                ->where('overview.totals.link_lessons_count', 0)
                ->has('overview.period_stats', 5)
                ->where('overview.period_stats.0.name', 'All')
                ->where('overview.period_stats.0.lessons_count', 0)
                ->has('overview.recent_courses', 0)
                ->has('overview.recent_lessons', 0));
    }

    public function test_dashboard_metrics_are_scoped_to_authenticated_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $prelims = $this->period('prelims');
        $midterm = $this->period('midterm');
        $finals = $this->period('finals');
        $all = $this->period('all');

        $olderCourse = Course::factory()
            ->for($user)
            ->create([
                'subject_code' => 'OLD101',
                'subject_name' => 'Older Course',
                'category' => CourseCategory::Major->value,
                'updated_at' => now()->subDays(2),
            ]);

        $newerCourse = Course::factory()
            ->for($user)
            ->create([
                'subject_code' => 'NEW101',
                'subject_name' => 'Newer Course',
                'category' => CourseCategory::Minor->value,
                'updated_at' => now()->subHour(),
            ]);

        Lesson::factory()
            ->for($olderCourse)
            ->file()
            ->create([
                'title' => 'Prelims File',
                'academic_period_id' => $prelims->id,
                'created_at' => now()->subHours(3),
            ]);

        Lesson::factory()
            ->for($olderCourse)
            ->create([
                'title' => 'Finals Link',
                'academic_period_id' => $finals->id,
                'material_type' => LessonMaterialType::Link->value,
                'created_at' => now()->subHours(2),
            ]);

        Lesson::factory()
            ->for($newerCourse)
            ->create([
                'title' => 'Latest Lesson',
                'academic_period_id' => $midterm->id,
                'material_type' => LessonMaterialType::Link->value,
                'created_at' => now()->subMinutes(15),
            ]);

        $otherCourse = Course::factory()
            ->for($otherUser)
            ->create(['subject_code' => 'OTHER101']);

        Lesson::factory()
            ->for($otherCourse)
            ->file()
            ->create([
                'title' => 'Other User Lesson',
                'academic_period_id' => $all->id,
                'created_at' => now(),
            ]);

        $this
            ->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->where('overview.totals.courses_count', 2)
                ->where('overview.totals.lessons_count', 3)
                ->where('overview.totals.file_lessons_count', 1)
                ->where('overview.totals.link_lessons_count', 2)
                ->has('overview.period_stats', 5)
                ->where('overview.period_stats.0.slug', 'all')
                ->where('overview.period_stats.0.lessons_count', 0)
                ->where('overview.period_stats.1.slug', 'prelims')
                ->where('overview.period_stats.1.lessons_count', 1)
                ->where('overview.period_stats.2.slug', 'midterm')
                ->where('overview.period_stats.2.lessons_count', 1)
                ->where('overview.period_stats.3.slug', 'pre-finals')
                ->where('overview.period_stats.3.lessons_count', 0)
                ->where('overview.period_stats.4.slug', 'finals')
                ->where('overview.period_stats.4.lessons_count', 1)
                ->has('overview.recent_courses', 2)
                ->where('overview.recent_courses.0.subject_code', 'NEW101')
                ->where('overview.recent_courses.1.subject_code', 'OLD101')
                ->has('overview.recent_lessons', 3)
                ->where('overview.recent_lessons.0.title', 'Latest Lesson')
                ->where('overview.recent_lessons.0.course.subject_code', 'NEW101'));
    }

    public function test_recent_courses_and_lessons_are_ordered_and_limited(): void
    {
        $user = User::factory()->create();
        $period = $this->period('all');

        for ($index = 1; $index <= 6; $index++) {
            $course = Course::factory()
                ->for($user)
                ->create([
                    'subject_code' => "C{$index}",
                    'updated_at' => now()->addMinutes($index),
                ]);

            Lesson::factory()
                ->for($course)
                ->create([
                    'title' => "Lesson {$index}",
                    'academic_period_id' => $period->id,
                    'created_at' => now()->addMinutes($index),
                ]);
        }

        $this
            ->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->has('overview.recent_courses', 5)
                ->where('overview.recent_courses.0.subject_code', 'C6')
                ->where('overview.recent_courses.4.subject_code', 'C2')
                ->has('overview.recent_lessons', 5)
                ->where('overview.recent_lessons.0.title', 'Lesson 6')
                ->where('overview.recent_lessons.4.title', 'Lesson 2'));
    }

    private function period(string $slug): AcademicPeriod
    {
        return AcademicPeriod::query()->where('slug', $slug)->firstOrFail();
    }
}
