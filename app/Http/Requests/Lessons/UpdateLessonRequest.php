<?php

namespace App\Http\Requests\Lessons;

use App\Enums\LessonMaterialType;
use App\Models\Lesson;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class UpdateLessonRequest extends FormRequest
{
    public function authorize(): bool
    {
        $lesson = $this->route('lesson');

        return $lesson instanceof Lesson && Gate::allows('update', $lesson);
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'title' => trim((string) $this->input('title')),
            'description' => filled($this->input('description'))
                ? trim((string) $this->input('description'))
                : null,
            'external_url' => filled($this->input('external_url'))
                ? trim((string) $this->input('external_url'))
                : null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Lesson $lesson */
        $lesson = $this->route('lesson');
        $mustUploadFile = $this->input('material_type') === LessonMaterialType::File->value
            && (! $lesson->hasStoredFile());

        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'academic_period_id' => ['required', 'integer', Rule::exists('academic_periods', 'id')],
            'material_type' => ['required', Rule::enum(LessonMaterialType::class)],
            'material_file' => [
                Rule::requiredIf(fn (): bool => $mustUploadFile),
                Rule::prohibitedIf(fn (): bool => $this->input('material_type') === LessonMaterialType::Link->value),
                'file',
                'max:20480',
                'mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,txt,rtf,jpg,jpeg,png,webp',
            ],
            'external_url' => [
                Rule::requiredIf(fn (): bool => $this->input('material_type') === LessonMaterialType::Link->value),
                Rule::prohibitedIf(fn (): bool => $this->input('material_type') === LessonMaterialType::File->value),
                'nullable',
                'url',
                'max:2048',
            ],
        ];
    }
}
