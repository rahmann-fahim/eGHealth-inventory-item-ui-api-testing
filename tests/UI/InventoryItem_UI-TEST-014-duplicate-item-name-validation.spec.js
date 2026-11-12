import { test, expect } from '@playwright/test';
import 'dotenv/config';

test('UI-TEST-014 - Duplicate Item Name Validation', async ({ page }) => {

  const username = process.env.APP_USERNAME;
  const password = process.env.APP_PASSWORD;

  // Unique barcode, but existing item name
  const barcode = `DUP-NAME-014-${Date.now()}`;
  const itemName = 'Napa 200mg 1';

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

  // Locate input using visible label
  function getInputByLabel(labelText) {
    return page.getByText(labelText, { exact: true })
      .locator('xpath=ancestor::*[.//input][1]')
      .locator('input')
      .first();
  }

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

  // Select dropdown option by its visible text
  async function selectOptionByText(controlName, optionText) {

    const dropdown = page.locator(
      `ng-select[formControlName="${controlName}"]`
    ).first();

    await expect(dropdown).toBeVisible();
    await dropdown.click();

    const option = page.locator(
      '.ng-dropdown-panel .ng-option:not(.ng-option-disabled):visible'
    ).filter({ hasText: new RegExp(`^${optionText}$`) }).first();

    await expect(option).toBeVisible({ timeout: 10000 });
    await option.click();

    await page.keyboard.press('Escape');
  }

  // Fill Inventory Item form
  await getInputByLabel('Barcode*').fill(barcode);
  await page.locator('#itemName').fill(itemName);

  await selectFirstOption('itemTypeEnumKey');

  // Existing item category is Tablet
  await selectOptionByText('itemCategoryId', 'Tablet');

  await selectFirstOption('genericId');
  await selectFirstOption('unitOfMeasureId');
  await selectFirstOption('inventoryItemSupplierList');
  await selectFirstOption('manufacturerId');

  // Select Store only if not already selected
  const storeDropdown = page.locator(
    'ng-select[formControlName="storeId"]'
  ).first();

  const storeText = await storeDropdown.innerText();

  if (storeText.includes('Select')) {
    await selectFirstOption('storeId');
  }

  // Save
  await page.getByRole('button', {
    name: 'Save',
    exact: true
  }).click();

  // Confirmation popup
  await expect(
    page.getByText('Do you really want to save?')
  ).toBeVisible({ timeout: 10000 });

  await page.getByRole('button', {
    name: 'OK',
    exact: true
  }).click();

  // Verify duplicate Item Name validation message
await expect(
  page.getByText(
    /Item Name \[.*\] with Item Category \[.*\] and Store \[.*\] already exists/i
  )
).toBeVisible({ timeout: 15000 });

});