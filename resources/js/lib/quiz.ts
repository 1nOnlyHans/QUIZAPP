import type {
    EnumerationQuestion,
    EnumerationScore,
    IdentificationQuestion,
    MultipleChoiceQuestion,
    QuizItem,
} from '@/types';

const MAX_MULTIPLE_CHOICE_OPTIONS = 4;

export function shuffle<T>(items: T[]): T[] {
    const result = [...items];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

export function normalize(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function pickDefinition(item: QuizItem): string {
    return shuffle(item.definitions)[0] ?? '';
}

export function buildMultipleChoiceQuestions(
    items: QuizItem[],
    count: number,
): MultipleChoiceQuestion[] {
    const selected = shuffle(items).slice(0, count);

    return selected.map((item) => {
        const correctDefinition = pickDefinition(item);

        const distractorPool = shuffle(
            items
                .filter((other) => other.id !== item.id)
                .flatMap((other) => other.definitions)
                .filter(
                    (definition, index, all) =>
                        all.indexOf(definition) === index,
                ),
        ).slice(0, MAX_MULTIPLE_CHOICE_OPTIONS - 1);

        const options = shuffle([correctDefinition, ...distractorPool]);

        return {
            itemId: item.id,
            prompt: item.term,
            options,
            correctIndex: options.indexOf(correctDefinition),
        };
    });
}

export function buildIdentificationQuestions(
    items: QuizItem[],
    count: number,
): IdentificationQuestion[] {
    return shuffle(items)
        .slice(0, count)
        .map((item) => ({
            itemId: item.id,
            prompt: pickDefinition(item),
            answer: item.term,
        }));
}

export function buildEnumerationQuestions(
    reviewerTitle: string,
    items: QuizItem[],
): EnumerationQuestion[] {
    const groupKeys = items.map((item) => item.group?.trim() || null);
    const isGrouped = groupKeys.some((key) => key !== null);

    if (!isGrouped) {
        return [
            {
                group: null,
                prompt: reviewerTitle,
                expectedTerms: items.map((item) => item.term),
            },
        ];
    }

    const groups = new Map<string, string[]>();

    items.forEach((item, index) => {
        const key = groupKeys[index] ?? 'Ungrouped';
        const existing = groups.get(key) ?? [];
        existing.push(item.term);
        groups.set(key, existing);
    });

    return Array.from(groups.entries()).map(([group, expectedTerms]) => ({
        group,
        prompt: group,
        expectedTerms,
    }));
}

export function scoreEnumeration(
    expectedTerms: string[],
    submitted: string[],
): EnumerationScore {
    const normalizedSubmitted = submitted
        .map((value) => value.trim())
        .filter((value) => value.length > 0);

    const matched: string[] = [];
    const missed: string[] = [];

    for (const term of expectedTerms) {
        const isMatched = normalizedSubmitted.some(
            (value) => normalize(value) === normalize(term),
        );

        (isMatched ? matched : missed).push(term);
    }

    const extra = normalizedSubmitted.filter(
        (value) =>
            !expectedTerms.some((term) => normalize(term) === normalize(value)),
    );

    return { matched, missed, extra };
}
