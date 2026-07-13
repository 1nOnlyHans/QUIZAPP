export type SelectOption<TValue extends string = string> = {
    value: TValue;
    label: string;
};

export type CourseCategory = 'major' | 'minor';

export type LessonMaterialType = 'file' | 'link';

export type CourseSummary = {
    id: number;
    subject_code: string;
    subject_name: string;
    category: CourseCategory;
    category_label: string;
    lessons_count: number;
    created_at: string | null;
    updated_at: string | null;
};

export type AcademicPeriod = {
    id: number;
    name: string;
    slug: string;
    sort_order: number;
};

export type Lesson = {
    id: number;
    course_id: number;
    academic_period_id: number;
    academic_period_slug: string | null;
    academic_period_name: string | null;
    title: string;
    description: string | null;
    material_type: LessonMaterialType;
    material_type_label: string;
    file_name: string | null;
    file_mime_type: string | null;
    file_size: number | null;
    external_url: string | null;
    preview_url: string | null;
    download_url: string | null;
    created_at: string | null;
    updated_at: string | null;
};
