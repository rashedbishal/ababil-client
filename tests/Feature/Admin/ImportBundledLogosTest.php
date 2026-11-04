<?php

use App\Actions\Logos\ImportBundledLogosAction;
use App\Enums\LogoSlot;
use App\Models\Logo;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake(Logo::DISK);
});

test('the bundled logos and icons are imported into the logo CMS', function () {
    expect(app(ImportBundledLogosAction::class)->execute())->toBe(3);

    $site = Logo::query()->where('slot', LogoSlot::Site)->firstOrFail();
    $admin = Logo::query()->where('slot', LogoSlot::Admin)->firstOrFail();
    $favicon = Logo::query()->where('slot', LogoSlot::Favicon)->firstOrFail();

    Storage::disk(Logo::DISK)->assertExists($site->image_path);
    Storage::disk(Logo::DISK)->assertExists($admin->image_path);
    expect(array_keys($favicon->variants))->toBe(['icon_48', 'icon_192', 'apple'])
        ->and($favicon->image_path)->toBe($favicon->variants['icon_192']);
    foreach ($favicon->variants as $path) {
        Storage::disk(Logo::DISK)->assertExists($path);
    }
});

test('importing twice does not duplicate anything', function () {
    app(ImportBundledLogosAction::class)->execute();

    expect(app(ImportBundledLogosAction::class)->execute())->toBe(0)
        ->and(Logo::query()->count())->toBe(3);
});

test('a slot that already has a logo is left alone', function () {
    Logo::factory()->forSlot(LogoSlot::Site)->create(['image_path' => 'logos/mine.webp']);

    expect(app(ImportBundledLogosAction::class)->execute())->toBe(2)
        ->and(Logo::query()->where('slot', LogoSlot::Site)->value('image_path'))->toBe('logos/mine.webp');
});

test('missing source files are skipped', function () {
    $nowhere = sys_get_temp_dir().'/no-such-dir';

    expect(app(ImportBundledLogosAction::class)->execute($nowhere, $nowhere))->toBe(0);
});
