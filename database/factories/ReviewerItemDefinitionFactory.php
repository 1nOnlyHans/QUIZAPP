<?php

namespace Database\Factories;

use App\Models\ReviewerItem;
use App\Models\ReviewerItemDefinition;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ReviewerItemDefinition>
 */
class ReviewerItemDefinitionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reviewer_item_id' => ReviewerItem::factory(),
            'definition' => fake()->sentence(),
            'position' => 0,
        ];
    }
}
