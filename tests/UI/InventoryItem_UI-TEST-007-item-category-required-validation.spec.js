
import { test, expect } from '@playwright/test';
import 'dotenv/config';

test('UI-TEST-007 - Item Category Required Validation', async ({ page }) => {
  const username = process.env.APP_USERNAME;
  const password = process.env.APP_PASSWORD;

  const itemName = `QA Category Test ${Date.now()}`;

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

  // Select dropdown option
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

  // Fill Item Name
  await page.locator('#itemName').fill(itemName);

  // Fill Barcode
  await page.locator('input[formControlName="itemBarcode"]').fill('BC12');

  // Select Item Type
  await selectFirstOption('itemTypeEnumKey');

  // Category intentionally left blank
  // await selectFirstOption('itemCategoryId');

  // Generic is dependent on Category, so skip if no options are available
  const genericDropdown = page.locator(
    'ng-select[formControlName="genericId"]'
  ).first();

  await genericDropdown.click();

  const genericOption = page.locator(
    '.ng-dropdown-panel .ng-option:not(.ng-option-disabled):visible'
  ).first();

  if (await genericOption.isVisible().catch(() => false)) {
    await genericOption.click();
    await page.keyboard.press('Escape');
  } else {
    await page.keyboard.press('Escape');
  }

  // Fill other required fields
  await selectFirstOption('unitOfMeasureId');
  await selectFirstOption('inventoryItemSupplierList');
  await selectFirstOption('manufacturerId');

  // Select Store if not already selected
  const storeDropdown = page.locator(
    'ng-select[formControlName="storeId"]'
  ).first();

  const selectedStore = storeDropdown.locator('.ng-value');

  if (await selectedStore.count() === 0) {
    await selectFirstOption('storeId');
  }

  // Save and check validation
  await page.getByRole('button', { name: 'Save' }).click();

  const expectedMessage = page.getByText('Select Item Category', {
    exact: true,
  });

  await expect(expectedMessage).toBeVisible({ timeout: 15000 });
});
