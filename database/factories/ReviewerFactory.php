<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Reviewer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Reviewer>
 */
class ReviewerFactory extends Factory
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
            'title' => fake()->sentence(3),
            'description' => fake()->optional()->sentence(),
        ];
    }
}
