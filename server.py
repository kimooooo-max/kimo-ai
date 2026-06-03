#!/usr/bin/env python3
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import cgi
import json
import socket
import subprocess
import tempfile


ROOT = Path(__file__).resolve().parent
MAX_UPLOAD_BYTES = 12 * 1024 * 1024


class CardLedgerHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".webmanifest": "application/manifest+json",
        ".js": "application/javascript",
        ".svg": "image/svg+xml",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_POST(self):
        if self.path != "/api/ocr":
            self.send_error(HTTPStatus.NOT_FOUND, "Not found")
            return

        content_length = int(self.headers.get("content-length", "0") or "0")
        if content_length <= 0 or content_length > MAX_UPLOAD_BYTES:
            self.write_json(
                {"error": "이미지 용량은 12MB 이하만 처리할 수 있습니다."},
                HTTPStatus.BAD_REQUEST,
            )
            return

        form = cgi.FieldStorage(
            fp=self.rfile,
            headers=self.headers,
            environ={
                "REQUEST_METHOD": "POST",
                "CONTENT_TYPE": self.headers.get("content-type"),
                "CONTENT_LENGTH": str(content_length),
            },
        )

        upload = form["image"] if "image" in form else None
        if upload is None or not getattr(upload, "file", None):
            self.write_json({"error": "image 파일이 없습니다."}, HTTPStatus.BAD_REQUEST)
            return

        suffix = Path(upload.filename or "upload.png").suffix or ".png"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as image_file:
            image_file.write(upload.file.read())
            image_path = image_file.name

        try:
            try:
                completed = subprocess.run(
                    ["swift", str(ROOT / "ocr.swift"), image_path],
                    cwd=str(ROOT),
                    text=True,
                    capture_output=True,
                    timeout=90,
                    check=False,
                )
            except subprocess.TimeoutExpired:
                self.write_json({"error": "OCR 시간이 초과되었습니다."}, HTTPStatus.REQUEST_TIMEOUT)
                return
        finally:
            Path(image_path).unlink(missing_ok=True)

        if completed.returncode != 0:
            self.write_json(
                {"error": completed.stderr.strip() or "OCR 실행에 실패했습니다."},
                HTTPStatus.INTERNAL_SERVER_ERROR,
            )
            return

        self.write_json({"text": completed.stdout.strip()})

    def write_json(self, payload, status=HTTPStatus.OK):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main():
    host = "0.0.0.0"
    port = 4173
    server = ThreadingHTTPServer((host, port), CardLedgerHandler)
    print(f"Card Ledger server: http://127.0.0.1:{port}", flush=True)
    for ip_address in get_lan_ip_addresses():
        print(f"iPhone URL: http://{ip_address}:{port}", flush=True)
    server.serve_forever()


def get_lan_ip_addresses():
    addresses = set()
    try:
        hostname = socket.gethostname()
        for item in socket.getaddrinfo(hostname, None, socket.AF_INET):
            ip_address = item[4][0]
            if not ip_address.startswith("127."):
                addresses.add(ip_address)
    except OSError:
        pass
    return sorted(addresses)


if __name__ == "__main__":
    main()
