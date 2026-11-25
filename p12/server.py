"""HTTP server for the NAS / Docker deployment.

Serves the web designer and forwards print jobs to the printer:
  GET  /api/info    -> {"printer": bool, "target": "..."}
  GET  /api/status  -> {"battery": ..., "paper": ..., ...}
  POST /api/print   body = raw P12 job bytes (built by the browser's encoder)

Bridge mode (`python -m p12 bridge`) runs on a small Bluetooth-capable box near the printer,
such as a Raspberry Pi, and relays TCP to the printer. That covers NASes without Bluetooth.
"""
from __future__ import annotations

import json
import os
import socket
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from . import protocol
from .transport import Connection

WEB_DIR = Path(os.environ.get("P12_WEB_DIR", Path(__file__).resolve().parent.parent / "web"))
MAX_JOB = 8 * 1024 * 1024
_lock = threading.Lock()  # one conversation with the printer at a time


def query_status(target: str) -> dict:
    with _lock, Connection(target) as c:
        out = {}
        for q in (*protocol.CONNECT_HANDSHAKE, protocol.GET_BATTERY, protocol.GET_FIRMWARE):
            c.write(q)
            for k, v in protocol.parse_status(c.read(0.5)):
                out[k] = v
        return out


def send_job(target: str, job: bytes) -> dict:
    with _lock, Connection(target) as c:
        c.write(job)
        events = dict(protocol.parse_status(c.read(2.0)))
        return events


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, cfg, **kw):
        self.cfg = cfg
        super().__init__(*a, directory=str(WEB_DIR), **kw)

    def log_message(self, fmt, *args):
        if self.path.startswith("/api/"):
            super().log_message(fmt, *args)

    def _json(self, code: int, obj) -> None:
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/api/info":
            return self._json(200, {"printer": bool(self.cfg["printer"]), "target": self.cfg["printer"] or ""})
        if self.path == "/api/status":
            if not self.cfg["printer"]:
                return self._json(503, {"error": "PRINTER is not configured"})
            try:
                return self._json(200, query_status(self.cfg["printer"]))
            except Exception as e:  # noqa: BLE001 - report any connection failure to the UI
                return self._json(502, {"error": f"{type(e).__name__}: {e}"})
        return super().do_GET()

    def do_POST(self):
        if self.path != "/api/print":
            return self._json(404, {"error": "not found"})
        if not self.cfg["printer"]:
            return self._json(503, {"error": "PRINTER is not configured"})
        n = int(self.headers.get("Content-Length") or 0)
        if not 0 < n <= MAX_JOB:
            return self._json(400, {"error": "empty or oversized job"})
        job = self.rfile.read(n)
        if not job.startswith((b"\x1b\x40", b"\x1f\x11\x02")):
            return self._json(400, {"error": "not a P12 job"})
        try:
            return self._json(200, {"ok": True, "bytes": n, "events": send_job(self.cfg["printer"], job)})
        except Exception as e:  # noqa: BLE001
            return self._json(502, {"error": f"{type(e).__name__}: {e}"})


def serve(host: str, port: int, printer: str | None) -> None:
    cfg = {"printer": printer}
    httpd = ThreadingHTTPServer((host, port), partial(Handler, cfg=cfg))
    print(f"P12 Label Studio on http://{host}:{port}  printer={printer or '(none: browser Web Serial only)'}", flush=True)
    httpd.serve_forever()


def bridge(listen_host: str, listen_port: int, printer: str) -> None:
    """Relay one TCP client at a time to the printer, in both directions."""
    srv = socket.create_server((listen_host, listen_port), reuse_port=False)
    print(f"bridge tcp://{listen_host}:{listen_port} -> {printer}", flush=True)
    while True:
        client, addr = srv.accept()
        print("client", addr, flush=True)
        try:
            with client, Connection(printer) as dev:
                stop = threading.Event()

                def up():
                    while not stop.is_set():
                        data = dev.read(0.3)
                        if data:
                            try:
                                client.sendall(data)
                            except OSError:
                                break

                t = threading.Thread(target=up, daemon=True)
                t.start()
                while chunk := client.recv(65536):
                    dev.write(chunk)
                stop.set()
                t.join(1)
        except Exception as e:  # noqa: BLE001
            print("bridge error:", e, flush=True)
