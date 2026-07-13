<?php

namespace App\Enums;

enum LessonMaterialType: string
{
    case File = 'file';
    case Link = 'link';

    public function label(): string
    {
        return match ($this) {
            self::File => 'File',
            self::Link => 'Link',
        };
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $type): array => [
                'value' => $type->value,
                'label' => $type->label(),
            ],
            self::cases(),
        );
    }
}
