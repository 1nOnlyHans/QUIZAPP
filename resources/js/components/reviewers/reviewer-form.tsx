import { Link, useForm } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store as storeReviewer } from '@/routes/courses/reviewers';
import {
    index as reviewersIndex,
    show as showReviewer,
    update as updateReviewer,
} from '@/routes/reviewers';
import type {
    ReviewerCourse,
    ReviewerDetail,
    ReviewerLessonOption,
} from '@/types';

type ReviewerFormItem = {
    term: string;
    definition: string;
};

type ReviewerFormData = {
    title: string;
    description: string;
    lesson_ids: number[];
    items: ReviewerFormItem[];
    [key: string]: string | number[] | ReviewerFormItem[];
};

type ReviewerFormProps = {
    course: ReviewerCourse;
    lessonOptions: ReviewerLessonOption[];
    reviewer?: ReviewerDetail;
};

const emptyItem = (): ReviewerFormItem => ({ term: '', definition: '' });

export default function ReviewerForm({
    course,
    lessonOptions,
    reviewer,
}: ReviewerFormProps) {
    const form = useForm<ReviewerFormData>({
        title: reviewer?.title ?? '',
        description: reviewer?.description ?? '',
        lesson_ids: reviewer?.lesson_ids ?? [],
        items: reviewer?.items.map((item) => ({
            term: item.term,
            definition: item.definition,
        })) ?? [emptyItem()],
    });

    const errors = form.errors as Record<string, string>;

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (reviewer) {
            form.patch(updateReviewer.url(reviewer.id), {
                preserveScroll: true,
            });

            return;
        }

        form.post(storeReviewer.url(course.id), {
            preserveScroll: true,
        });
    };

    const toggleLesson = (lessonId: number, checked: boolean) => {
        form.setData(
            'lesson_ids',
            checked
                ? [...form.data.lesson_ids, lessonId]
                : form.data.lesson_ids.filter((id) => id !== lessonId),
        );
    };

    const updateItem = (
        index: number,
        field: keyof ReviewerFormItem,
        value: string,
    ) => {
        form.setData(
            'items',
            form.data.items.map((item, current) =>
                current === index ? { ...item, [field]: value } : item,
            ),
        );
    };

    const addItem = () => {
        form.setData('items', [...form.data.items, emptyItem()]);
    };

    const removeItem = (index: number) => {
        form.setData(
            'items',
            form.data.items.filter((_, current) => current !== index),
        );
    };

    const moveItem = (index: number, direction: -1 | 1) => {
        const target = index + direction;

        if (target < 0 || target >= form.data.items.length) {
            return;
        }

        const next = [...form.data.items];
        [next[index], next[target]] = [next[target], next[index]];
        form.setData('items', next);
    };

    return (
        <form onSubmit={submit} className="space-y-8">
            <section className="space-y-5 rounded-lg border border-border bg-card p-6">
                <div className="grid gap-2">
                    <Label htmlFor="reviewer-title">Title</Label>
                    <Input
                        id="reviewer-title"
                        value={form.data.title}
                        onChange={(event) =>
                            form.setData('title', event.target.value)
                        }
                        required
                        maxLength={255}
                        placeholder="Pointers reviewer"
                        aria-invalid={!!form.errors.title}
                    />
                    <InputError message={form.errors.title} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="reviewer-description">Description</Label>
                    <textarea
                        id="reviewer-description"
                        value={form.data.description}
                        onChange={(event) =>
                            form.setData('description', event.target.value)
                        }
                        rows={3}
                        className="min-h-24 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-[0_1px_1px_rgba(0,0,0,0.04)] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20"
                        placeholder="Optional summary of what this reviewer covers"
                        aria-invalid={!!form.errors.description}
                    />
                    <InputError message={form.errors.description} />
                </div>

                <div className="grid gap-3">
                    <div>
                        <Label>Based on lessons</Label>
                        <p className="text-sm text-muted-foreground">
                            Link the {course.subject_code} lessons this reviewer
                            is drawn from (optional).
                        </p>
                    </div>

                    {lessonOptions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            This course has no lessons yet.
                        </p>
                    ) : (
                        <div className="grid gap-2 sm:grid-cols-2">
                            {lessonOptions.map((lesson) => (
                                <label
                                    key={lesson.id}
                                    className="flex items-start gap-3 rounded-md border border-border p-3 text-sm"
                                >
                                    <Checkbox
                                        checked={form.data.lesson_ids.includes(
                                            lesson.id,
                                        )}
                                        onCheckedChange={(checked) =>
                                            toggleLesson(
                                                lesson.id,
                                                checked === true,
                                            )
                                        }
                                    />
                                    <span className="min-w-0">
                                        <span className="block font-medium">
                                            {lesson.title}
                                        </span>
                                        {lesson.academic_period_name && (
                                            <span className="text-muted-foreground">
                                                {lesson.academic_period_name}
                                            </span>
                                        )}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                    <InputError message={errors.lesson_ids} />
                </div>
            </section>

            <section className="space-y-4 rounded-lg border border-border bg-card p-6">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold">Items</h2>
                        <p className="text-sm text-muted-foreground">
                            Add a term and its correct definition. Reorder with
                            the arrows.
                        </p>
                    </div>
                    <Button type="button" variant="outline" onClick={addItem}>
                        <Plus />
                        Add item
                    </Button>
                </div>

                <InputError message={form.errors.items} />

                <div className="space-y-4">
                    {form.data.items.map((item, index) => (
                        <div
                            key={index}
                            className="grid gap-4 rounded-lg border border-border p-4 lg:grid-cols-[1fr_1.5fr_auto]"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor={`item-term-${index}`}>
                                    Term {index + 1}
                                </Label>
                                <Input
                                    id={`item-term-${index}`}
                                    value={item.term}
                                    onChange={(event) =>
                                        updateItem(
                                            index,
                                            'term',
                                            event.target.value,
                                        )
                                    }
                                    required
                                    maxLength={255}
                                    placeholder="Pointer"
                                    aria-invalid={
                                        !!errors[`items.${index}.term`]
                                    }
                                />
                                <InputError
                                    message={errors[`items.${index}.term`]}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor={`item-definition-${index}`}>
                                    Definition
                                </Label>
                                <textarea
                                    id={`item-definition-${index}`}
                                    value={item.definition}
                                    onChange={(event) =>
                                        updateItem(
                                            index,
                                            'definition',
                                            event.target.value,
                                        )
                                    }
                                    rows={2}
                                    className="min-h-16 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-[0_1px_1px_rgba(0,0,0,0.04)] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20"
                                    placeholder="A variable that stores a memory address"
                                    aria-invalid={
                                        !!errors[`items.${index}.definition`]
                                    }
                                />
                                <InputError
                                    message={
                                        errors[`items.${index}.definition`]
                                    }
                                />
                            </div>

                            <div className="flex items-start gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => moveItem(index, -1)}
                                    disabled={index === 0}
                                    aria-label="Move up"
                                >
                                    <ArrowUp />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => moveItem(index, 1)}
                                    disabled={
                                        index === form.data.items.length - 1
                                    }
                                    aria-label="Move down"
                                >
                                    <ArrowDown />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeItem(index)}
                                    disabled={form.data.items.length === 1}
                                    aria-label="Remove item"
                                >
                                    <Trash2 />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <div className="flex flex-wrap items-center gap-3">
                <Button disabled={form.processing}>
                    {reviewer ? 'Save changes' : 'Create reviewer'}
                </Button>
                <Button asChild variant="outline">
                    <Link
                        href={
                            reviewer
                                ? showReviewer(reviewer.id)
                                : reviewersIndex()
                        }
                    >
                        Cancel
                    </Link>
                </Button>
            </div>
        </form>
    );
}
