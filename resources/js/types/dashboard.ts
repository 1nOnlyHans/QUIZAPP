import type { CourseCategory, LessonMaterialType } from '@/types/course';

export type DashboardTotals = {
    courses_count: number;
    lessons_count: number;
    file_lessons_count: number;
    link_lessons_count: number;
};

export type DashboardPeriodStat = {
    id: number;
    name: string;
    slug: string;
    lessons_count: number;
    percentage: number;
};

export type DashboardRecentCourse = {
    id: number;
    subject_code: string;
    subject_name: string;
    category: CourseCategory;
    category_label: string;
    lessons_count: number;
    updated_at: string | null;
};

export type DashboardRecentLesson = {
    id: number;
    title: string;
    material_type: LessonMaterialType;
    material_type_label: string;
    created_at: string | null;
    course: {
        id: number;
        subject_code: string;
        subject_name: string;
    };
    academic_period: {
        id: number;
        name: string;
        slug: string;
    };
};

export type DashboardOverview = {
    totals: DashboardTotals;
    period_stats: DashboardPeriodStat[];
    recent_courses: DashboardRecentCourse[];
    recent_lessons: DashboardRecentLesson[];
};
