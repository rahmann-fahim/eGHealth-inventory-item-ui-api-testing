import { test, expect } from '@playwright/test';
import 'dotenv/config';

test('UI-TEST-013 - Duplicate Barcode Validation', async ({ page }) => {

  const username = process.env.APP_USERNAME;
  const password = process.env.APP_PASSWORD;

  const barcode = `MY-NEW-BARCODE-${Date.now()}`;

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

  // Fill required fields
  async function fillInventoryItem(itemName) {

    await getInputByLabel('Barcode*').fill(barcode);
    await page.locator('#itemName').fill(itemName);

    await selectFirstOption('itemTypeEnumKey');
    await selectFirstOption('itemCategoryId');
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
  }

  // Click Save and confirm
  async function saveAndConfirm() {

    await page.getByRole('button', {
      name: 'Save',
      exact: true
    }).click();

    await expect(
      page.getByText('Do you really want to save?')
    ).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', {
      name: 'OK',
      exact: true
    }).click();
  }

  // Step 1: Create the first item
  await fillInventoryItem('Duplicate Barcode Original 0134');

  await saveAndConfirm();

  // Verify first item was created
  await expect(
    page.getByRole('grid').getByText('Duplicate Barcode Original 0134')
  ).toBeVisible({ timeout: 15000 });

  // Step 2: Create another item with the same barcode
  await expect(getInputByLabel('Barcode*')).toBeVisible();

  await fillInventoryItem('Duplicate Barcode Attempt 0134');

  // Step 3: Save the duplicate item and confirm
  await saveAndConfirm();

  // Step 4: Verify duplicate barcode validation
  await expect(
    page.getByText(
      /Item barcode .* exists in Store/i
    )
  ).toBeVisible({ timeout: 15000 });

});