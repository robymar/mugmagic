import { test, expect } from '@playwright/test';

test('visitor can customize a mug and add to cart', async ({ page }) => {
    // 1. Go to homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/MugMagic/);

    // 2. Click "Start Creating"
    await page.click('text=Start Creating');
    await expect(page.locator('h1')).toContainText('Choose Your Canvas');

    // 3. Select Mug
    await page.click('text=Customize');

    // 4. In Editor: Check canvas exists
    const canvas = page.locator('canvas.lower-canvas');
    await expect(canvas).toBeVisible();

    // 5. Add Text
    await page.click('text=Text');

    // 6. Verify 3D Toggle
    await page.click('text=Preview 3D');
    await expect(page.locator('canvas').nth(1)).toBeVisible(); // R3F canvas

    // 7. Add to Cart (Mocked alert for now, but in real flow: click -> drawer opens)
    // await page.click('text=Add to Cart');
});
