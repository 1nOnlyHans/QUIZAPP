<?php

namespace App\Models;

use Database\Factories\ReviewerItemDefinitionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $reviewer_item_id
 * @property string $definition
 * @property int $position
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['reviewer_item_id', 'definition', 'position'])]
class ReviewerItemDefinition extends Model
{
    /** @use HasFactory<ReviewerItemDefinitionFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<ReviewerItem, $this>
     */
    public function reviewerItem(): BelongsTo
    {
        return $this->belongsTo(ReviewerItem::class);
    }
}
