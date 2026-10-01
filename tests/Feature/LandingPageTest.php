<?php

test('the storefront landing page loads successfully', function () {
    $response = $this->get(route('home'));

    $response->assertOk();
});
