export type ReviewerItem = {
    id?: number;
    term: string;
    definition: string;
    position: number;
};

export type ReviewerLessonOption = {
    id: number;
    title: string;
    academic_period_name: string | null;
};

export type ReviewerCourse = {
    id: number;
    subject_code: string;
    subject_name: string;
};

export type ReviewerSummary = {
    id: number;
    title: string;
    description: string | null;
    items_count: number;
    lessons_count: number;
    course: ReviewerCourse;
    created_at: string | null;
    updated_at: string | null;
};

export type ReviewerDetail = ReviewerSummary & {
    lesson_ids: number[];
    items: ReviewerItem[];
    lessons: ReviewerLessonOption[];
};
