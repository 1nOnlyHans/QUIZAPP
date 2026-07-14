<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class ReviewerCsvImportTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_from_import_routes(): void
    {
        $this->get(route('reviewers.import.template'))->assertRedirect(route('login'));
        $this->post(route('reviewers.import.parse'))->assertRedirect(route('login'));
    }

    public function test_template_downloads_a_csv_with_the_expected_header(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('reviewers.import.template'));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $this->assertStringStartsWith('term,definitions,group', $response->streamedContent());
    }

    public function test_parse_returns_items_for_a_well_formed_csv(): void
    {
        $user = User::factory()->create();

        $csv = <<<'CSV'
        term,definitions,group
        Mitochondria,"Powerhouse of the cell|Organelle that produces ATP",Types of Cells
        Nucleus,Control center of the cell,Types of Cells
        Pointer,Stores a memory address|Holds the address of a variable,
        CSV;

        $response = $this
            ->actingAs($user)
            ->post(route('reviewers.import.parse'), [
                'file' => UploadedFile::fake()->createWithContent('items.csv', $csv),
            ]);

        $response->assertOk();
        $response->assertJson([
            'errors' => [],
        ]);
        $response->assertJsonCount(3, 'items');
        $response->assertJsonFragment([
            'term' => 'Mitochondria',
            'definitions' => ['Powerhouse of the cell', 'Organelle that produces ATP'],
            'group' => 'Types of Cells',
        ]);
        $response->assertJsonFragment([
            'term' => 'Pointer',
            'definitions' => ['Stores a memory address', 'Holds the address of a variable'],
            'group' => null,
        ]);
    }

    public function test_parse_reports_row_errors_while_keeping_valid_rows(): void
    {
        $user = User::factory()->create();

        $csv = <<<'CSV'
        term,definitions,group
        Valid,A valid definition,
        ,Missing a term,
        NoDefinitions,,
        CSV;

        $response = $this
            ->actingAs($user)
            ->post(route('reviewers.import.parse'), [
                'file' => UploadedFile::fake()->createWithContent('items.csv', $csv),
            ]);

        $response->assertOk();
        $response->assertJsonCount(1, 'items');
        $response->assertJsonCount(2, 'errors');
    }

    public function test_parse_rejects_missing_file(): void
    {
        $user = User::factory()->create();

        $this
            ->actingAs($user)
            ->post(route('reviewers.import.parse'), [])
            ->assertSessionHasErrors('file');
    }

    public function test_parse_rejects_oversized_file(): void
    {
        $user = User::factory()->create();

        $this
            ->actingAs($user)
            ->post(route('reviewers.import.parse'), [
                'file' => UploadedFile::fake()->create('items.csv', 6000, 'text/csv'),
            ])
            ->assertSessionHasErrors('file');
    }

    public function test_parse_accepts_a_csv_reported_as_the_windows_excel_mime_type(): void
    {
        $user = User::factory()->create();

        $csv = "term,definitions,group\nValid,A definition,\n";

        $response = $this
            ->actingAs($user)
            ->post(route('reviewers.import.parse'), [
                'file' => UploadedFile::fake()->createWithContent(
                    'items.csv',
                    $csv,
                )->mimeType('application/vnd.ms-excel'),
            ]);

        $response->assertOk();
        $response->assertJsonCount(1, 'items');
    }
}
