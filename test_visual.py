import os
out = os.path.join(os.path.dirname(__file__), "_screenshots")
os.makedirs(out, exist_ok=True)

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # Desktop
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    page.goto("http://localhost:3737/", wait_until="networkidle")
    page.wait_for_timeout(800)
    page.screenshot(path=os.path.join(out, "01_home.png"), full_page=False)

    page.click("a[href^='/trips/']")
    page.wait_for_selector("input[type='password']")
    page.screenshot(path=os.path.join(out, "02_password.png"), full_page=False)
    page.fill("input[type='password']", "budapest25")
    page.click("button[type='submit']")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(6000)
    page.screenshot(path=os.path.join(out, "03_map_day1.png"), full_page=False)

    # Click second day
    day2 = page.locator("button:has-text('Buda & Parlement')").first
    if day2.count():
        day2.click()
        page.wait_for_timeout(3000)
        page.screenshot(path=os.path.join(out, "04_day2_buda.png"), full_page=False)

    # Click a place
    btn = page.locator("button:has-text('Bastion')").first
    if btn.count():
        btn.click()
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(out, "05_detail.png"), full_page=False)

    # Switch to transit mode
    transit_btn = page.locator("button:has-text('Transport')").first
    if transit_btn.count():
        # close detail first
        close_btn = page.locator("button[type='button']").filter(has_text="").nth(0)
        page.keyboard.press("Escape")  # may not close, ok
        transit_btn.click()
        page.wait_for_timeout(2500)
        page.screenshot(path=os.path.join(out, "06_transit.png"), full_page=False)

    # Open rainy
    cloud_btn = page.locator("button[title='En cas de pluie']")
    if cloud_btn.count():
        cloud_btn.click()
        page.wait_for_timeout(800)
        page.screenshot(path=os.path.join(out, "07_rainy.png"), full_page=False)

    page.close()

    # Mobile
    context2 = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    page2 = context2.new_page()
    page2.goto("http://localhost:3737/", wait_until="networkidle")
    page2.wait_for_timeout(800)
    page2.screenshot(path=os.path.join(out, "10_mobile_home.png"), full_page=False)

    page2.click("a[href^='/trips/']")
    page2.wait_for_selector("input[type='password']")
    page2.fill("input[type='password']", "budapest25")
    page2.click("button[type='submit']")
    page2.wait_for_load_state("networkidle")
    page2.wait_for_timeout(6000)
    page2.screenshot(path=os.path.join(out, "11_mobile_map.png"), full_page=False)

    btn2 = page2.locator("button:has-text('Funiculaire'), button:has-text('Bastion')").first
    if btn2.count():
        btn2.click()
        page2.wait_for_timeout(1500)
        page2.screenshot(path=os.path.join(out, "12_mobile_detail.png"), full_page=False)

    browser.close()

print(f"DONE -> {out}")
