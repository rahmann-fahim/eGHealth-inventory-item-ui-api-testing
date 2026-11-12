import 'dotenv/config';
import { test, expect } from '@playwright/test';

test('UI-TEST-005 - Item Name Required Validation', async ({ page }) => {
  // ---------------- CHECK ENV ----------------
  const username = process.env.APP_USERNAME;
  const password = process.env.APP_PASSWORD;

  if (!username || !password) {
    throw new Error(
      'Credentials missing. Check APP_USERNAME and APP_PASSWORD in project-root .env file.'
    );
  }

  // Capture browser runtime errors
  const runtimeErrors = [];

  page.on('pageerror', error => {
    runtimeErrors.push(error.message);
  });

  // ---------------- LOGIN ----------------
  await page.goto('http://192.168.10.99/auth/login');

  await page.getByRole('textbox', { name: 'Username' }).fill(username);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).not.toHaveURL(/auth\/login/, {
    timeout: 15000,
  });

  // ---------------- NAVIGATION ----------------
  await page.locator('app-sidebar')
    .getByRole('button')
    .filter({ hasText: /^$/ })
    .click();

  await page.getByRole('link', { name: /Settings & Security/ }).click();
  await page.getByRole('link', { name: 'Inventory Item' }).click();

  await expect(page).toHaveURL(/module\/setting\/inventory-item/);
  await expect(page.getByText('Add Inventory Item')).toBeVisible();

  // ---------------- CREATE FORM ----------------

  // Item Name intentionally left empty
  // const itemName = `PW Inventory Item ${Date.now()}`;
  // await page.locator('#itemName').fill(itemName);

  // ---------------- BARCODE ----------------
  await page.locator('input[formControlName="itemBarcode"]').fill('BC12');

  // ---------------- DROPDOWN HELPERS ----------------
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

  async function selectOptionByText(controlName, optionText) {
    const dropdown = page.locator(
      `ng-select[formControlName="${controlName}"]`
    ).first();

    await expect(dropdown).toBeVisible();
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

  // ---------------- ITEM TYPE ----------------
  await selectOptionByText('itemTypeEnumKey', 'Medicine');

  // ---------------- CATEGORY ----------------
  await selectFirstOption('itemCategoryId');

  // ---------------- GENERIC ----------------
  await selectFirstOption('genericId');

  // ---------------- UOM ----------------
  await selectFirstOption('unitOfMeasureId');

  // ---------------- SUPPLIER ----------------
  await selectFirstOption('inventoryItemSupplierList');

  // ---------------- MANUFACTURER ----------------
  await selectFirstOption('manufacturerId');

  // ---------------- STORE ----------------
  const storeDropdown = page.locator(
    'ng-select[formControlName="storeId"]'
  ).first();

  const selectedStore = storeDropdown.locator('.ng-value');

  if (await selectedStore.count() === 0) {
    await selectFirstOption('storeId');
  }

  // ---------------- SAVE ----------------
  await page.getByRole('button', { name: 'Save' }).click();

  //await expect(
  //  page.getByText('Do you really want to save?')
  //).toBeVisible({ timeout: 10000 });

  //await page.getByRole('button', { name: 'OK' }).click();

  // ---------------- CHECK RESULT ----------------
  const expectedMessage = page.getByText('Insert item name', {
    exact: true,
  });

  try {
    await expect(expectedMessage).toBeVisible({ timeout: 15000 });

    console.log('Expected validation displayed: Insert item name');
  } catch (error) {
    const visibleText = await page.locator('body').innerText();

    console.error('--- Item Name validation failed ---');
    console.error('Expected: Insert item name');
    console.error('Browser runtime errors:', runtimeErrors);
    console.error('Visible page text:', visibleText);

    throw error;
  }
});