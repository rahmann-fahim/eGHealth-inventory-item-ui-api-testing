import { test, expect } from '@playwright/test';
import 'dotenv/config';

test('UI-TEST-012 - Store Required Validation', async ({ page }) => {
  const username = process.env.APP_USERNAME;
  const password = process.env.APP_PASSWORD;

  const itemName = `Test Item Store ${Date.now()}`;

  // Login
  await page.goto('http://192.168.10.99/auth/login');

  await page.getByRole('textbox', { name: 'Username' }).fill(username);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).not.toHaveURL(/auth\/login/, {
    timeout: 15000,
  });

  // Navigate to Inventory Item
  await page.locator('app-sidebar')
    .getByRole('button')
    .filter({ hasText: /^$/ })
    .click();

  await page.getByRole('link', { name: /Settings & Security/ }).click();
  await page.getByRole('link', { name: 'Inventory Item' }).click();

  await expect(page).toHaveURL(/module\/setting\/inventory-item/);
  await expect(page.getByText('Add Inventory Item')).toBeVisible();

  // Fill Item Name and Barcode
  await page.locator('#itemName').fill(itemName);

  await page.locator('input[formControlName="itemBarcode"]')
    .fill('BC12');

  // Helper to select first available dropdown option
  async function selectFirstOption(controlName) {
    const dropdown = page.locator(
      `ng-select[formControlName="${controlName}"]`
    ).first();

    await expect(dropdown).toBeVisible();
    await dropdown.click();

    const option = page.locator(
      '.ng-dropdown-panel .ng-option:not(.ng-option-disabled):visible'
    ).first();

    await expect(option).toBeVisible({ timeout: 10000 });
    await option.click();

    await page.keyboard.press('Escape');
  }

  // Select Item Type
  await selectFirstOption('itemTypeEnumKey');

  // Select Category
  await selectFirstOption('itemCategoryId');

  // Select Generic
  await selectFirstOption('genericId');

  // Select Unit of Measurement
  await selectFirstOption('unitOfMeasureId');

  // Select Supplier
  await selectFirstOption('inventoryItemSupplierList');

  // Select Manufacturer
  await selectFirstOption('manufacturerId');

  // Leave Store blank
  const storeDropdown = page.locator(
    'ng-select[formControlName="storeId"]'
  ).first();

  const selectedStore = storeDropdown.locator('.ng-value');

  if (await selectedStore.count() > 0) {
    const clearButton = storeDropdown.locator('.ng-clear-wrapper');

    await expect(clearButton).toBeVisible();
    await clearButton.click();
  }

  // Verify Store is blank
  await expect(storeDropdown.locator('.ng-value')).toHaveCount(0);

  // Click Save
  await page.getByRole('button', { name: 'Save' }).click();

  // Verify Store validation message
  await expect(
    page.getByRole('alertdialog', {
      name: 'Select Store',
    })
  ).toBeVisible({ timeout: 15000 });
});