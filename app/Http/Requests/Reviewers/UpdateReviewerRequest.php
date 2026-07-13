<?php

namespace App\Http\Requests\Reviewers;

use App\Models\Reviewer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class UpdateReviewerRequest extends FormRequest
{
    public function authorize(): bool
    {
        $reviewer = $this->route('reviewer');

        return $reviewer instanceof Reviewer && Gate::allows('update', $reviewer);
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'title' => trim((string) $this->input('title')),
            'description' => filled($this->input('description'))
                ? trim((string) $this->input('description'))
                : null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Reviewer $reviewer */
        $reviewer = $this->route('reviewer');

        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'lesson_ids' => ['nullable', 'array'],
            'lesson_ids.*' => [
                'integer',
                Rule::exists('lessons', 'id')->where('course_id', $reviewer->course_id),
            ],
            'items' => ['required', 'array', 'min:1'],
            'items.*.term' => ['required', 'string', 'max:255'],
            'items.*.definition' => ['required', 'string', 'max:2000'],
        ];
    }
}
