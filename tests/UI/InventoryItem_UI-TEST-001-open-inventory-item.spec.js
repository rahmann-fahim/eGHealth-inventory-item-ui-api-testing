
const { test, expect } = require('@playwright/test');

test('InventoryItem_UI-TEST-001: Login and open Inventory Item', async ({ page }) => {

  // Step 1: Open Login Page
  await page.goto('http://192.168.10.99/auth/login');

  // Step 2: Enter credentials
  await page.getByRole('textbox', { name: 'Username' })
    .fill('internfahim');

  await page.getByRole('textbox', { name: 'Password' })
    .fill('Fahim@123');

  // Step 3: Login
  await page.getByRole('button', { name: 'Login' }).click();

  // Step 4: Wait until login navigation completes
  await expect(page).not.toHaveURL(/\/auth\/login/, {
    timeout: 15000,
  });

  // Step 5: Expand sidebar menu
  await page.locator('app-sidebar')
    .getByRole('button')
    .filter({ hasText: /^$/ })
    .click();

  // Step 6: Open Settings & Security
  await page.getByRole('link', {
    name: /Settings & Security/,
  }).click();

  // Step 7: Open Inventory Item
  await page.getByRole('link', {
    name: 'Inventory Item',
  }).click();

  // Step 8: Verify page URL
  await expect(page).toHaveURL(
    /\/module\/setting\/inventory-item/
  );

  // Step 9: Verify page content
  await expect(
    page.getByText('Add Inventory Item', { exact: true })
  ).toBeVisible();

  await expect(
    page.getByText('Inventory Item List', { exact: true })
  ).toBeVisible();

});
