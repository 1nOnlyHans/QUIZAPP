<?php

namespace App\Enums;

enum QuizType: string
{
    case MultipleChoice = 'multiple_choice';
    case Identification = 'identification';
    case Enumeration = 'enumeration';

    public function label(): string
    {
        return match ($this) {
            self::MultipleChoice => 'Multiple choice',
            self::Identification => 'Identification',
            self::Enumeration => 'Enumeration',
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
