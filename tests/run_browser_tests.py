from __future__ import annotations

import subprocess
import sys
import tempfile
import shutil
from pathlib import Path


BROWSER_CANDIDATES = [
    Path(r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"),
    Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
    Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
    Path(r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"),
]


def find_browsers() -> list[Path]:
    return [candidate for candidate in BROWSER_CANDIDATES if candidate.exists()]


def main() -> int:
    browsers = find_browsers()
    if not browsers:
        print("No Chrome-compatible browser was found.")
        return 1

    test_page = Path(__file__).with_name("browser-tests.html").resolve()
    last_return_code = 1

    for browser in browsers:
        temp_dir = Path(tempfile.mkdtemp(prefix="blank-canvas-tests-"))

        try:
            command = [
                str(browser),
                "--headless=new",
                "--disable-gpu",
                "--disable-breakpad",
                "--disable-crash-reporter",
                "--disable-background-networking",
                "--no-first-run",
                "--no-default-browser-check",
                f"--user-data-dir={temp_dir}",
                "--allow-file-access-from-files",
                "--dump-dom",
                test_page.as_uri(),
            ]

            result = subprocess.run(command, capture_output=True, text=True, timeout=60)
            stdout = result.stdout or ""
            stderr = result.stderr or ""

            if stdout:
                print(stdout)
            if stderr:
                print(stderr, file=sys.stderr)

            if result.returncode == 0 and 'data-test-status="passed"' in stdout:
                return 0

            last_return_code = result.returncode or 1
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

    return last_return_code


if __name__ == "__main__":
    raise SystemExit(main())
