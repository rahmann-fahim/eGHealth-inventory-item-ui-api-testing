
import { test, expect } from '@playwright/test';
import 'dotenv/config';

test('UI-TEST-015 - Reset Button Functionality (Add Form)', async ({ page }) => {

  const username = process.env.APP_USERNAME;
  const password = process.env.APP_PASSWORD;

  // Helper to select the first available dropdown option
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

  // Helper to find input by its label
  function getInputByLabel(labelText) {
    return page.getByText(labelText, { exact: true })
      .locator('xpath=ancestor::*[.//input][1]')
      .locator('input')
      .first();
  }

  // Login
  await page.goto('http://192.168.10.99/auth/login');

  await page.getByRole('textbox', { name: 'Username' }).fill(username);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).not.toHaveURL(/auth\/login/, {
    timeout: 15000
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

  // Open Add Inventory Item form
  await page.getByText('Add Inventory Item').click();

  // Enter test data
  await page.locator('#itemName').fill('Reset Test Item UI-TEST-015');

  await getInputByLabel('Barcode*')
    .fill(`RESET-UI-TEST-015-${Date.now()}`);

  // Select required dropdown values
  await selectFirstOption('itemTypeEnumKey');
  await selectFirstOption('itemCategoryId');
  await selectFirstOption('genericId');
  await selectFirstOption('unitOfMeasureId');
  await selectFirstOption('inventoryItemSupplierList');
  await selectFirstOption('manufacturerId');
  await selectFirstOption('storeId');

  // Verify data was entered before reset
  await expect(page.locator('#itemName'))
    .toHaveValue('Reset Test Item UI-TEST-015');

  await expect(getInputByLabel('Barcode*'))
    .not.toHaveValue('');

  // Click Add Form Reset button only
  await page.locator('button')
    .filter({ hasText: /^Reset$/ })
    .first()
    .click();

  // Verify text fields are cleared
  await expect(page.locator('#itemName')).toHaveValue('');

  await expect(getInputByLabel('Barcode*'))
    .toHaveValue('');

  // Verify dropdown values are reset
  const dropdownControls = [
    'itemTypeEnumKey',
    'itemCategoryId',
    'genericId',
    'unitOfMeasureId',
    'inventoryItemSupplierList',
    'manufacturerId'
  ];

  for (const controlName of dropdownControls) {
    const dropdown = page.locator(
      `ng-select[formControlName="${controlName}"]`
    ).first();

    await expect(
      dropdown.locator('.ng-value')
    ).toHaveCount(0);
  }

  console.log('UI-TEST-015 completed successfully');

});
