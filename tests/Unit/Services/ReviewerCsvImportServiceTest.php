<?php

namespace Tests\Unit\Services;

use App\Services\ReviewerCsvImportService;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class ReviewerCsvImportServiceTest extends TestCase
{
    public function test_it_parses_terms_with_multiple_definitions_and_groups(): void
    {
        $csv = <<<'CSV'
        term,definitions,group
        Mitochondria,"Powerhouse of the cell|Organelle that produces ATP",Types of Cells
        Nucleus,Control center of the cell,Types of Cells
        Pointer,Stores a memory address|Holds the address of a variable,
        CSV;

        $result = (new ReviewerCsvImportService)->parse(
            UploadedFile::fake()->createWithContent('items.csv', $csv),
        );

        $this->assertSame([], $result['errors']);
        $this->assertCount(3, $result['items']);

        $this->assertSame([
            'term' => 'Mitochondria',
            'definitions' => ['Powerhouse of the cell', 'Organelle that produces ATP'],
            'group' => 'Types of Cells',
        ], $result['items'][0]);

        $this->assertSame([
            'term' => 'Pointer',
            'definitions' => ['Stores a memory address', 'Holds the address of a variable'],
            'group' => null,
        ], $result['items'][2]);
    }

    public function test_it_collects_row_level_errors_without_dropping_valid_rows(): void
    {
        $csv = <<<'CSV'
        term,definitions,group
        Valid,A valid definition,
        ,Missing a term,
        NoDefinitions,,
        CSV;

        $result = (new ReviewerCsvImportService)->parse(
            UploadedFile::fake()->createWithContent('items.csv', $csv),
        );

        $this->assertCount(1, $result['items']);
        $this->assertSame('Valid', $result['items'][0]['term']);

        $this->assertCount(2, $result['errors']);
        $this->assertSame(3, $result['errors'][0]['row']);
        $this->assertSame(4, $result['errors'][1]['row']);
    }

    public function test_it_requires_term_and_definitions_columns(): void
    {
        $csv = <<<'CSV'
        term,description
        Valid,Something
        CSV;

        $result = (new ReviewerCsvImportService)->parse(
            UploadedFile::fake()->createWithContent('items.csv', $csv),
        );

        $this->assertSame([], $result['items']);
        $this->assertCount(1, $result['errors']);
    }

    public function test_it_deduplicates_and_trims_definitions(): void
    {
        $csv = <<<'CSV'
        term,definitions,group
        Term,"  A definition | A definition |Another one  ",
        CSV;

        $result = (new ReviewerCsvImportService)->parse(
            UploadedFile::fake()->createWithContent('items.csv', $csv),
        );

        $this->assertSame(
            ['A definition', 'Another one'],
            $result['items'][0]['definitions'],
        );
    }
}
