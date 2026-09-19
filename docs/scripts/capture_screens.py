import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "screens"))
os.makedirs(OUTPUT_DIR, exist_ok=True)

BASE_URL = "http://172.25.160.37:3000"

def capture_all():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("1. Accessing Login Gateway...")
        page.goto(BASE_URL, wait_until="networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "01_auth_gateway.png"))

        print("2. Testing DGMS Officer Command Center (/command)...")
        page.goto(f"{BASE_URL}/command", wait_until="networkidle")
        time.sleep(2)
        # Login if redirected to gateway
        if "command" not in page.url or page.locator("text=Restricted Official Login").is_visible():
            print("Logging in as DGMS Officer...")
            page.click("#btn-gov-parichay-login")
            time.sleep(2)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "02_dgms_overview.png"))

        # Click Mine Explorer
        if page.locator("#sidebar-nav-explorer").is_visible():
            page.click("#sidebar-nav-explorer")
            time.sleep(1.5)
            page.screenshot(path=os.path.join(OUTPUT_DIR, "03_dgms_mine_explorer.png"))

        # Click Evidence Center
        if page.locator("#sidebar-nav-evidence").is_visible():
            page.click("#sidebar-nav-evidence")
            time.sleep(1.5)
            page.screenshot(path=os.path.join(OUTPUT_DIR, "04_dgms_evidence_center.png"))

        # Click Risk & Prediction
        if page.locator("#sidebar-nav-risk").is_visible():
            page.click("#sidebar-nav-risk")
            time.sleep(1.5)
            page.screenshot(path=os.path.join(OUTPUT_DIR, "05_dgms_risk_prediction.png"))

        # Click Citizen Reports
        if page.locator("#sidebar-nav-citizen").is_visible():
            page.click("#sidebar-nav-citizen")
            time.sleep(1.5)
            page.screenshot(path=os.path.join(OUTPUT_DIR, "06_dgms_citizen_reports.png"))

        # Open Copilot
        if page.locator("#btn-sidebar-copilot").is_visible():
            page.click("#btn-sidebar-copilot")
            time.sleep(1.5)
            page.screenshot(path=os.path.join(OUTPUT_DIR, "07_dgms_copilot_drawer.png"))

        print("3. Testing Colliery Operator Desk (/operator)...")
        page.goto(f"{BASE_URL}/operator", wait_until="networkidle")
        time.sleep(2)
        if "operator" not in page.url or page.locator("text=Corporate Portal Login").is_visible():
            print("Logging in as Colliery Operator...")
            page.click("#btn-colliery-corporate-login")
            time.sleep(2)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "08_operator_notice_desk.png"))

        if page.locator("#operator-nav-map").is_visible():
            page.click("#operator-nav-map")
            time.sleep(1.5)
            page.screenshot(path=os.path.join(OUTPUT_DIR, "09_operator_lease_radar.png"))

        if page.locator("#operator-nav-workforce").is_visible():
            page.click("#operator-nav-workforce")
            time.sleep(1.5)
            page.screenshot(path=os.path.join(OUTPUT_DIR, "10_operator_workforce.png"))

        print("4. Testing Citizen Environmental Vigilance Portal (/citizen)...")
        page.goto(f"{BASE_URL}/citizen", wait_until="networkidle")
        time.sleep(2)
        if "citizen" not in page.url or page.locator("text=Citizen Vigilance").is_visible():
            print("Logging in as Citizen...")
            page.click("#btn-citizen-vigilance-login")
            time.sleep(2)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "11_citizen_file_concern.png"))

        if page.locator("#tab-track-my-report").is_visible():
            page.click("#tab-track-my-report")
            time.sleep(1.5)
            page.screenshot(path=os.path.join(OUTPUT_DIR, "12_citizen_track_report.png"))

        if page.locator("#tab-public-map").is_visible():
            page.click("#tab-public-map")
            time.sleep(1.5)
            page.screenshot(path=os.path.join(OUTPUT_DIR, "13_citizen_public_map.png"))

        print("5. Testing Mine Safety Officer Portal (/officer)...")
        page.goto(f"{BASE_URL}/officer", wait_until="networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "14_officer_portal.png"))

        print("6. Testing Labour Mobile App (/labour)...")
        page.goto(f"{BASE_URL}/labour", wait_until="networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "15_labour_app.png"))

        browser.close()
        print("All screenshots captured successfully into docs/screens/")

if __name__ == "__main__":
    capture_all()
