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
            'group_name' => null,
            'position' => 0,
        ];
    }

    /**
     * Configure the model factory.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (ReviewerItem $item) {
            if ($item->definitions()->exists()) {
                return;
            }

            $item->definitions()->create([
                'definition' => fake()->sentence(),
                'position' => 0,
            ]);
        });
    }
}
