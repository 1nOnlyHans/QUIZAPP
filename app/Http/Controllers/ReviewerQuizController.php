<?php

namespace App\Http\Controllers;

use App\Enums\QuizType;
use App\Models\Reviewer;
use App\Models\ReviewerItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ReviewerQuizController extends Controller
{
    public function create(Reviewer $reviewer): Response
    {
        Gate::authorize('view', $reviewer);

        $reviewer->loadCount('items');

        return Inertia::render('reviewers/quiz/create', [
            'reviewer' => [
                'id' => $reviewer->id,
                'title' => $reviewer->title,
                'items_count' => $reviewer->items_count ?? 0,
            ],
            'typeOptions' => QuizType::options(),
        ]);
    }

    public function show(Request $request, Reviewer $reviewer): Response
    {
        Gate::authorize('view', $reviewer);

        $reviewer->load('items');

        abort_if($reviewer->items->isEmpty(), 404);

        $itemsCount = $reviewer->items->count();
        $type = QuizType::tryFrom((string) $request->query('type')) ?? QuizType::MultipleChoice;
        $count = max(1, min($itemsCount, (int) $request->query('count', $itemsCount)));

        return Inertia::render('reviewers/quiz/show', [
            'reviewer' => [
                'id' => $reviewer->id,
                'title' => $reviewer->title,
                'description' => $reviewer->description,
                'items' => $reviewer->items
                    ->map(fn (ReviewerItem $item): array => [
                        'id' => $item->id,
                        'term' => $item->term,
                        'definition' => $item->definition,
                    ])
                    ->all(),
            ],
            'type' => $type->value,
            'count' => $count,
        ]);
    }
}
