<?php

namespace App\Support;

class YouTube
{
    /**
     * Extract the 11-character video ID from any common YouTube URL shape
     * (watch?v=, youtu.be/, embed/, shorts/), or null if the URL isn't a
     * recognizable YouTube video link.
     */
    public static function extractVideoId(?string $url): ?string
    {
        if ($url === null || trim($url) === '') {
            return null;
        }

        $parts = parse_url(trim($url));

        if ($parts === false || ! isset($parts['host'])) {
            return null;
        }

        $host = strtolower($parts['host']);

        if (! str_contains($host, 'youtube.com') && ! str_contains($host, 'youtu.be')) {
            return null;
        }

        $path = $parts['path'] ?? '';

        if (str_contains($host, 'youtu.be')) {
            return self::validId(ltrim($path, '/'));
        }

        if (preg_match('#^/(?:embed|shorts)/([^/]+)#', $path, $matches) === 1) {
            return self::validId($matches[1]);
        }

        if (isset($parts['query'])) {
            parse_str($parts['query'], $query);

            if (isset($query['v']) && is_string($query['v'])) {
                return self::validId($query['v']);
            }
        }

        return null;
    }

    private static function validId(string $id): ?string
    {
        return preg_match('/^[A-Za-z0-9_-]{11}$/', $id) === 1 ? $id : null;
    }
}
