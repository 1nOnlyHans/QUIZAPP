<?php

namespace App\Enums;

enum CourseCategory: string
{
    case Major = 'major';
    case Minor = 'minor';

    public function label(): string
    {
        return match ($this) {
            self::Major => 'Major',
            self::Minor => 'Minor',
        };
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $category): array => [
                'value' => $category->value,
                'label' => $category->label(),
            ],
            self::cases(),
        );
    }
}
