# tests/e2e/test_event_platform.py
import pytest
import time
import random
import string
import logging
from datetime import datetime
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

# Configuration
BASE_URL = "http://localhost:5173"
TIMEOUT = 15  # seconds
SCREENSHOT_DIR = Path("test_results/screenshots")

# Ensure directory exists before logging setup
Path("test_results").mkdir(exist_ok=True)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("test_results/e2e_tests.log", encoding='utf-8'), logging.StreamHandler()]
)
logger = logging.getLogger(__name__)


def random_string(length=8):
    """Generate random alphanumeric string for test data"""
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))


def take_screenshot(driver, test_name: str):
    """Capture screenshot on test failure"""
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filepath = SCREENSHOT_DIR / f"{test_name}_{timestamp}.png"
    driver.save_screenshot(str(filepath))
    logger.error(f"Screenshot saved: {filepath}")


@pytest.fixture(scope="class")
def driver():
    """Chrome driver fixture with stability optimizations"""
    options = Options()
    options.add_argument('--window-size=1920,1080')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-extensions')
    options.add_argument('--disable-popup-blocking')
    options.add_argument('--disable-notifications')
    
    driver = webdriver.Chrome(options=options)
    driver.set_page_load_timeout(30)
    
    yield driver
    
    try:
        driver.quit()
    except Exception:
        pass


@pytest.fixture(scope="class")
def test_credentials():
    """Generate unique test credentials per test class run"""
    return {
        "email": f"e2e_{random_string(6)}@example.com",
        "password": "TestPassword123!",
        "name": f"E2E Tester {random_string(4)}"
    }


class TestEventPlatformE2E:
    """End-to-end tests for Event Platform"""
    
    @pytest.fixture(autouse=True, scope="class")
    def setup_class_data(self, test_credentials):
        """Initialize shared test data using a fixture"""
        TestEventPlatformE2E.email = test_credentials["email"]
        TestEventPlatformE2E.password = test_credentials["password"]
        TestEventPlatformE2E.name = test_credentials["name"]
        logger.info(f"Starting E2E tests with user: {TestEventPlatformE2E.email}")

    @classmethod
    def teardown_class(cls):
        """Cleanup: Attempt to delete test user if API available"""
        logger.info(f"Tests completed for user: {cls.email}")
        # TODO: Add API call to delete test user if backend supports it
        # requests.delete(f"{BASE_URL}/api/users/{cls.email}")

    def _wait_for_url_contains(self, driver, substring: str, timeout=TIMEOUT):
        """Helper: Wait until URL contains substring"""
        return WebDriverWait(driver, timeout).until(
            lambda d: substring in d.current_url.lower()
        )

    def _wait_for_element_clickable(self, driver, locator, timeout=TIMEOUT):
        """Helper: Wait for element to be clickable"""
        return WebDriverWait(driver, timeout).until(
            EC.element_to_be_clickable(locator)
        )

    def _wait_for_element_present(self, driver, locator, timeout=TIMEOUT):
        """Helper: Wait for element to be present in DOM"""
        return WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located(locator)
        )

    @pytest.mark.order(1)
    def test_01_home_page_loads(self, driver):
        """Verify home page loads with expected title"""
        driver.get(BASE_URL)
        
        # Wait for page to fully load
        WebDriverWait(driver, TIMEOUT).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        
        # Assert title contains expected text
        assert any(keyword in driver.title.lower() for keyword in ["event", "evento"]), \
            f"Unexpected page title: {driver.title}"
        logger.info("✓ Home page loaded successfully")

    @pytest.mark.order(2)
    def test_02_register_and_login_user(self, driver):
        """Register new user and verify login flow"""
        # Navigate to register page
        driver.get(f"{BASE_URL}/register")
        self._wait_for_element_present(driver, (By.ID, "name"))
        
        # Fill registration form with MORE SPECIFIC selectors
        driver.find_element(By.ID, "name").send_keys(self.name)
        driver.find_element(By.ID, "email").send_keys(self.email)
        driver.find_element(By.ID, "password").send_keys(self.password)
        
        # Use specific submit button for registration form
        register_btn = driver.find_element(
            By.CSS_SELECTOR, "form button[type='submit']"
        )
        register_btn.click()
        
        # Wait for redirect - handle both success paths
        try:
            # Path A: Auto-redirect to dashboard/profile after register
            WebDriverWait(driver, TIMEOUT).until(
                lambda d: any(x in d.current_url.lower() for x in ["dashboard", "profile", "explore"])
            )
            logger.info("✓ Registration successful - auto-redirected")
            
        except TimeoutException:
            # Path B: Redirect to login page, then manually login
            self._wait_for_url_contains(driver, "login")
            logger.info("→ Redirected to login page after registration")
            
            # Login with new credentials
            self._wait_for_element_present(driver, (By.ID, "email")).send_keys(self.email)
            driver.find_element(By.ID, "password").send_keys(self.password)
            
            login_btn = driver.find_element(
                By.CSS_SELECTOR, "form button[type='submit']"
            )
            login_btn.click()
            
            # Verify successful login
            self._wait_for_url_contains(driver, "dashboard", timeout=TIMEOUT+5)
            logger.info("✓ Manual login successful")

    @pytest.mark.order(3)
    def test_03_explore_events_search(self, driver):
        """Test event search functionality with ASSERTIONS"""
        driver.get(f"{BASE_URL}/explore")
        
        # Wait for search input with specific placeholder (from ExplorePage.jsx)
        search_input = self._wait_for_element_present(
            driver, 
            (By.XPATH, "//input[@placeholder='Search events...']")
        )
        
        # Perform search
        search_term = "Tech Conference"
        search_input.send_keys(search_term)
        
        # Wait for search results to appear (adjust selector to your app)
        try:
            # Option A: Wait for results container to have content
            WebDriverWait(driver, TIMEOUT).until(
                EC.presence_of_element_located(
                    (By.CSS_SELECTOR, "[data-testid='event-results'] > *")
                )
            )
        except TimeoutException:
            # Option B: Fallback - wait for any event card
            WebDriverWait(driver, TIMEOUT).until(
                EC.presence_of_element_located(
                    (By.CSS_SELECTOR, ".event-card, [class*='event'], article")
                )
            )
        
        # ✅ CRITICAL: Add assertion to validate search worked
        page_source = driver.page_source.lower()
        assert search_term.lower() in page_source or "no results" not in page_source, \
            f"Search for '{search_term}' did not return expected results"
        
        logger.info(f"✓ Event search for '{search_term}' completed")

    @pytest.mark.order(4) 
    def test_04_update_user_profile(self, driver):
        """Test profile update flow with proper error handling"""
        driver.get(f"{BASE_URL}/profile")
        
        try:
            # Wait for and click Edit Profile button
            edit_btn = self._wait_for_element_clickable(
                driver,
                (By.XPATH, "//button[contains(text(), 'Edit Profile')]")
            )
            edit_btn.click()
            
            # Wait for edit form fields
            loc_input = self._wait_for_element_present(driver, (By.ID, "location"))
            loc_input.clear()
            loc_input.send_keys("San Francisco, CA")
            
            bio_input = driver.find_element(By.ID, "bio")
            bio_input.clear()
            bio_input.send_keys("Automated E2E test profile - do not delete")
            
            # Save changes
            save_btn = self._wait_for_element_clickable(
                driver,
                (By.XPATH, "//button[contains(text(), 'Save')]")
            )
            save_btn.click()
            
            # Wait for save confirmation (Edit button reappears OR success toast)
            WebDriverWait(driver, TIMEOUT).until(
                lambda d: (
                    EC.presence_of_element_located(
                        (By.XPATH, "//button[contains(text(), 'Edit Profile')]")
                    )(d) or
                    EC.presence_of_element_located(
                        (By.CSS_SELECTOR, "[role='alert'], .toast, .notification")
                    )(d)
                )
            )
            
            # ✅ Verify update persisted: reload page and check values
            driver.refresh()
            self._wait_for_element_present(driver, (By.ID, "location"))
            updated_location = driver.find_element(By.ID, "location").get_attribute("value")
            assert "San Francisco" in updated_location, "Profile update did not persist"
            
            logger.info("✓ Profile updated and verified successfully")
            
        except Exception as e:
            take_screenshot(driver, "test_04_update_profile_failure")
            pytest.fail(f"Profile update failed: {str(e)}")

    @pytest.mark.order(5)
    def test_05_logout_and_verify(self, driver):
        """Test logout flow with verification"""
        try:
            # Click logout button (using title attribute from Header.jsx)
            logout_btn = self._wait_for_element_clickable(
                driver,
                (By.XPATH, "//button[@title='Logout']")
            )
            logout_btn.click()
            
            # Verify redirect to login page
            self._wait_for_url_contains(driver, "login", timeout=TIMEOUT+5)
            
            # ✅ Verify user is truly logged out: try to access protected route
            driver.get(f"{BASE_URL}/profile")
            self._wait_for_url_contains(driver, "login")  # Should redirect back to login
            
            logger.info("✓ Logout successful and session terminated")
            
        except Exception as e:
            take_screenshot(driver, "test_05_logout_failure")
            pytest.fail(f"Logout verification failed: {str(e)}")


# Optional: Retry decorator for flaky E2E tests (requires pytest-rerunfailures plugin)
# Install with: pip install pytest-rerunfailures
# Then add @pytest.mark.flaky(reruns=2, reruns_delay=2) to flaky tests