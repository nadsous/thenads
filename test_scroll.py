import os
out = os.path.join(os.path.dirname(__file__), "_screenshots")

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    page.goto("http://localhost:3737/", wait_until="networkidle")
    page.click("a[href^='/trips/']")
    page.wait_for_selector("input[type='password']")
    page.fill("input[type='password']", "budapest25")
    page.click("button[type='submit']")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(5000)

    # day 2
    page.locator("button:has-text('Buda & Parlement')").first.click()
    page.wait_for_timeout(2500)

    # click bastion
    page.locator("button:has-text('Bastion des Pêcheurs')").first.click()
    page.wait_for_timeout(1500)

    # screenshot full panel
    panel = page.locator("aside").first
    panel.scroll_into_view_if_needed()
    page.screenshot(path=os.path.join(out, "20_detail_top.png"), full_page=False)

    # Try to scroll inside the panel scrollable div
    page.evaluate("""() => {
      const a = document.querySelector('aside');
      if (a) {
        const scrollable = a.querySelector('.overflow-y-auto');
        if (scrollable) scrollable.scrollTop = scrollable.scrollHeight;
      }
    }""")
    page.wait_for_timeout(500)
    page.screenshot(path=os.path.join(out, "21_detail_scroll.png"), full_page=False)

    browser.close()

print("DONE")
