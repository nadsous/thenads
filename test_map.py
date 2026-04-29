from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()

    errors = []
    page.on("pageerror", lambda err: errors.append(f"[pageerror] {err}"))
    page.on("requestfailed", lambda req: errors.append(f"[reqfailed] {req.url} :: {req.failure}"))

    # Login first
    page.goto("http://localhost:3737/", wait_until="networkidle")
    page.click("a[href^='/trips/']")
    page.wait_for_selector("input[type='password']")
    page.fill("input[type='password']", "budapest25")
    page.click("button[type='submit']")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(6000)  # give map time

    # Inspect map container
    info = page.evaluate("""() => {
      const c = document.querySelectorAll('.maplibregl-canvas');
      const r = document.querySelectorAll('.maplibregl-map');
      const containers = Array.from(r).map(el => {
        const b = el.getBoundingClientRect();
        return { w: b.width, h: b.height, x: b.x, y: b.y };
      });
      return { canvases: c.length, maps: r.length, sizes: containers };
    }""")
    print("MAP INFO:", info)

    page.screenshot(path="/tmp/map_test.png", full_page=True)

    print("\nERRORS:")
    for e in errors[-20:]:
        print(e)

    browser.close()
