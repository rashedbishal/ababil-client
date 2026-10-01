<?php

use App\Support\IpAddress;

test('a plain IPv4 address normalizes to itself', function () {
    expect(IpAddress::normalize('203.0.113.5'))->toBe('203.0.113.5');
});

test('an IPv4-mapped IPv6 address normalizes down to plain IPv4', function () {
    expect(IpAddress::normalize('::ffff:203.0.113.5'))->toBe('203.0.113.5');
});

test('a compressed and an expanded IPv6 literal normalize to the same value', function () {
    $compressed = IpAddress::normalize('2001:db8::1');
    $expanded = IpAddress::normalize('2001:0db8:0000:0000:0000:0000:0000:0001');

    expect($compressed)->toBe($expanded);
});

test('the loopback address normalizes consistently', function () {
    expect(IpAddress::normalize('0:0:0:0:0:0:0:1'))->toBe(IpAddress::normalize('::1'));
});

test('an unparseable value is returned unchanged', function () {
    expect(IpAddress::normalize('not-an-ip'))->toBe('not-an-ip');
});
