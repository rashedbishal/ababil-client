<?php

use App\Models\PartnerLogo;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake(PartnerLogo::DISK);
});

function partnerImageSize(string $path): array
{
    $info = getimagesizefromstring(Storage::disk(PartnerLogo::DISK)->get($path));

    return [$info[0], $info[1]];
}

test('the partner page shows the fixed heading, the rules and the logos in order', function () {
    $this->actingAsAdmin();
    PartnerLogo::factory()->create(['label' => 'B', 'sort_order' => 1]);
    PartnerLogo::factory()->create(['label' => 'A', 'sort_order' => 0]);
    PartnerLogo::factory()->inactive()->create(['label' => 'C', 'sort_order' => 2]);

    $this->get(route('admin.partners.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/partners/index')
            ->where('title', 'গুণগত মানে আস্থার প্রতিশ্রুতি')
            ->where('isVisible', true)
            ->where('imageSpec.size', 280)
            ->where('imageSpec.max_kb', 1024)
            ->where('labelMaxLength', 30)
            ->has('items', 3)
            ->where('items.0.label', 'A')
            ->where('items.1.label', 'B')
            ->where('items.2.is_active', false));
});

test('the section is reported hidden when empty or when every logo is hidden', function () {
    $this->actingAsAdmin();

    $this->get(route('admin.partners.index'))->assertInertia(fn ($page) => $page->where('isVisible', false));

    PartnerLogo::factory()->inactive()->create();

    $this->get(route('admin.partners.index'))->assertInertia(fn ($page) => $page
        ->where('isVisible', false)
        ->has('items', 1));
});

test('a logo that already has the right size and format is stored untouched', function () {
    $this->actingAsAdmin();
    $file = UploadedFile::fake()->image('cert.webp', 280, 280);
    $original = file_get_contents($file->getRealPath());

    $this->post(route('admin.partners.store'), ['image' => $file, 'label' => 'GMP', 'is_active' => true])
        ->assertRedirect();

    $item = PartnerLogo::query()->firstOrFail();
    expect(Storage::disk(PartnerLogo::DISK)->get($item->image_path))->toBe($original)
        ->and($item->label)->toBe('GMP')
        ->and($item->is_active)->toBeTrue()
        ->and($item->image_path)->toStartWith('partners/');
});

test('a logo of another size or format is converted to a fitted square webp', function () {
    $this->actingAsAdmin();

    $this->post(route('admin.partners.store'), [
        'image' => UploadedFile::fake()->image('wide.png', 900, 450),
        'label' => 'Wide',
    ])->assertRedirect();

    $item = PartnerLogo::query()->firstOrFail();
    expect($item->image_path)->toEndWith('.webp')
        ->and(partnerImageSize($item->image_path))->toBe([280, 280]);

    // 900x450 fits as 280x140: top row is transparent padding, middle is the logo.
    $image = imagecreatefromstring(Storage::disk(PartnerLogo::DISK)->get($item->image_path));
    expect((imagecolorat($image, 140, 2) >> 24) & 0x7F)->toBeGreaterThan(100)
        ->and((imagecolorat($image, 140, 140) >> 24) & 0x7F)->toBeLessThan(20);
});

test('new logos are appended to the end', function () {
    $this->actingAsAdmin();
    PartnerLogo::factory()->create(['sort_order' => 4]);

    $this->post(route('admin.partners.store'), [
        'image' => UploadedFile::fake()->image('a.webp', 100, 100),
        'label' => 'New',
    ]);

    expect(PartnerLogo::query()->where('label', 'New')->value('sort_order'))->toBe(5);
});

test('an upload needs an image and a label', function () {
    $this->actingAsAdmin();

    $this->post(route('admin.partners.store'), [])->assertSessionHasErrors(['image', 'label']);

    expect(PartnerLogo::query()->count())->toBe(0);
});

test('only webp, png and jpg are accepted', function (string $name, string $mime) {
    $this->actingAsAdmin();

    $this->post(route('admin.partners.store'), [
        'image' => UploadedFile::fake()->create($name, 10, $mime),
        'label' => 'x',
    ])->assertSessionHasErrors('image');
})->with([
    'gif' => ['x.gif', 'image/gif'],
    'svg' => ['x.svg', 'image/svg+xml'],
    'pdf' => ['x.pdf', 'application/pdf'],
]);

test('an upload larger than 1 MB is rejected and 1 MB exactly is accepted', function () {
    $this->actingAsAdmin();

    $this->post(route('admin.partners.store'), [
        'image' => UploadedFile::fake()->image('big.png', 100, 100)->size(1025),
        'label' => 'x',
    ])->assertSessionHasErrors('image');

    $this->post(route('admin.partners.store'), [
        'image' => UploadedFile::fake()->image('edge.png', 100, 100)->size(1024),
        'label' => 'x',
    ])->assertSessionDoesntHaveErrors();
});

test('a label longer than the cap is rejected and one at the cap is accepted', function () {
    $this->actingAsAdmin();
    $image = fn () => UploadedFile::fake()->image('a.webp', 100, 100);

    $this->post(route('admin.partners.store'), ['image' => $image(), 'label' => str_repeat('a', 31)])
        ->assertSessionHasErrors('label');
    $this->post(route('admin.partners.store'), ['image' => $image(), 'label' => str_repeat('a', 30)])
        ->assertSessionDoesntHaveErrors();

    expect(PartnerLogo::query()->count())->toBe(1);
});

test('an admin can edit a label without touching the image', function () {
    $this->actingAsAdmin();
    $item = PartnerLogo::factory()->create(['label' => 'Old', 'image_path' => 'partners/keep.webp']);
    Storage::disk(PartnerLogo::DISK)->put('partners/keep.webp', 'x');

    $this->patch(route('admin.partners.update', $item), ['label' => 'New', 'is_active' => true])->assertRedirect();

    expect($item->refresh()->label)->toBe('New')
        ->and($item->image_path)->toBe('partners/keep.webp');
    Storage::disk(PartnerLogo::DISK)->assertExists('partners/keep.webp');
});

test('replacing the image stores the new file and deletes the old one', function () {
    $this->actingAsAdmin();
    $item = PartnerLogo::factory()->create(['image_path' => 'partners/old.webp']);
    Storage::disk(PartnerLogo::DISK)->put('partners/old.webp', 'x');

    $this->post(route('admin.partners.update', $item), [
        '_method' => 'patch',
        'image' => UploadedFile::fake()->image('new.png', 300, 300),
        'label' => $item->label,
        'is_active' => true,
    ])->assertRedirect();

    $item->refresh();
    expect($item->image_path)->not->toBe('partners/old.webp');
    Storage::disk(PartnerLogo::DISK)->assertMissing('partners/old.webp');
    Storage::disk(PartnerLogo::DISK)->assertExists($item->image_path);
});

test('an admin can hide and show a logo', function () {
    $this->actingAsAdmin();
    $item = PartnerLogo::factory()->create();

    $this->patch(route('admin.partners.visibility', $item), ['is_active' => false])->assertRedirect();
    expect($item->refresh()->is_active)->toBeFalse();

    $this->patch(route('admin.partners.visibility', $item), ['is_active' => true])->assertRedirect();
    expect($item->refresh()->is_active)->toBeTrue();
});

test('logos can be moved earlier and later', function () {
    $this->actingAsAdmin();
    $a = PartnerLogo::factory()->create(['sort_order' => 0]);
    $b = PartnerLogo::factory()->create(['sort_order' => 1]);
    $c = PartnerLogo::factory()->create(['sort_order' => 2]);

    $this->post(route('admin.partners.move', $c), ['direction' => 'up'])->assertRedirect();

    expect($a->refresh()->sort_order)->toBe(0)
        ->and($c->refresh()->sort_order)->toBe(1)
        ->and($b->refresh()->sort_order)->toBe(2);

    $this->post(route('admin.partners.move', $c), ['direction' => 'down']);
    expect($b->refresh()->sort_order)->toBe(1)
        ->and($c->refresh()->sort_order)->toBe(2);
});

test('moving the first logo earlier or the last later changes nothing', function () {
    $this->actingAsAdmin();
    $a = PartnerLogo::factory()->create(['sort_order' => 0]);
    $b = PartnerLogo::factory()->create(['sort_order' => 1]);

    $this->post(route('admin.partners.move', $a), ['direction' => 'up'])->assertRedirect();
    $this->post(route('admin.partners.move', $b), ['direction' => 'down'])->assertRedirect();

    expect($a->refresh()->sort_order)->toBe(0)
        ->and($b->refresh()->sort_order)->toBe(1);
});

test('moving swaps correctly even when sort orders are tied', function () {
    $this->actingAsAdmin();
    $a = PartnerLogo::factory()->create(['sort_order' => 0]);
    $b = PartnerLogo::factory()->create(['sort_order' => 0]);

    $this->post(route('admin.partners.move', $b), ['direction' => 'up']);

    expect($b->refresh()->sort_order)->toBe(0)
        ->and($a->refresh()->sort_order)->toBe(1);
});

test('an admin can delete a logo and its file', function () {
    $this->actingAsAdmin();
    $item = PartnerLogo::factory()->create(['image_path' => 'partners/gone.webp']);
    Storage::disk(PartnerLogo::DISK)->put('partners/gone.webp', 'x');

    $this->delete(route('admin.partners.destroy', $item))->assertRedirect();

    expect(PartnerLogo::query()->count())->toBe(0);
    Storage::disk(PartnerLogo::DISK)->assertMissing('partners/gone.webp');
});

test('a non-admin cannot manage partner logos', function () {
    $this->actingAs(User::factory()->create(['is_admin' => false]));
    $item = PartnerLogo::factory()->create();

    $this->get(route('admin.partners.index'))->assertForbidden();
    $this->post(route('admin.partners.store'), [
        'image' => UploadedFile::fake()->image('a.webp'),
        'label' => 'x',
    ])->assertForbidden();
    $this->patch(route('admin.partners.visibility', $item), ['is_active' => false])->assertForbidden();
    $this->delete(route('admin.partners.destroy', $item))->assertForbidden();

    expect($item->refresh()->is_active)->toBeTrue();
});

test('a guest is sent to log in', function () {
    $this->get(route('admin.partners.index'))->assertRedirect(route('login'));
});
