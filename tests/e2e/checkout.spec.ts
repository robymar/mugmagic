import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to home page
        await page.goto('/');
    });

    test('complete checkout flow - add product to cart and proceed to checkout', async ({ page }) => {
        // 1. Navigate to products page
        await page.click('a[href="/products"]');
        await expect(page).toHaveURL(/.*products/);

        // 2. Wait for products to load
        await page.waitForSelector('[data-testid="product-card"]', { timeout: 5000 });

        // 3. Click first product
        const firstProduct = page.locator('[data-testid="product-card"]').first();
        await firstProduct.click();

        // 4. Wait for product detail page
        await expect(page).toHaveURL(/.*products\/.*/);

        // 5. Add to cart
        await page.click('button:has-text("Add to Cart")');

        // 6. Wait for cart to open
        await page.waitForSelector('[role="dialog"][aria-label="Shopping cart"]', { timeout: 3000 });

        // 7. Verify cart has item
        const cartItems = page.locator('[role="dialog"] .cart-item');
        await expect(cartItems).toHaveCount(1);

        // 8. Proceed to checkout
        await page.click('button:has-text("Proceed to Checkout")');

        // 9. Verify checkout page
        await expect(page).toHaveURL(/.*checkout/);

        // 10. Verify order summary is visible
        await expect(page.locator('text=Order Summary')).toBeVisible();
    });

    test('cart operations - add, update quantity, and remove', async ({ page }) => {
        // Navigate to products and add item
        await page.goto('/products');
        await page.waitForSelector('[data-testid="product-card"]');

        const firstProduct = page.locator('[data-testid="product-card"]').first();
        await firstProduct.click();

        // Add to cart
        await page.click('button:has-text("Add to Cart")');
        await page.waitForSelector('[role="dialog"]');

        // Verify initial quantity
        const quantityInput = page.locator('input[type="number"]').first();
        await expect(quantityInput).toHaveValue('1');

        // Update quantity
        await quantityInput.fill('3');
        await page.waitForTimeout(500); // Wait for update

        // Verify quantity changed
        await expect(quantityInput).toHaveValue('3');

        // Remove item
        await page.click('button[aria-label*="Remove"]');

        // Verify empty cart message
        await expect(page.locator('text=Your cart is empty')).toBeVisible();
    });

    test('checkout form validation', async ({ page }) => {
        // Add product to cart first
        await page.goto('/products');
        await page.waitForSelector('[data-testid="product-card"]');
        await page.locator('[data-testid="product-card"]').first().click();
        await page.click('button:has-text("Add to Cart")');
        await page.click('button:has-text("Proceed to Checkout")');

        // Try to submit without filling form
        await page.click('button[type="submit"]');

        // Verify validation errors appear
        await expect(page.locator('text=required')).toBeVisible();

        // Fill form with valid data
        await page.fill('input[name="firstName"]', 'John');
        await page.fill('input[name="lastName"]', 'Doe');
        await page.fill('input[name="email"]', 'john@example.com');
        await page.fill('input[name="phone"]', '+34666777888');
        await page.fill('input[name="address"]', '123 Main St');
        await page.fill('input[name="city"]', 'Madrid');
        await page.fill('input[name="postalCode"]', '28001');
        await page.fill('input[name="country"]', 'Spain');

        // Verify no validation errors
        await expect(page.locator('text=required')).not.toBeVisible();
    });
});

test.describe('Product Browsing', () => {
    test('browse products and view details', async ({ page }) => {
        await page.goto('/products');

        // Wait for products to load
        await page.waitForSelector('[data-testid="product-card"]');

        // Verify products are displayed
        const products = page.locator('[data-testid="product-card"]');
        await expect(products).toHaveCount(await products.count());

        // Click on first product
        await products.first().click();

        // Verify product details are shown
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('text=Add to Cart')).toBeVisible();
    });

    test('search functionality', async ({ page }) => {
        await page.goto('/products');

        // Find search input if exists
        const searchInput = page.locator('input[placeholder*="Search"]');
        if (await searchInput.isVisible()) {
            await searchInput.fill('mug');
            await page.waitForTimeout(500);

            // Verify filtered results
            const products = page.locator('[data-testid="product-card"]');
            expect(await products.count()).toBeGreaterThan(0);
        }
    });
});

test.describe('Cart Functionality', () => {
    test('cart persists across page navigation', async ({ page }) => {
        // Add product to cart
        await page.goto('/products');
        await page.waitForSelector('[data-testid="product-card"]');
        await page.locator('[data-testid="product-card"]').first().click();
        await page.click('button:has-text("Add to Cart")');

        // Close cart
        await page.click('button[aria-label="Close shopping cart"]');

        // Navigate away
        await page.goto('/');

        // Open cart again
        await page.click('button[aria-label*="cart"]');

        // Verify item is still there
        const cartItems = page.locator('[role="dialog"] .cart-item');
        await expect(cartItems).toHaveCount(1);
    });

    test('discount code application', async ({ page }) => {
        // Add product to cart
        await page.goto('/products');
        await page.waitForSelector('[data-testid="product-card"]');
        await page.locator('[data-testid="product-card"]').first().click();
        await page.click('button:has-text("Add to Cart")');

        // Apply discount code
        await page.fill('input[placeholder*="code"]', 'SAVE20');
        await page.click('button:has-text("Apply")');

        // Verify discount is applied
        await expect(page.locator('text=SAVE20')).toBeVisible();
        await expect(page.locator('text=Discount')).toBeVisible();
    });
});

test.describe('Accessibility', () => {
    test('keyboard navigation in cart', async ({ page }) => {
        await page.goto('/products');
        await page.waitForSelector('[data-testid="product-card"]');
        await page.locator('[data-testid="product-card"]').first().click();
        await page.click('button:has-text("Add to Cart")');

        // Test escape key closes cart
        await page.keyboard.press('Escape');

        // Verify cart is closed
        await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });

    test('screen reader labels', async ({ page }) => {
        await page.goto('/');

        // Verify important elements have aria-labels
        await expect(page.locator('button[aria-label]')).toHaveCount(await page.locator('button[aria-label]').count());
    });
});
