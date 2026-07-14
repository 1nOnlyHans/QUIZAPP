<?php

use App\Http\Controllers\CourseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\ReviewerController;
use App\Http\Controllers\ReviewerImportController;
use App\Http\Controllers\ReviewerQuizController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->scopeBindings()->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::resource('courses', CourseController::class);

    Route::post('courses/{course}/lessons', [LessonController::class, 'store'])
        ->name('courses.lessons.store');
    Route::patch('courses/{course}/lessons/{lesson}', [LessonController::class, 'update'])
        ->name('courses.lessons.update');
    Route::delete('courses/{course}/lessons/{lesson}', [LessonController::class, 'destroy'])
        ->name('courses.lessons.destroy');
    Route::get('courses/{course}/lessons/{lesson}/view', [LessonController::class, 'view'])
        ->name('courses.lessons.view');
    Route::get('courses/{course}/lessons/{lesson}/inline', [LessonController::class, 'inline'])
        ->name('courses.lessons.inline');
    Route::get('courses/{course}/lessons/{lesson}/download', [LessonController::class, 'download'])
        ->name('courses.lessons.download');

    Route::get('reviewers/import/template', [ReviewerImportController::class, 'template'])
        ->name('reviewers.import.template');
    Route::post('reviewers/import/parse', [ReviewerImportController::class, 'parse'])
        ->name('reviewers.import.parse');

    Route::resource('reviewers', ReviewerController::class)
        ->only(['index', 'show', 'edit', 'update', 'destroy']);

    Route::get('courses/{course}/reviewers/create', [ReviewerController::class, 'create'])
        ->name('courses.reviewers.create');
    Route::post('courses/{course}/reviewers', [ReviewerController::class, 'store'])
        ->name('courses.reviewers.store');

    Route::get('reviewers/{reviewer}/quiz/create', [ReviewerQuizController::class, 'create'])
        ->name('reviewers.quiz.create');
    Route::get('reviewers/{reviewer}/quiz', [ReviewerQuizController::class, 'show'])
        ->name('reviewers.quiz.show');
});

require __DIR__.'/settings.php';
