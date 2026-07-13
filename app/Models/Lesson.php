<?php

namespace App\Models;

use App\Enums\LessonMaterialType;
use Database\Factories\LessonFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $course_id
 * @property int $academic_period_id
 * @property string $title
 * @property string|null $description
 * @property LessonMaterialType $material_type
 * @property string|null $file_disk
 * @property string|null $file_path
 * @property string|null $file_name
 * @property string|null $file_mime_type
 * @property int|null $file_size
 * @property string|null $external_url
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'course_id',
    'academic_period_id',
    'title',
    'description',
    'material_type',
    'file_disk',
    'file_path',
    'file_name',
    'file_mime_type',
    'file_size',
    'external_url',
])]
class Lesson extends Model
{
    /** @use HasFactory<LessonFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Course, $this>
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * @return BelongsTo<AcademicPeriod, $this>
     */
    public function academicPeriod(): BelongsTo
    {
        return $this->belongsTo(AcademicPeriod::class);
    }

    /**
     * @return BelongsToMany<Reviewer, $this>
     */
    public function reviewers(): BelongsToMany
    {
        return $this->belongsToMany(Reviewer::class);
    }

    public function hasStoredFile(): bool
    {
        return $this->material_type === LessonMaterialType::File && filled($this->file_path);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'material_type' => LessonMaterialType::class,
        ];
    }
}
