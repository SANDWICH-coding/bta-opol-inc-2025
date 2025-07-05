<?php

use App\Http\Controllers\BillingController;
use App\Http\Controllers\BillingDiscController;
use App\Http\Controllers\BillingPaymentController;
use App\Http\Controllers\BillingUserController;
use App\Http\Controllers\ClassArmController;
use App\Http\Controllers\EnrollBillingDiscController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\YearLevelController;
use App\Http\Controllers\SchoolYearController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Middleware\RoleMiddleware;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::prefix('admin')->name('admin.')->middleware(['auth', 'role:admin'])->group(function () {
    Route::resource('school-year', SchoolYearController::class);
    Route::resource('year-level', YearLevelController::class);
    Route::resource('class-arm', ClassArmController::class);
    Route::resource('billing', BillingController::class);
    Route::resource('billing-discount', BillingDiscController::class);
});

Route::prefix('user')->name('user.')->middleware(['auth', 'role:user'])->group(function () {
    Route::resource('school-year', SchoolYearController::class);
});

Route::prefix('registrar')->name('registrar.')->middleware(['auth', 'role:registrar'])->group(function () {
    Route::get('', [EnrollmentController::class, 'schoolYearList'])
        ->name('enrollment.school-year-list');

    Route::get('school-year-setup/{id}', [EnrollmentController::class, 'schoolYearSetup'])
        ->name('enrollment.school-year-setup');

    Route::get('enrollment/class-arm-setup/{id}', [EnrollmentController::class, 'classArmSetup'])
        ->name('enrollment.class-arm-setup');

    Route::post('enrollment/enroll-student', [EnrollmentController::class, 'enrollStudent'])
        ->name('enrollment.enroll-student');

    Route::get('enrollment/student/{id}', [EnrollmentController::class, 'studentEnrollmentDetails'])
        ->name('enrollment.student');

    Route::post('enrollment/student/{id}/update-profile-photo', [EnrollmentController::class, 'updateProfile'])
        ->name('enrollment.student.update-profile-photo');

    Route::post('enrollment/student/{id}/update-birth-date', [EnrollmentController::class, 'updateBirthDate'])
        ->name('enrollment.student.update-birth-date');


    Route::resource('class-arm', ClassArmController::class);
});

Route::prefix('billing')->name('billing.')->middleware(['auth', 'role:billing'])->group(function () {
    Route::get('', [BillingUserController::class, 'listSchoolYear'])->name('sy-list');
    Route::get('school-year/{id}', [BillingUserController::class, 'listYearLevel'])
        ->name('billing.yl-list');
    Route::get('year-level/{id}', [BillingUserController::class, 'listStudent'])
        ->name('billing.student-list');

    Route::get('student/{id}', [BillingUserController::class, 'studentDetails'])
        ->name('billing.student-details');

    Route::post('apply-discount', [EnrollBillingDiscController::class, 'applyDiscount'])
        ->name('billing.apply-discount');

    Route::post('add-payment', [BillingPaymentController::class, 'createPayment'])
        ->name('billing.add-payment');

    Route::get('generate-soa/student/{id}', [BillingUserController::class, 'generateSoa'])
        ->name('biling.generate-soa');

    Route::post('generate-soa/all-student/{id}', [BillingUserController::class, 'generateAllSoa'])
        ->name('generate-all-soa');

    Route::get('manage/student/{id}', [EnrollmentController::class, 'studentBillingDetails'])
        ->name('biling.student');

    Route::get('soa/download-zip/{schoolYearId}', [BillingUserController::class, 'downloadSoaZip'])->name('soa.download-zip');

});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
