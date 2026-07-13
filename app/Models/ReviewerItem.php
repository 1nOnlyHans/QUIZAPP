<?php

namespace App\Models;

use Database\Factories\ReviewerItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $reviewer_id
 * @property string $term
 * @property string $definition
 * @property int $position
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['reviewer_id', 'term', 'definition', 'position'])]
class ReviewerItem extends Model
{
    /** @use HasFactory<ReviewerItemFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Reviewer, $this>
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(Reviewer::class);
    }
}
