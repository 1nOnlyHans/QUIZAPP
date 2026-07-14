<?php

namespace App\Http\Requests\Reviewers;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;

class ParseReviewerCsvRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:5120',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if (! $value instanceof UploadedFile) {
                        return;
                    }

                    $extension = strtolower((string) $value->getClientOriginalExtension());

                    if (! in_array($extension, ['csv', 'txt'], true)) {
                        $fail('The file must be a CSV file.');
                    }
                },
            ],
        ];
    }
}
