#!/usr/bin/env python3
"""Synthetic browser acceptance, NOT real backend, staging or production.
Runs exported Expo static site against a disposable loopback-only HTTP stub.
No credentials, emails, persistent learner data, deployments or outbound APIs.
"""
import json
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[2] / "mobile" / "dist"
assert (ROOT / "index.html").exists(), "run npx expo export --platform web first"

def doc(who):
    email = f"{who}@qa.invalid"
    return {
        "version": 1, "updatedAt": "2026-11-10T12:00:00.000Z",
        "user": {"username": f"qa-{who}", "email": email},
        "reviewCards": [], "reviewLogs": [],
        "libraryDecks": ([{"deckId": "deck_topik1_level1",
                          "addedAt": "2026-11-10T11:00:00.000Z"}] if who == "a" else []),
        "streak": None, "settings": None, "dailyLearned": {},
    }

state = {"a": {"version": 1, "payload": doc("a")},
         "b": {"version": 0, "payload": None}}
requests = []

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        # No raw request bodies, bearer tokens, credentials or PII in logs.
        pass

    def emit(self, obj, status=200):
        raw = json.dumps(obj).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(raw)

    def account(self):
        token = self.headers.get("Authorization", "")
        if token == "Bearer qa-token-a":
            return "a"
        if token == "Bearer qa-token-b":
            return "b"
        return None

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/sync/pull":
            who = self.account()
            if not who:
                self.emit({"ok": False, "error": "unauthorized"}, 401)
                return
            record = state[who]
            requests.append(("pull", who))
            self.emit({"ok": True, "version": record["version"],
                       "updatedAt": None, "payload": record["payload"]})
            return
        # Expo static page fallback.
        rel = path.lstrip("/")
        if not rel or not (ROOT / rel).is_file():
            self.path = "/index.html"
        return super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        raw = self.rfile.read(min(int(self.headers.get("Content-Length", 0)), 3000000))
        try:
            obj = json.loads(raw)
        except (ValueError, UnicodeDecodeError):
            obj = {}
        if path == "/api/auth/request-code":
            self.emit({"ok": True, "delivery": "email"})
            return
        if path == "/api/auth/verify-code":
            email = str(obj.get("email", ""))
            who = "a" if email == "a@qa.invalid" else "b" if email == "b@qa.invalid" else None
            if not who or obj.get("code") != "123456":
                self.emit({"ok": False, "error": "invalid-code"}, 401)
                return
            self.emit({"ok": True, "token": f"qa-token-{who}",
                       "user": {"id": f"qa-account-{who}", "email": email,
                                "username": f"qa-{who}", "hasPassword": True}})
            return
        if path == "/api/auth/logout":
            self.emit({"ok": True})
            return
        if path == "/api/sync/push":
            who = self.account()
            if not who:
                self.emit({"ok": False, "error": "unauthorized"}, 401)
                return
            current = state[who]
            current["version"] += 1
            current["payload"] = obj.get("payload")
            requests.append(("push", who))
            self.emit({"ok": True, "version": current["version"]})
            return
        if path == "/api/auth/set-password":
            self.emit({"ok": True})
            return
        self.emit({"ok": False, "error": "unsupported"}, 404)


def login(page, who):
    page.get_by_placeholder("you@example.com").fill(f"{who}@qa.invalid")
    page.get_by_text("Send code", exact=True).click()
    expect(page.get_by_text("Check your email")).to_be_visible(timeout=10000)
    page.get_by_placeholder("123456").fill("123456")
    page.get_by_text("Verify", exact=True).click()
    # The synthetic server reports an existing password for both accounts.
    expect(page.get_by_text(f"qa-{who}", exact=True).first).to_be_visible(timeout=12000)


def main():
    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_address[1]}"
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
            page = browser.new_page(viewport={"width": 1280, "height": 800})
            page.goto(base + "/", wait_until="domcontentloaded")
            expect(page.get_by_text("Welcome to Munpro!")).to_be_visible(timeout=15000)
            print("PASS browser loads exported web build and auth screen")
            login(page, "a")
            print("PASS synthetic account A signs in through rendered email-code flow")
            page.wait_for_timeout(800)
            # Profile's logout action goes through the real layout callback.
            page.get_by_text("Log out (qa-a)", exact=True).click()
            expect(page.get_by_text("Welcome to Munpro!")).to_be_visible(timeout=12000)
            print("PASS rendered logout returns to auth screen")
            login(page, "b")
            print("PASS synthetic account B signs in")
            # B must NOT see A's deck via stale in-memory document.
            expect(page.get_by_text(
                "No decks in your library yet — add one to start learning.",
                exact=False)).to_be_visible(timeout=12000)
            print("PASS B dashboard is isolated from A's server-seeded library")
            page.reload(wait_until="domcontentloaded")
            expect(page.get_by_text("qa-b", exact=True).first).to_be_visible(timeout=12000)
            print("PASS account B survives reload in isolated browser profile")
            assert not (state["b"]["payload"] and state["b"]["payload"].get("libraryDecks")), (
                "synthetic B backend acquired account A library deck via cross-account sync")
            print("PASS B backend snapshot did not acquire A library")
            print("SUMMARY browser smoke success; backend is a loopback stub, NOT real/staging.")
            browser.close()
    finally:
        server.shutdown()


if __name__ == "__main__":
    main()
