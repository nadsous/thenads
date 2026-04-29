from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--use-gl=swiftshader", "--enable-webgl"])
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()

    requests = []
    def log_req(req):
        if any(x in req.url for x in ["carto", "openstreetmap", "tiles", ".pbf", ".png", "style.json"]):
            requests.append(f"REQ {req.method} {req.url[:120]}")
    def log_res(res):
        if any(x in res.url for x in ["carto", "openstreetmap", "tiles", ".pbf", ".png", "style.json"]):
            requests.append(f"RES {res.status} {res.url[:120]}")
    def log_fail(req):
        if any(x in req.url for x in ["carto", "openstreetmap", "tiles", ".pbf", ".png"]):
            requests.append(f"FAIL {req.url[:120]} :: {req.failure}")

    page.on("request", log_req)
    page.on("response", log_res)
    page.on("requestfailed", log_fail)

    page.goto("http://localhost:3737/", wait_until="networkidle")
    page.click("a[href^='/trips/']")
    page.wait_for_selector("input[type='password']")
    page.fill("input[type='password']", "budapest25")
    page.click("button[type='submit']")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(8000)

    # Check WebGL availability
    webgl = page.evaluate("""() => {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl2') || c.getContext('webgl');
      if (!gl) return 'NO WEBGL';
      return 'WEBGL ' + (gl.getParameter ? gl.getParameter(gl.VERSION) : 'unknown');
    }""")
    print("WEBGL:", webgl)

    print(f"\n{len(requests)} relevant requests:")
    for r in requests[:40]:
        print(r)

    browser.close()
