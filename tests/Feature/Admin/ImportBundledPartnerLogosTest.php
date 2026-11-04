<?php

use App\Actions\Partners\ImportBundledPartnerLogosAction;
use App\Models\PartnerLogo;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake(PartnerLogo::DISK);
});

test('the bundled certification logos are imported in their original order', function () {
    expect(app(ImportBundledPartnerLogosAction::class)->execute())->toBe(5);

    $items = PartnerLogo::query()->orderBy('sort_order')->get();
    expect($items->pluck('label')->all())->toBe([
        'GMP Certified',
        'BCSIR Tested',
        'USAC Accredited',
        'UKAS Accredited',
        'ISO 9001:2015 Certified',
    ])->and($items->every(fn (PartnerLogo $item) => $item->is_active))->toBeTrue();

    foreach ($items as $item) {
        Storage::disk(PartnerLogo::DISK)->assertExists($item->image_path);
    }
});

test('importing twice does not duplicate anything', function () {
    app(ImportBundledPartnerLogosAction::class)->execute();

    expect(app(ImportBundledPartnerLogosAction::class)->execute())->toBe(0)
        ->and(PartnerLogo::query()->count())->toBe(5);
});

test('the import leaves an already-populated list alone', function () {
    PartnerLogo::factory()->create();

    expect(app(ImportBundledPartnerLogosAction::class)->execute())->toBe(0)
        ->and(PartnerLogo::query()->count())->toBe(1);
});

test('source files that are missing are skipped', function () {
    expect(app(ImportBundledPartnerLogosAction::class)->execute(sys_get_temp_dir().'/no-such-dir'))->toBe(0);
});
