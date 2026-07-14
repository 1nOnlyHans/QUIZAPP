export type QuizType = 'multiple_choice' | 'identification' | 'enumeration';

export type QuizItem = {
    id: number;
    term: string;
    definitions: string[];
    group: string | null;
};

export type MultipleChoiceQuestion = {
    itemId: number;
    prompt: string;
    options: string[];
    correctIndex: number;
};

export type IdentificationQuestion = {
    itemId: number;
    prompt: string;
    answer: string;
};

export type EnumerationQuestion = {
    group: string | null;
    prompt: string;
    expectedTerms: string[];
};

export type EnumerationScore = {
    matched: string[];
    missed: string[];
    extra: string[];
};
