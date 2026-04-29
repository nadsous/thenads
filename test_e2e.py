from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()

    console_msgs = []
    page.on("console", lambda msg: console_msgs.append(f"[{msg.type}] {msg.text}"))
    page.on("pageerror", lambda err: console_msgs.append(f"[pageerror] {err}"))

    print(">>> Step 1: Home page")
    page.goto("http://localhost:3737/", wait_until="networkidle")
    page.wait_for_timeout(1500)
    page.screenshot(path="/tmp/01_home.png", full_page=True)
    cards = page.locator("a[href^='/trips/']").all()
    print(f"  trip cards found: {len(cards)}")
    for c in cards:
        try:
            txt = c.inner_text(timeout=1000)
            print(f"  - {txt[:60]!r}")
        except Exception:
            pass

    print(">>> Step 2: Click first trip card -> password gate")
    if cards:
        cards[0].click()
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(800)
        page.screenshot(path="/tmp/02_password.png", full_page=True)
        url = page.url
        print(f"  url: {url}")
        has_pw = page.locator("input[type='password']").count()
        print(f"  password input count: {has_pw}")

        if has_pw:
            print(">>> Step 3: Enter password")
            page.fill("input[type='password']", "budapest25")
            page.screenshot(path="/tmp/03_password_filled.png", full_page=True)
            page.click("button[type='submit']")
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(3000)
            page.screenshot(path="/tmp/04_map.png", full_page=True)

            day_buttons = page.locator("button:has-text('Jour')").count()
            print(f"  day pills found: {day_buttons}")

            map_canvas = page.locator(".maplibregl-canvas").count()
            print(f"  map canvas: {map_canvas}")

            walk_toggle = page.locator("button:has-text('À pied')").count()
            transit_toggle = page.locator("button:has-text('Transport')").count()
            print(f"  walk toggle: {walk_toggle}, transit toggle: {transit_toggle}")

            place_buttons = page.locator("button:has-text('Bastion'), button:has-text('Funiculaire'), button:has-text('Parlement')").count()
            print(f"  place buttons (Bastion/Funi/Parlement): {place_buttons}")

            # Try clicking second day pill
            if day_buttons >= 2:
                page.locator("button:has-text('Jour')").nth(1).click()
                page.wait_for_timeout(1500)
                page.screenshot(path="/tmp/05_day2.png", full_page=True)

            # Try clicking walk -> transit toggle
            if transit_toggle:
                page.locator("button:has-text('Transport')").click()
                page.wait_for_timeout(800)
                page.screenshot(path="/tmp/06_transit.png", full_page=True)

            # Click rainy panel button
            cloud_btn = page.locator("button[title='En cas de pluie']")
            if cloud_btn.count():
                cloud_btn.click()
                page.wait_for_timeout(800)
                page.screenshot(path="/tmp/07_rainy.png", full_page=True)

    print("\n--- Console messages ---")
    for m in console_msgs[-30:]:
        print(m)

    browser.close()
print("DONE")
