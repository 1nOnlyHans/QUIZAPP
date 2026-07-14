<?php

namespace App\Http\Controllers;

use App\Http\Requests\Reviewers\ParseReviewerCsvRequest;
use App\Models\Reviewer;
use App\Services\ReviewerCsvImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use League\Csv\Writer;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReviewerImportController extends Controller
{
    public function parse(ParseReviewerCsvRequest $request, ReviewerCsvImportService $importer): JsonResponse
    {
        Gate::authorize('viewAny', Reviewer::class);

        return response()->json($importer->parse($request->file('file')));
    }

    public function template(): StreamedResponse
    {
        Gate::authorize('viewAny', Reviewer::class);

        $writer = Writer::createFromString('');
        $writer->insertOne(['term', 'definitions', 'group']);
        $writer->insertAll([
            ['Mitochondria', 'Powerhouse of the cell|Organelle that produces ATP', 'Types of Cells'],
            ['Nucleus', 'Control center of the cell', 'Types of Cells'],
            ['Executive', 'Enforces laws|Carries out laws', 'Branches of Government'],
            ['Pointer', 'Stores a memory address|Holds the address of a variable', ''],
        ]);

        $csv = $writer->toString();

        return response()->streamDownload(
            function () use ($csv) {
                echo $csv;
            },
            'reviewer-template.csv',
            ['Content-Type' => 'text/csv'],
        );
    }
}
