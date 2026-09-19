import os
import time
from playwright.sync_api import sync_playwright

output_dir = r"C:\Users\nishi\.gemini\antigravity\scratch\coalguard-ai\docs\screens"
os.makedirs(output_dir, exist_ok=True)

url = "http://172.25.160.37:3000"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    print("Navigating to", url)
    page.goto(url)
    time.sleep(2)
    page.screenshot(path=os.path.join(output_dir, "01_auth_gateway.png"))
    print("Saved 01_auth_gateway.png")
    
    # DGMS Officer Command Center
    page.goto(f"{url}/command")
    time.sleep(2)
    page.screenshot(path=os.path.join(output_dir, "02_dgms_overview.png"))
    print("Saved 02_dgms_overview.png")
    
    # Operator
    page.goto(f"{url}/operator")
    time.sleep(2)
    page.screenshot(path=os.path.join(output_dir, "08_operator_notice_desk.png"))
    print("Saved 08_operator_notice_desk.png")
    
    # Citizen
    page.goto(f"{url}/citizen")
    time.sleep(2)
    page.screenshot(path=os.path.join(output_dir, "11_citizen_file_concern.png"))
    print("Saved 11_citizen_file_concern.png")
    
    browser.close()
    print("Done!")
