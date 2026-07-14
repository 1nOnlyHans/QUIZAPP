import { Link, useForm } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Plus, Trash2, Upload } from 'lucide-react';
import type { ChangeEvent, FormEvent } from 'react';
import { useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { postForm } from '@/lib/http';
import { store as storeReviewer } from '@/routes/courses/reviewers';
import {
    index as reviewersIndex,
    show as showReviewer,
    update as updateReviewer,
} from '@/routes/reviewers';
import {
    parse as parseImport,
    template as importTemplate,
} from '@/routes/reviewers/import';
import type {
    ReviewerCourse,
    ReviewerDetail,
    ReviewerLessonOption,
} from '@/types';

type ReviewerFormItem = {
    term: string;
    definitions: string[];
    group: string;
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

type ImportedItem = {
    term: string;
    definitions: string[];
    group: string | null;
};

type ImportRowError = { row: number; message: string };

type ImportResponse = { items: ImportedItem[]; errors: ImportRowError[] };

const emptyItem = (): ReviewerFormItem => ({
    term: '',
    definitions: [''],
    group: '',
});

const hasContent = (items: ReviewerFormItem[]): boolean =>
    items.some(
        (item) =>
            item.term.trim() !== '' ||
            item.group.trim() !== '' ||
            item.definitions.some((definition) => definition.trim() !== ''),
    );

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
            definitions: item.definitions.length > 0 ? item.definitions : [''],
            group: item.group ?? '',
        })) ?? [emptyItem()],
    });

    const errors = form.errors as Record<string, string>;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importing, setImporting] = useState(false);
    const [importErrors, setImportErrors] = useState<ImportRowError[]>([]);

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
        field: 'term' | 'group',
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

    const updateItemDefinition = (
        itemIndex: number,
        definitionIndex: number,
        value: string,
    ) => {
        form.setData(
            'items',
            form.data.items.map((item, current) =>
                current === itemIndex
                    ? {
                          ...item,
                          definitions: item.definitions.map(
                              (definition, current) =>
                                  current === definitionIndex
                                      ? value
                                      : definition,
                          ),
                      }
                    : item,
            ),
        );
    };

    const addItemDefinition = (itemIndex: number) => {
        form.setData(
            'items',
            form.data.items.map((item, current) =>
                current === itemIndex
                    ? { ...item, definitions: [...item.definitions, ''] }
                    : item,
            ),
        );
    };

    const removeItemDefinition = (
        itemIndex: number,
        definitionIndex: number,
    ) => {
        form.setData(
            'items',
            form.data.items.map((item, current) =>
                current === itemIndex
                    ? {
                          ...item,
                          definitions: item.definitions.filter(
                              (_, current) => current !== definitionIndex,
                          ),
                      }
                    : item,
            ),
        );
    };

    const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) {
            return;
        }

        if (hasContent(form.data.items)) {
            const proceed = window.confirm(
                'Importing will replace the items currently in this form. Continue?',
            );

            if (!proceed) {
                return;
            }
        }

        setImporting(true);
        setImportErrors([]);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const result = await postForm<ImportResponse>(
                parseImport.url(),
                formData,
            );

            if (result.items.length > 0) {
                form.setData(
                    'items',
                    result.items.map((item) => ({
                        term: item.term,
                        definitions: item.definitions,
                        group: item.group ?? '',
                    })),
                );
            }

            setImportErrors(result.errors);
        } catch {
            setImportErrors([
                { row: 0, message: 'The file could not be imported.' },
            ]);
        } finally {
            setImporting(false);
        }
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
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold">Items</h2>
                        <p className="text-sm text-muted-foreground">
                            Add a term with one or more accepted definitions,
                            and optionally group terms for enumeration quizzes.
                            Reorder with the arrows.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                            <a href={importTemplate.url()} download>
                                Download CSV template
                            </a>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={importing}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload />
                            {importing ? 'Importing…' : 'Import CSV'}
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,text/csv"
                            className="hidden"
                            onChange={handleImport}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addItem}
                        >
                            <Plus />
                            Add item
                        </Button>
                    </div>
                </div>

                {importErrors.length > 0 && (
                    <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                        <p className="font-medium">
                            Some rows were skipped during import:
                        </p>
                        <ul className="mt-1 list-inside list-disc">
                            {importErrors.map((error, index) => (
                                <li key={index}>
                                    {error.row > 0
                                        ? `Row ${error.row}: ${error.message}`
                                        : error.message}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <InputError message={form.errors.items} />

                <div className="space-y-4">
                    {form.data.items.map((item, index) => (
                        <div
                            key={index}
                            className="space-y-4 rounded-lg border border-border p-4"
                        >
                            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
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
                                    <Label htmlFor={`item-group-${index}`}>
                                        Group (optional)
                                    </Label>
                                    <Input
                                        id={`item-group-${index}`}
                                        value={item.group}
                                        onChange={(event) =>
                                            updateItem(
                                                index,
                                                'group',
                                                event.target.value,
                                            )
                                        }
                                        maxLength={255}
                                        placeholder="Branches of Government"
                                        aria-invalid={
                                            !!errors[`items.${index}.group`]
                                        }
                                    />
                                    <InputError
                                        message={errors[`items.${index}.group`]}
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

                            <div className="grid gap-2">
                                <Label>Definitions</Label>
                                {item.definitions.map(
                                    (definition, definitionIndex) => (
                                        <div
                                            key={definitionIndex}
                                            className="flex items-start gap-2"
                                        >
                                            <div className="flex-1">
                                                <textarea
                                                    id={`item-definition-${index}-${definitionIndex}`}
                                                    value={definition}
                                                    onChange={(event) =>
                                                        updateItemDefinition(
                                                            index,
                                                            definitionIndex,
                                                            event.target.value,
                                                        )
                                                    }
                                                    rows={2}
                                                    className="min-h-16 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-[0_1px_1px_rgba(0,0,0,0.04)] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20"
                                                    placeholder="A variable that stores a memory address"
                                                    aria-invalid={
                                                        !!errors[
                                                            `items.${index}.definitions.${definitionIndex}`
                                                        ]
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        errors[
                                                            `items.${index}.definitions.${definitionIndex}`
                                                        ]
                                                    }
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    removeItemDefinition(
                                                        index,
                                                        definitionIndex,
                                                    )
                                                }
                                                disabled={
                                                    item.definitions.length ===
                                                    1
                                                }
                                                aria-label="Remove definition"
                                            >
                                                <Trash2 />
                                            </Button>
                                        </div>
                                    ),
                                )}
                                <InputError
                                    message={
                                        errors[`items.${index}.definitions`]
                                    }
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="justify-self-start"
                                    onClick={() => addItemDefinition(index)}
                                >
                                    <Plus />
                                    Add alternate definition
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
