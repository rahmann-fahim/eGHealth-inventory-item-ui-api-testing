import { test, expect } from '@playwright/test';
import 'dotenv/config';

test('UI-TEST-016 - Search Inventory Item by Name and Reset Search', async ({ page }) => {

  const username = process.env.APP_USERNAME;
  const password = process.env.APP_PASSWORD;

  // Existing item name in the Inventory Item List
  const itemName = 'Duplicate Barcode Original 0134';

  // Login
  await page.goto('http://192.168.10.99/auth/login');

  await page.getByRole('textbox', { name: 'Username' }).fill(username);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).not.toHaveURL(/auth\/login/, {
    timeout: 15000
  });

  // Navigate to Inventory Item page
  await page.locator('app-sidebar')
    .getByRole('button')
    .filter({ hasText: /^$/ })
    .click();

  await page.getByRole('link', { name: /Settings & Security/ }).click();
  await page.getByRole('link', { name: 'Inventory Item' }).click();

  await expect(page).toHaveURL(/module\/setting\/inventory-item/);
  await expect(page.getByText('Add Inventory Item')).toBeVisible();

  // Search Inventory Item by Name
  const itemNameSearch = page.getByRole('textbox', {
    name: 'Item Name',
    exact: true
  });

  await expect(itemNameSearch).toBeVisible();
  await itemNameSearch.fill(itemName);

  // Click Search button
  await page.getByRole('button', { name: 'Search', exact: true }).click();

  // Verify searched item is displayed
  await expect(page.getByText(itemName, { exact: true }).last())
    .toBeVisible({ timeout: 15000 });

  // Click Reset button in Inventory Item List search section
  await page.getByRole('button', { name: 'Reset', exact: true })
    .nth(1)
    .click();

  // Verify search field is cleared
  await expect(itemNameSearch).toHaveValue('');

  // Verify the list is displayed again after reset
  await expect(page.getByText('Inventory Item List')).toBeVisible();

});