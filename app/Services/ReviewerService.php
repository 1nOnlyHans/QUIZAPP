<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Reviewer;
use Illuminate\Support\Facades\DB;

class ReviewerService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function create(Course $course, array $data): Reviewer
    {
        return DB::transaction(function () use ($course, $data): Reviewer {
            $reviewer = $course->reviewers()->create([
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
            ]);

            $reviewer->lessons()->sync($this->lessonIds($data));
            $this->replaceItems($reviewer, $data);

            return $reviewer;
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Reviewer $reviewer, array $data): Reviewer
    {
        return DB::transaction(function () use ($reviewer, $data): Reviewer {
            $reviewer->update([
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
            ]);

            $reviewer->lessons()->sync($this->lessonIds($data));
            $this->replaceItems($reviewer, $data);

            return $reviewer->refresh();
        });
    }

    public function delete(Reviewer $reviewer): void
    {
        $reviewer->delete();
    }

    /**
     * @param  array<string, mixed>  $data
     * @return list<int>
     */
    private function lessonIds(array $data): array
    {
        return array_values(array_map(
            static fn (mixed $id): int => (int) $id,
            $data['lesson_ids'] ?? [],
        ));
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function replaceItems(Reviewer $reviewer, array $data): void
    {
        $reviewer->items()->delete();

        foreach (array_values($data['items'] ?? []) as $position => $itemData) {
            $item = $reviewer->items()->create([
                'term' => (string) $itemData['term'],
                'group_name' => filled($itemData['group'] ?? null)
                    ? trim((string) $itemData['group'])
                    : null,
                'position' => $position,
            ]);

            $definitions = array_values(array_filter(
                array_map(
                    static fn (mixed $definition): string => trim((string) $definition),
                    $itemData['definitions'] ?? [],
                ),
                static fn (string $definition): bool => $definition !== '',
            ));

            $item->definitions()->createMany(array_map(
                static fn (string $definition, int $definitionPosition): array => [
                    'definition' => $definition,
                    'position' => $definitionPosition,
                ],
                $definitions,
                array_keys($definitions),
            ));
        }
    }
}
