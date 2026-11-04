<?php

namespace App\Enums;

/**
 * The places the site's logo is managed from the CMS. Each slot has its own
 * upload, its own file rules and its own built-in default (the bundled image
 * used when nothing has been uploaded, or after a reset).
 */
enum LogoSlot: string
{
    case Site = 'site';
    case Admin = 'admin';
    case Favicon = 'favicon';

    public function label(): string
    {
        return match ($this) {
            self::Site => 'Storefront logo',
            self::Admin => 'Admin & login logo',
            self::Favicon => 'Browser tab icon (favicon)',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Site => 'Shown next to the brand name in the storefront header and above the copyright line in the footer.',
            self::Admin => 'Shown at the top of this admin sidebar, in the mobile admin header and on the admin login page.',
            self::Favicon => 'The small icon in the browser tab, bookmarks and search results, and the icon used when the site is added to a phone home screen.',
        };
    }

    /**
     * Side length, in pixels, of the square image the CMS asks for. For the
     * favicon this is the recommended size of the upload - the server makes
     * the 48, 192 and 180 pixel versions browsers need from it.
     *
     * @return int<1, max>
     */
    public function size(): int
    {
        return match ($this) {
            self::Site, self::Admin => 256,
            self::Favicon => 512,
        };
    }

    /**
     * File extensions accepted for an upload (validated by real mime type).
     *
     * @return list<string>
     */
    public function formats(): array
    {
        return match ($this) {
            self::Site, self::Admin => ['webp', 'png', 'jpg', 'jpeg'],
            self::Favicon => ['png', 'webp', 'jpg', 'jpeg'],
        };
    }

    /**
     * The format the CMS recommends uploading - anything else is converted.
     */
    public function recommendedFormat(): string
    {
        return match ($this) {
            self::Site, self::Admin => 'WebP',
            self::Favicon => 'PNG',
        };
    }
}
