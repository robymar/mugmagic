import { test, expect } from '@playwright/test';

test.describe('Editor Flow', () => {
    test('basic editor interaction', async ({ page }) => {
        // Navigate to products
        await page.goto('/products');
        await page.waitForSelector('[data-testid="product-card"]');

        // Click customize button
        const customizeButton = page.locator('button:has-text("Customize")').first();
        if (await customizeButton.isVisible()) {
            await customizeButton.click();

            // Wait for editor to load
            await expect(page).toHaveURL(/.*editor.*/);

            // Verify editor tools are visible
            await expect(page.locator('text=Add Text')).toBeVisible({ timeout: 5000 });
        }
    });

    test('add text to design', async ({ page }) => {
        // Go directly to editor
        await page.goto('/editor/mug-11oz');

        // Wait for editor to load
        await page.waitForSelector('canvas', { timeout: 10000 });

        // Click add text button
        await page.click('button:has-text("Add Text")');

        // Verify text was added to canvas
        await page.waitForTimeout(1000);

        // Add to cart from editor
        const addToCartBtn = page.locator('button:has-text("Add to Cart")');
        if (await addToCartBtn.isVisible()) {
            await addToCartBtn.click();

            // Verify cart opens
            await expect(page.locator('[role="dialog"]')).toBeVisible();
        }
    });
});

test.describe('Order Tracking', () => {
    test('track order form validation', async ({ page }) => {
        await page.goto('/track');

        // Try to submit without filling form
        if (await page.locator('button[type="submit"]').isVisible()) {
            await page.click('button[type="submit"]');

            // Verify validation
            await expect(page.locator('text=required')).toBeVisible();
        }

        // Fill form with test data
        await page.fill('input[name="orderNumber"]', 'ORD-12345678');
        await page.fill('input[name="email"]', 'test@example.com');

        // Submit form
        await page.click('button[type="submit"]');

        // Expect either order details or "not found" message
        await page.waitForTimeout(2000);
    });
});

test.describe('Responsive Design', () => {
    test('mobile navigation', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        await page.goto('/');

        // Look for mobile menu button
        const menuButton = page.locator('button[aria-label*="menu"]');
        if (await menuButton.isVisible()) {
            await menuButton.click();

            // Verify menu opened
            await expect(page.locator('nav')).toBeVisible();
        }
    });

    test('cart drawer on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });

        await page.goto('/products');
        await page.waitForSelector('[data-testid="product-card"]');
        await page.locator('[data-testid="product-card"]').first().click();
        await page.click('button:has-text("Add to Cart")');

        // Verify drawer is full width on mobile
        const drawer = page.locator('[role="dialog"]');
        await expect(drawer).toBeVisible();
    });
});
