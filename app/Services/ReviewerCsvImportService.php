<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use League\Csv\Exception as CsvException;
use League\Csv\Reader;

class ReviewerCsvImportService
{
    private const DEFINITION_SEPARATOR = '|';

    /**
     * @return array{items: list<array{term: string, definitions: list<string>, group: string|null}>, errors: list<array{row: int, message: string}>}
     */
    public function parse(UploadedFile $file): array
    {
        try {
            $reader = Reader::createFromPath($file->getRealPath(), 'r');
            $reader->setHeaderOffset(0);
            $header = array_map(
                static fn (string $column): string => strtolower(trim($column)),
                $reader->getHeader(),
            );
        } catch (CsvException) {
            return [
                'items' => [],
                'errors' => [['row' => 1, 'message' => 'The file could not be read as a CSV.']],
            ];
        }

        if (! in_array('term', $header, true) || ! in_array('definitions', $header, true)) {
            return [
                'items' => [],
                'errors' => [['row' => 1, 'message' => 'The CSV must include "term" and "definitions" columns.']],
            ];
        }

        $items = [];
        $errors = [];

        foreach ($reader->getRecords() as $offset => $record) {
            $row = $this->normalizeRow($record);
            $rowNumber = $offset + 1;

            $term = trim((string) ($row['term'] ?? ''));
            $definitions = $this->splitDefinitions((string) ($row['definitions'] ?? ''));
            $group = trim((string) ($row['group'] ?? ''));

            if ($term === '' && $definitions === []) {
                continue;
            }

            if ($term === '') {
                $errors[] = ['row' => $rowNumber, 'message' => 'Term is required.'];

                continue;
            }

            if ($definitions === []) {
                $errors[] = ['row' => $rowNumber, 'message' => 'At least one definition is required.'];

                continue;
            }

            $items[] = [
                'term' => $term,
                'definitions' => $definitions,
                'group' => $group !== '' ? $group : null,
            ];
        }

        return ['items' => $items, 'errors' => $errors];
    }

    /**
     * @param  array<array-key, mixed>  $record
     * @return array<string, mixed>
     */
    private function normalizeRow(array $record): array
    {
        $normalized = [];

        foreach ($record as $key => $value) {
            $normalized[strtolower(trim((string) $key))] = $value;
        }

        return $normalized;
    }

    /**
     * @return list<string>
     */
    private function splitDefinitions(string $raw): array
    {
        $segments = explode(self::DEFINITION_SEPARATOR, $raw);

        $trimmed = array_map(static fn (string $segment): string => trim($segment), $segments);
        $nonEmpty = array_filter($trimmed, static fn (string $segment): bool => $segment !== '');

        return array_values(array_unique($nonEmpty));
    }
}
