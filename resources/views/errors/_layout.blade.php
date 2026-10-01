<!DOCTYPE html>
<html lang="bn">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ $code }} — {{ config('app.name', 'Ababil') }}</title>
        <link rel="icon" href="/favicon.ico" sizes="any">
        <style>
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
                font-family: 'Hind Siliguri', 'Segoe UI', system-ui, sans-serif;
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
                width: 56px;
                height: 56px;
                border-radius: 14px;
                background: #1c1917;
                color: #fbbf24;
                font-weight: 700;
                font-size: 20px;
                margin-bottom: 20px;
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
                padding: 12px 28px;
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
        </style>
    </head>
    <body>
        <div class="card">
            <span class="badge">আ</span>
            <div class="code">Error {{ $code }}</div>
            <h1>{{ $title }}</h1>
            <p>{{ $message }}</p>
            <a class="btn" href="{{ url('/') }}">হোমপেজে ফিরে যান</a>
        </div>
    </body>
</html>
