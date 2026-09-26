"""Serve the static export (`out/`) under the GH Pages basePath, exactly as it ships.

    python scripts/serve-out.py [port]   ->  http://127.0.0.1:<port>/zzz-dashboard-next/

For visual QA of a production build when `npm run dev` isn't an option (Turbopack panics with
"Insufficient system resources" when the box is busy — seen 2026-09-25 with ZZZ + a browser up).
Run `npm run build` first; this just serves what it wrote.
"""
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "out")
BASE = "/zzz-dashboard-next"


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=OUT, **kw)

    def translate_path(self, path):
        if path.startswith(BASE):
            path = path[len(BASE):] or "/"
        return super().translate_path(path)

    def log_message(self, fmt, *args):
        sys.stdout.write("%s\n" % (fmt % args))
        sys.stdout.flush()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 4374
print(f"serving {os.path.normpath(OUT)} at http://127.0.0.1:{port}{BASE}/", flush=True)
ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
