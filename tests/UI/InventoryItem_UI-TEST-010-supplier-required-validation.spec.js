
import { test, expect } from '@playwright/test';
import 'dotenv/config';

test('UI-TEST-010 - Supplier Required Validation', async ({ page }) => {
  const username = process.env.APP_USERNAME;
  const password = process.env.APP_PASSWORD;
  const itemName = `QA Supplier Test ${Date.now()}`;

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

  // Select first available dropdown option
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

  // Select Item Type as Medicine
  async function selectOptionByText(controlName, optionText) {
    const dropdown = page.locator(
      `ng-select[formControlName="${controlName}"]`
    ).first();

    await dropdown.click();

    const options = page.locator(
      '.ng-dropdown-panel .ng-option:not(.ng-option-disabled):visible'
    );

    const option = options.filter({
      hasText: new RegExp(`^\\s*${optionText}\\s*$`),
    }).first();

    await expect(option).toBeVisible({ timeout: 10000 });
    await option.click();
    await page.keyboard.press('Escape');
  }

  // Fill Item Name and Barcode
  await page.locator('#itemName').fill(itemName);
  await page.locator('input[formControlName="itemBarcode"]').fill('BC12');

  // Fill required fields
  await selectOptionByText('itemTypeEnumKey', 'Medicine');
  await selectFirstOption('itemCategoryId');
  await selectFirstOption('genericId');
  await selectFirstOption('unitOfMeasureId');

  // Supplier intentionally left blank

  await selectFirstOption('manufacturerId');

  // Select Store if not already selected
  const storeDropdown = page.locator(
    'ng-select[formControlName="storeId"]'
  ).first();

  const selectedStore = storeDropdown.locator('.ng-value');

  if (await selectedStore.count() === 0) {
    await selectFirstOption('storeId');
  }

  // Save and verify validation toast
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByRole('alertdialog', {
      name: 'Select Supplier',
    })
  ).toBeVisible({ timeout: 15000 });
});
