<?php

use App\Enums\LogoSlot;
use App\Models\Logo;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake(Logo::DISK);
});

function storedSize(string $path): array
{
    $info = getimagesizefromstring(Storage::disk(Logo::DISK)->get($path));

    return [$info[0], $info[1]];
}

test('the logo page lists the three slots with their rules and no uploads yet', function () {
    $this->actingAsAdmin();

    $this->get(route('admin.logos.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/logos/index')
            ->where('maxKb', 1024)
            ->has('slots', 3)
            ->where('slots.0.key', 'site')
            ->where('slots.0.size', 256)
            ->where('slots.0.image_url', null)
            ->where('slots.1.key', 'admin')
            ->where('slots.2.key', 'favicon')
            ->where('slots.2.size', 512)
            ->where('slots.2.recommended_format', 'PNG'));
});

test('the logo page keeps the shared logos prop that every page uses', function () {
    $this->actingAsAdmin();
    Logo::factory()->forSlot(LogoSlot::Admin)->create(['image_path' => 'logos/a.webp']);

    $this->get(route('admin.logos.index'))->assertInertia(fn ($page) => $page
        ->where('logos.admin', Storage::disk(Logo::DISK)->url('logos/a.webp'))
        ->where('logos.site', null)
        ->where('slots.1.image_url', Storage::disk(Logo::DISK)->url('logos/a.webp')));
});

test('a logo that already has the right size and format is stored untouched', function () {
    $this->actingAsAdmin();
    $file = UploadedFile::fake()->image('logo.webp', 256, 256);
    $original = file_get_contents($file->getRealPath());

    $this->post(route('admin.logos.update', 'site'), ['image' => $file])->assertRedirect();

    $logo = Logo::query()->where('slot', LogoSlot::Site)->firstOrFail();
    expect(Storage::disk(Logo::DISK)->get($logo->image_path))->toBe($original)
        ->and($logo->variants)->toBeNull();
});

test('a logo of another size is fitted inside a transparent square, never cropped', function () {
    $this->actingAsAdmin();

    $this->post(route('admin.logos.update', 'admin'), [
        'image' => UploadedFile::fake()->image('wide.png', 800, 400),
    ])->assertRedirect();

    $logo = Logo::query()->where('slot', LogoSlot::Admin)->firstOrFail();
    expect($logo->image_path)->toEndWith('.webp')
        ->and(storedSize($logo->image_path))->toBe([256, 256]);

    // 800x400 fits as 256x128, so the top row is padding and the middle is the logo.
    $image = imagecreatefromstring(Storage::disk(Logo::DISK)->get($logo->image_path));
    expect((imagecolorat($image, 128, 2) >> 24) & 0x7F)->toBeGreaterThan(100)
        ->and((imagecolorat($image, 128, 128) >> 24) & 0x7F)->toBeLessThan(20);
});

test('a small logo is scaled up to the fixed size', function () {
    $this->actingAsAdmin();

    $this->post(route('admin.logos.update', 'site'), [
        'image' => UploadedFile::fake()->image('tiny.jpg', 64, 64),
    ])->assertRedirect();

    expect(storedSize(Logo::query()->firstOrFail()->image_path))->toBe([256, 256]);
});

test('an upload creates the logo for its slot only, and replacing it swaps the file', function () {
    $this->actingAsAdmin();

    $this->post(route('admin.logos.update', 'site'), ['image' => UploadedFile::fake()->image('a.png', 300, 300)]);
    $first = Logo::query()->where('slot', LogoSlot::Site)->firstOrFail()->image_path;

    $this->post(route('admin.logos.update', 'site'), ['image' => UploadedFile::fake()->image('b.png', 300, 300)]);

    expect(Logo::query()->count())->toBe(1);
    $second = Logo::query()->firstOrFail()->image_path;
    expect($second)->not->toBe($first);
    Storage::disk(Logo::DISK)->assertMissing($first);
    Storage::disk(Logo::DISK)->assertExists($second);
});

test('a favicon upload generates the 48, 192 and apple touch icons as PNGs', function () {
    $this->actingAsAdmin();

    $this->post(route('admin.logos.update', 'favicon'), [
        'image' => UploadedFile::fake()->image('icon.png', 512, 512),
    ])->assertRedirect();

    $logo = Logo::query()->where('slot', LogoSlot::Favicon)->firstOrFail();
    expect(array_keys($logo->variants))->toBe(['icon_48', 'icon_192', 'apple'])
        ->and($logo->image_path)->toBe($logo->variants['icon_192'])
        ->and(storedSize($logo->variants['icon_48']))->toBe([48, 48])
        ->and(storedSize($logo->variants['icon_192']))->toBe([192, 192])
        ->and(storedSize($logo->variants['apple']))->toBe([180, 180]);

    foreach ($logo->variants as $path) {
        expect($path)->toEndWith('.png');
        Storage::disk(Logo::DISK)->assertExists($path);
    }
});

test('replacing a favicon removes every old generated file', function () {
    $this->actingAsAdmin();
    $this->post(route('admin.logos.update', 'favicon'), ['image' => UploadedFile::fake()->image('a.png', 512, 512)]);
    $old = Logo::query()->firstOrFail()->paths();

    $this->post(route('admin.logos.update', 'favicon'), ['image' => UploadedFile::fake()->image('b.png', 512, 512)]);

    foreach ($old as $path) {
        Storage::disk(Logo::DISK)->assertMissing($path);
    }
});

test('only the accepted formats are allowed', function (string $slot, string $name, string $mime) {
    $this->actingAsAdmin();

    $this->post(route('admin.logos.update', $slot), [
        'image' => UploadedFile::fake()->create($name, 10, $mime),
    ])->assertSessionHasErrors('image');

    expect(Logo::query()->count())->toBe(0);
})->with([
    'site svg' => ['site', 'x.svg', 'image/svg+xml'],
    'site gif' => ['site', 'x.gif', 'image/gif'],
    'admin pdf' => ['admin', 'x.pdf', 'application/pdf'],
    'favicon ico' => ['favicon', 'x.ico', 'image/x-icon'],
    'favicon svg' => ['favicon', 'x.svg', 'image/svg+xml'],
]);

test('an upload needs an image', function () {
    $this->actingAsAdmin();

    $this->post(route('admin.logos.update', 'site'), [])->assertSessionHasErrors('image');
});

test('an upload larger than 1 MB is rejected and 1 MB exactly is accepted', function () {
    $this->actingAsAdmin();

    $this->post(route('admin.logos.update', 'site'), [
        'image' => UploadedFile::fake()->image('big.png', 100, 100)->size(1025),
    ])->assertSessionHasErrors('image');

    $this->post(route('admin.logos.update', 'site'), [
        'image' => UploadedFile::fake()->image('edge.png', 100, 100)->size(1024),
    ])->assertSessionDoesntHaveErrors();
});

test('an unknown slot is a 404', function () {
    $this->actingAsAdmin();

    $this->post(route('admin.logos.update', 'nope'), ['image' => UploadedFile::fake()->image('a.png')])->assertNotFound();
    $this->delete(route('admin.logos.destroy', 'nope'))->assertNotFound();
});

test('resetting a logo deletes the upload and its files', function () {
    $this->actingAsAdmin();
    $this->post(route('admin.logos.update', 'favicon'), ['image' => UploadedFile::fake()->image('a.png', 512, 512)]);
    $paths = Logo::query()->firstOrFail()->paths();

    $this->delete(route('admin.logos.destroy', 'favicon'))->assertRedirect();

    expect(Logo::query()->count())->toBe(0);
    foreach ($paths as $path) {
        Storage::disk(Logo::DISK)->assertMissing($path);
    }
});

test('resetting a logo that was never uploaded is harmless', function () {
    $this->actingAsAdmin();

    $this->delete(route('admin.logos.destroy', 'site'))->assertRedirect();
});

test('a non-admin cannot manage logos', function () {
    $this->actingAs(User::factory()->create(['is_admin' => false]));

    $this->get(route('admin.logos.index'))->assertForbidden();
    $this->post(route('admin.logos.update', 'site'), ['image' => UploadedFile::fake()->image('a.png')])->assertForbidden();
    $this->delete(route('admin.logos.destroy', 'site'))->assertForbidden();
    expect(Logo::query()->count())->toBe(0);
});

test('a guest is sent to log in', function () {
    $this->get(route('admin.logos.index'))->assertRedirect(route('login'));
});

test('uploaded logos reach the storefront as shared props, null when not uploaded', function () {
    $this->get(route('home'))->assertInertia(fn ($page) => $page
        ->where('logos.site', null)
        ->where('logos.admin', null));

    Logo::factory()->forSlot(LogoSlot::Site)->create(['image_path' => 'logos/s.webp']);

    $this->get(route('home'))->assertInertia(fn ($page) => $page
        ->where('logos.site', Storage::disk(Logo::DISK)->url('logos/s.webp'))
        ->where('logos.admin', null));
});

test('the page head uses the uploaded favicon files, else the bundled icons', function () {
    $this->get(route('home'))
        ->assertSee('/favicon.svg', false)
        ->assertSee('/apple-touch-icon.png', false);

    Logo::factory()->forSlot(LogoSlot::Favicon)->create([
        'image_path' => 'logos/f192.png',
        'variants' => ['icon_48' => 'logos/f48.png', 'icon_192' => 'logos/f192.png', 'apple' => 'logos/fa.png'],
    ]);

    $this->get(route('home'))
        ->assertSee(Storage::disk(Logo::DISK)->url('logos/f48.png'), false)
        ->assertSee(Storage::disk(Logo::DISK)->url('logos/fa.png'), false)
        ->assertDontSee('/favicon.svg', false)
        ->assertDontSee('/apple-touch-icon.png', false);
});

test('the site still loads if the logos table does not exist yet (mid-deploy)', function () {
    Schema::drop('logos');
    Logo::flushCache();

    $this->get(route('home'))->assertOk()->assertSee('/favicon.svg', false);
});
