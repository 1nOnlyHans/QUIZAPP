import { useForm } from '@inertiajs/react';
import { FileText, LinkIcon, Plus, SquarePen } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
    store as storeLesson,
    update as updateLesson,
} from '@/routes/courses/lessons';
import type {
    AcademicPeriod,
    CourseSummary,
    Lesson,
    LessonMaterialType,
    SelectOption,
} from '@/types';

type LessonFormData = {
    title: string;
    description: string;
    academic_period_id: string;
    material_type: LessonMaterialType;
    material_file: File | null;
    external_url: string;
    [key: string]: string | File | null;
};

type LessonFormDialogProps = {
    course: CourseSummary;
    periods: AcademicPeriod[];
    materialTypeOptions: SelectOption<LessonMaterialType>[];
    lesson?: Lesson;
};

export default function LessonFormDialog({
    course,
    periods,
    materialTypeOptions,
    lesson,
}: LessonFormDialogProps) {
    const [open, setOpen] = useState(false);
    const defaultPeriod = periods[0]?.id.toString() ?? '';
    const isEditing = lesson !== undefined;
    const form = useForm<LessonFormData>({
        title: lesson?.title ?? '',
        description: lesson?.description ?? '',
        academic_period_id:
            lesson?.academic_period_id.toString() ?? defaultPeriod,
        material_type: lesson?.material_type ?? 'file',
        material_file: null,
        external_url: lesson?.external_url ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (lesson) {
            const target = updateLesson
                .form({
                    course: course.id,
                    lesson: lesson.id,
                });

            form.post(target.action, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => setOpen(false),
            });

            return;
        }

        form.post(storeLesson.url(course.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                form.setData('academic_period_id', defaultPeriod);
                form.setData('material_type', 'file');
                setOpen(false);
            },
        });
    };

    const selectMaterialType = (value: LessonMaterialType) => {
        form.setData((data) => ({
            ...data,
            material_type: value,
            material_file: null,
            external_url: value === 'link' ? data.external_url : '',
        }));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size={isEditing ? 'sm' : 'default'}
                    variant={isEditing ? 'outline' : 'default'}
                >
                    {isEditing ? <SquarePen /> : <Plus />}
                    {isEditing ? 'Edit' : 'Add lesson'}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit lesson' : 'Add lesson'}
                    </DialogTitle>
                    <DialogDescription>
                        Assign the material to a grading period in{' '}
                        {course.subject_code}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-5">
                    <div className="grid gap-2">
                        <Label htmlFor={`lesson-title-${lesson?.id ?? 'new'}`}>
                            Lesson title
                        </Label>
                        <Input
                            id={`lesson-title-${lesson?.id ?? 'new'}`}
                            value={form.data.title}
                            onChange={(event) =>
                                form.setData('title', event.target.value)
                            }
                            required
                            placeholder="Pointers reviewer"
                            aria-invalid={!!form.errors.title}
                        />
                        <InputError message={form.errors.title} />
                    </div>

                    <div className="grid gap-2">
                        <Label
                            htmlFor={`lesson-description-${lesson?.id ?? 'new'}`}
                        >
                            Description
                        </Label>
                        <textarea
                            id={`lesson-description-${lesson?.id ?? 'new'}`}
                            value={form.data.description}
                            onChange={(event) =>
                                form.setData('description', event.target.value)
                            }
                            rows={3}
                            className="border-input bg-card placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20 min-h-24 w-full rounded-md border px-3 py-2 text-sm shadow-[0_1px_1px_rgba(0,0,0,0.04)] outline-none focus-visible:ring-[3px]"
                            placeholder="Optional notes about this material"
                            aria-invalid={!!form.errors.description}
                        />
                        <InputError message={form.errors.description} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label>Academic period</Label>
                            <Select
                                value={form.data.academic_period_id}
                                onValueChange={(value) =>
                                    form.setData('academic_period_id', value)
                                }
                            >
                                <SelectTrigger
                                    className="w-full"
                                    aria-invalid={
                                        !!form.errors.academic_period_id
                                    }
                                >
                                    <SelectValue placeholder="Choose period" />
                                </SelectTrigger>
                                <SelectContent>
                                    {periods.map((period) => (
                                        <SelectItem
                                            key={period.id}
                                            value={period.id.toString()}
                                        >
                                            {period.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError
                                message={form.errors.academic_period_id}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Material type</Label>
                            <Select
                                value={form.data.material_type}
                                onValueChange={(value) =>
                                    selectMaterialType(
                                        value as LessonMaterialType,
                                    )
                                }
                            >
                                <SelectTrigger
                                    className="w-full"
                                    aria-invalid={!!form.errors.material_type}
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {materialTypeOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.material_type} />
                        </div>
                    </div>

                    {form.data.material_type === 'file' ? (
                        <div className="grid gap-2">
                            <Label htmlFor={`lesson-file-${lesson?.id ?? 'new'}`}>
                                File
                            </Label>
                            {lesson?.file_name && (
                                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <FileText className="size-4" />
                                    Current file: {lesson.file_name}
                                </p>
                            )}
                            <Input
                                id={`lesson-file-${lesson?.id ?? 'new'}`}
                                type="file"
                                onChange={(event) =>
                                    form.setData(
                                        'material_file',
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                                required={!lesson?.file_name}
                                aria-invalid={!!form.errors.material_file}
                            />
                            <InputError message={form.errors.material_file} />
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            <Label htmlFor={`lesson-link-${lesson?.id ?? 'new'}`}>
                                External URL
                            </Label>
                            <div className="relative">
                                <LinkIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id={`lesson-link-${lesson?.id ?? 'new'}`}
                                    type="url"
                                    value={form.data.external_url}
                                    onChange={(event) =>
                                        form.setData(
                                            'external_url',
                                            event.target.value,
                                        )
                                    }
                                    required
                                    className="pl-9"
                                    placeholder="https://example.com/material"
                                    aria-invalid={!!form.errors.external_url}
                                />
                            </div>
                            <InputError message={form.errors.external_url} />
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button disabled={form.processing}>
                            {isEditing ? 'Save lesson' : 'Add lesson'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
