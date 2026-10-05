<!DOCTYPE html>
<html lang="bn">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ $code }} — {{ config('app.name', 'Ababil') }}</title>
        <link rel="icon" href="/favicon.ico" sizes="any">
        <style>
            @font-face {
                font-family: 'Kalpurush';
                src: url('/fonts/kalpurush.ttf') format('truetype');
                font-weight: 400 700;
                font-display: swap;
            }

            :root {
                color-scheme: light;
            }

            * {
                box-sizing: border-box;
            }

            body {
                margin: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px;
                font-family: 'Kalpurush', 'Hind Siliguri', 'Segoe UI', system-ui, sans-serif;
                background: radial-gradient(circle at 50% 0%, #fde68a 0%, #fbbf24 45%, #f59e0b 100%);
                color: #1c1917;
            }

            .card {
                width: 100%;
                max-width: 460px;
                background: #fffbeb;
                border: 1px solid #fde68a;
                border-radius: 24px;
                padding: 40px 32px;
                text-align: center;
                box-shadow: 0 30px 60px -20px rgba(120, 72, 0, 0.35);
            }

            .badge {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 64px;
                height: 64px;
                border-radius: 16px;
                background: #1c1917;
                color: #fbbf24;
                margin-bottom: 20px;
            }

            .badge svg {
                width: 30px;
                height: 30px;
            }

            .code {
                font-size: 14px;
                font-weight: 600;
                letter-spacing: 0.1em;
                color: #b45309;
                text-transform: uppercase;
            }

            h1 {
                font-size: 24px;
                font-weight: 700;
                margin: 8px 0 12px;
                color: #1c1917;
            }

            p {
                font-size: 15px;
                line-height: 1.6;
                color: #57534e;
                margin: 0 0 28px;
            }

            .btn {
                display: inline-block;
                width: 100%;
                padding: 14px 28px;
                border-radius: 10px;
                background: linear-gradient(90deg, #d97706, #eab308, #d97706);
                color: #1c1917;
                font-weight: 600;
                text-decoration: none;
                font-size: 15px;
            }

            .btn:hover {
                filter: brightness(1.05);
            }

            .btn:active {
                filter: brightness(0.95);
            }
        </style>
    </head>
    <body>
        <div class="card">
            <span class="badge">
                @switch($icon ?? 'alert-triangle')
                    @case('shield-x')
                        {{-- Access denied --}}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.35 8.95a1 1 0 0 1-1.3 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9.5 8.5 5 5"/><path d="m14.5 8.5-5 5"/></svg>
                        @break
                    @case('search-x')
                        {{-- Not found --}}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7"/><path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><path d="m21 21-4.3-4.3"/></svg>
                        @break
                    @case('clock')
                        {{-- Expired --}}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        @break
                    @case('hourglass')
                        {{-- Too many requests --}}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>
                        @break
                    @case('wrench')
                        {{-- Maintenance --}}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                        @break
                    @default
                        {{-- Generic server error --}}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                @endswitch
            </span>
            <div class="code">Error {{ $code }}</div>
            <h1>{{ $title }}</h1>
            <p>{{ $message }}</p>
            <a class="btn" id="back-link" href="{{ route('home') }}">হোমপেজে ফিরে যান</a>
        </div>
        <script>
            (function () {
                var link = document.getElementById('back-link');
                var ref = document.referrer;

                // If we got here from another page on this site, send the
                // visitor back to it (a fresh navigation, so it reloads)
                // instead of always bouncing to the storefront homepage.
                if (ref && ref.indexOf(window.location.origin) === 0 && ref !== window.location.href) {
                    link.href = ref;
                    link.textContent = 'আগের পেজে ফিরে যান';
                }
            })();
        </script>
    </body>
</html>
