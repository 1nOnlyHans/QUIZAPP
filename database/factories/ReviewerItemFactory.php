<?php

namespace Database\Factories;

use App\Models\Reviewer;
use App\Models\ReviewerItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ReviewerItem>
 */
class ReviewerItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reviewer_id' => Reviewer::factory(),
            'term' => fake()->unique()->word(),
            'definition' => fake()->sentence(),
            'position' => 0,
        ];
    }
}
