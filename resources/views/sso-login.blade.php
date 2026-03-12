<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Signing in…</title>
    <style>
        body { margin: 0; display: flex; align-items: center; justify-content: center;
               min-height: 100vh; background: #f3f4f6; font-family: sans-serif; }
        .card { background: #fff; border-radius: 12px; padding: 2.5rem 3rem;
                box-shadow: 0 4px 24px rgba(0,0,0,.10); text-align: center; }
        .spinner { width: 48px; height: 48px; border: 4px solid #e5e7eb;
                   border-top-color: #2563eb; border-radius: 50%;
                   animation: spin .8s linear infinite; margin: 0 auto 1.2rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
        h2 { color: #1f2937; margin: 0 0 .4rem; font-size: 1.2rem; }
        p  { color: #6b7280; margin: 0; font-size: .9rem; }
    </style>
</head>
<body>
    <div class="card">
        <div class="spinner"></div>
        <h2>Signing you in…</h2>
        <p>Please wait while we log you in to the Inventory system.</p>
    </div>

    <script>
        (function () {
            var token    = @json($token);
            var redirect = @json($redirect);
            var error    = @json($error ?? null);

            if (error || !token) {
                document.querySelector('h2').textContent = 'Login failed';
                document.querySelector('p').textContent  = error || 'No access token received.';
                document.querySelector('.spinner').style.display = 'none';
                return;
            }

            localStorage.setItem('access_token', token);

            setTimeout(function () {
                window.location.replace(redirect);
            }, 100);
        })();
    </script>
</body>
</html>
