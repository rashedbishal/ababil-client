<?php

use App\Support\YouTube;

test('extracts the video id from common youtube url shapes', function (string $url) {
    expect(YouTube::extractVideoId($url))->toBe('dQw4w9WgXcQ');
})->with([
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/watch?list=PL123&v=dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ?t=10',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
]);

test('rejects non-youtube or malformed urls', function (?string $url) {
    expect(YouTube::extractVideoId($url))->toBeNull();
})->with([
    null,
    '',
    'https://example.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/watch?v=tooshort',
    'not a url at all',
]);
