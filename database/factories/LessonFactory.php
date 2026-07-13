<?php

namespace Database\Factories;

use App\Enums\LessonMaterialType;
use App\Models\AcademicPeriod;
use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Lesson>
 */
class LessonFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'course_id' => Course::factory(),
            'academic_period_id' => AcademicPeriod::query()->ordered()->value('id'),
            'title' => fake()->sentence(3),
            'description' => fake()->optional()->sentence(),
            'material_type' => LessonMaterialType::Link->value,
            'file_disk' => null,
            'file_path' => null,
            'file_name' => null,
            'file_mime_type' => null,
            'file_size' => null,
            'external_url' => fake()->url(),
        ];
    }

    public function file(): static
    {
        return $this->state(fn (): array => [
            'material_type' => LessonMaterialType::File->value,
            'file_disk' => 'local',
            'file_path' => 'lessons/test/material.pdf',
            'file_name' => 'material.pdf',
            'file_mime_type' => 'application/pdf',
            'file_size' => 128,
            'external_url' => null,
        ]);
    }
}
