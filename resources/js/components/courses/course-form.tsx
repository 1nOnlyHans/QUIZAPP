import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    index as coursesIndex,
    show as showCourse,
    store as storeCourse,
    update as updateCourse,
} from '@/routes/courses';
import type { CourseCategory, CourseSummary, SelectOption } from '@/types';

type CourseFormData = {
    subject_code: string;
    subject_name: string;
    category: CourseCategory | '';
    [key: string]: string;
};

type CourseFormProps = {
    categoryOptions: SelectOption<CourseCategory>[];
    course?: CourseSummary;
};

export default function CourseForm({
    categoryOptions,
    course,
}: CourseFormProps) {
    const form = useForm<CourseFormData>({
        subject_code: course?.subject_code ?? '',
        subject_name: course?.subject_name ?? '',
        category: course?.category ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (course) {
            form.patch(updateCourse.url(course.id), {
                preserveScroll: true,
            });

            return;
        }

        form.post(storeCourse.url(), {
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={submit} className="max-w-2xl space-y-6">
            <div className="grid gap-2">
                <Label htmlFor="subject_code">Subject code</Label>
                <Input
                    id="subject_code"
                    value={form.data.subject_code}
                    onChange={(event) =>
                        form.setData(
                            'subject_code',
                            event.target.value.toUpperCase(),
                        )
                    }
                    required
                    maxLength={30}
                    placeholder="CS101"
                    aria-invalid={!!form.errors.subject_code}
                />
                <InputError message={form.errors.subject_code} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="subject_name">Subject name</Label>
                <Input
                    id="subject_name"
                    value={form.data.subject_name}
                    onChange={(event) =>
                        form.setData('subject_name', event.target.value)
                    }
                    required
                    placeholder="Introduction to Computing"
                    aria-invalid={!!form.errors.subject_name}
                />
                <InputError message={form.errors.subject_name} />
            </div>

            <div className="grid gap-2">
                <Label>Subject category</Label>
                <Select
                    value={form.data.category}
                    onValueChange={(value) =>
                        form.setData('category', value as CourseCategory)
                    }
                >
                    <SelectTrigger
                        className="w-full"
                        aria-invalid={!!form.errors.category}
                    >
                        <SelectValue placeholder="Choose category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={form.errors.category} />
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <Button disabled={form.processing}>
                    {course ? 'Save changes' : 'Create course'}
                </Button>
                <Button asChild variant="outline">
                    <Link href={course ? showCourse(course.id) : coursesIndex()}>
                        Cancel
                    </Link>
                </Button>
            </div>
        </form>
    );
}
