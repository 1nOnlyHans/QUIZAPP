export type QuizType = 'multiple_choice' | 'identification' | 'enumeration';

export type QuizItem = {
    id: number;
    term: string;
    definition: string;
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
    prompt: string;
    expectedTerms: string[];
};

export type EnumerationScore = {
    matched: string[];
    missed: string[];
    extra: string[];
};
