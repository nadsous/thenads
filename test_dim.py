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
    page.wait_for_timeout(4000)

    info = page.evaluate("""() => {
      const html = document.documentElement.getBoundingClientRect();
      const body = document.body.getBoundingClientRect();
      const root = document.querySelector('main')?.getBoundingClientRect() || null;
      // Find the map wrapper (has bg-[#08070f])
      const wrappers = Array.from(document.querySelectorAll('div')).filter(
        el => el.className && typeof el.className === 'string' && el.className.includes('rounded-2xl') && el.className.includes('overflow-hidden') && el.className.includes('border-white/10')
      );
      const wrapperBoxes = wrappers.map(el => {
        const r = el.getBoundingClientRect();
        return { w: r.width, h: r.height, cls: el.className.slice(0, 80) };
      });
      const maps = Array.from(document.querySelectorAll('.maplibregl-map')).map(el => {
        const r = el.getBoundingClientRect();
        return { w: r.width, h: r.height };
      });
      return { html: {w: html.width, h: html.height}, body: {w: body.width, h: body.height}, wrapperBoxes, maps };
    }""")
    print("DIMS:", info)

    browser.close()
