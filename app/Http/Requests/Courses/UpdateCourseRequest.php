<?php

namespace App\Http\Requests\Courses;

use App\Enums\CourseCategory;
use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class UpdateCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        $course = $this->route('course');

        return $course instanceof Course && Gate::allows('update', $course);
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'subject_code' => strtoupper(trim((string) $this->input('subject_code'))),
            'subject_name' => trim((string) $this->input('subject_name')),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var User $user */
        $user = $this->user();
        /** @var Course $course */
        $course = $this->route('course');

        return [
            'subject_code' => [
                'required',
                'string',
                'max:30',
                Rule::unique('courses', 'subject_code')
                    ->where(fn ($query) => $query->where('user_id', $user->id))
                    ->ignore($course->id),
            ],
            'subject_name' => ['required', 'string', 'max:255'],
            'category' => ['required', Rule::enum(CourseCategory::class)],
        ];
    }
}
