<?php

namespace App\Services;

use App\Enums\LessonMaterialType;
use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class LessonService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function create(Course $course, array $data): Lesson
    {
        return DB::transaction(function () use ($course, $data): Lesson {
            return $course->lessons()->create(
                $this->attributesForPersisting($course, $data),
            );
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Lesson $lesson, array $data): Lesson
    {
        return DB::transaction(function () use ($lesson, $data): Lesson {
            $course = $lesson->course()->firstOrFail();
            $attributes = $this->attributesForPersisting($course, $data, $lesson);

            if ($attributes['material_type'] === LessonMaterialType::Link->value || isset($data['material_file'])) {
                $this->deleteStoredFile($lesson);
            }

            $lesson->update($attributes);

            return $lesson->refresh();
        });
    }

    public function delete(Lesson $lesson): void
    {
        DB::transaction(function () use ($lesson): void {
            $this->deleteStoredFile($lesson);
            $lesson->delete();
        });
    }

    public function deleteStoredFile(Lesson $lesson): void
    {
        if (! $lesson->hasStoredFile() || $lesson->file_disk === null || $lesson->file_path === null) {
            return;
        }

        Storage::disk($lesson->file_disk)->delete($lesson->file_path);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function attributesForPersisting(Course $course, array $data, ?Lesson $lesson = null): array
    {
        $attributes = [
            'academic_period_id' => (int) $data['academic_period_id'],
            'title' => (string) $data['title'],
            'description' => $data['description'] ?? null,
            'material_type' => (string) $data['material_type'],
            'external_url' => null,
        ];

        if ($attributes['material_type'] === LessonMaterialType::Link->value) {
            return [
                ...$attributes,
                'file_disk' => null,
                'file_path' => null,
                'file_name' => null,
                'file_mime_type' => null,
                'file_size' => null,
                'external_url' => $data['external_url'],
            ];
        }

        if (($data['material_file'] ?? null) instanceof UploadedFile) {
            return [
                ...$attributes,
                ...$this->storeFile($course, $data['material_file']),
            ];
        }

        return [
            ...$attributes,
            'file_disk' => $lesson?->file_disk,
            'file_path' => $lesson?->file_path,
            'file_name' => $lesson?->file_name,
            'file_mime_type' => $lesson?->file_mime_type,
            'file_size' => $lesson?->file_size,
        ];
    }

    /**
     * @return array{file_disk: string, file_path: string, file_name: string, file_mime_type: string|null, file_size: int}
     */
    private function storeFile(Course $course, UploadedFile $file): array
    {
        $path = $file->store("lessons/{$course->user_id}/{$course->id}", 'local');

        if ($path === false) {
            throw new RuntimeException('Unable to store lesson material.');
        }

        return [
            'file_disk' => 'local',
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_mime_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
        ];
    }
}
