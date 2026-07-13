<?php

namespace Database\Factories;

use App\Enums\CourseCategory;
use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Course>
 */
class CourseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'subject_code' => strtoupper(fake()->bothify('??###')),
            'subject_name' => fake()->words(3, true),
            'category' => fake()->randomElement(CourseCategory::cases())->value,
        ];
    }
}
