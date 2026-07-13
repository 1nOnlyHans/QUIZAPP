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

export function buildMultipleChoiceQuestions(
    items: QuizItem[],
    count: number,
): MultipleChoiceQuestion[] {
    const selected = shuffle(items).slice(0, count);

    return selected.map((item) => {
        const distractorPool = shuffle(
            items
                .filter((other) => other.id !== item.id)
                .map((other) => other.definition)
                .filter(
                    (definition, index, all) =>
                        all.indexOf(definition) === index,
                ),
        ).slice(0, MAX_MULTIPLE_CHOICE_OPTIONS - 1);

        const options = shuffle([item.definition, ...distractorPool]);

        return {
            itemId: item.id,
            prompt: item.term,
            options,
            correctIndex: options.indexOf(item.definition),
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
            prompt: item.definition,
            answer: item.term,
        }));
}

export function buildEnumerationQuestion(
    reviewerTitle: string,
    items: QuizItem[],
): EnumerationQuestion {
    return {
        prompt: reviewerTitle,
        expectedTerms: items.map((item) => item.term),
    };
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
