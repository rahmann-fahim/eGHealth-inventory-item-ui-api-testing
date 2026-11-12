
import { test, expect } from '@playwright/test';
import 'dotenv/config';

test('UI-TEST-004 - Barcode Required Validation', async ({ page }) => {
  const username = process.env.APP_USERNAME;
  const password = process.env.APP_PASSWORD;

  const itemName = `Test Item Barcode ${Date.now()}`;

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

  // Fill Item Name and keep Barcode blank
  await page.locator('#itemName').fill(itemName);

  // Helper to select first dropdown option
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

  // Select required fields
  await selectFirstOption('itemTypeEnumKey');
  await selectFirstOption('itemCategoryId');
  await selectFirstOption('genericId');
  await selectFirstOption('unitOfMeasureId');
  await selectFirstOption('inventoryItemSupplierList');
  await selectFirstOption('manufacturerId');

  // Store may already be selected by default
  const storeDropdown = page.locator(
    'ng-select[formControlName="storeId"]'
  ).first();

  if (await storeDropdown.locator('.ng-value').count() === 0) {
    await selectFirstOption('storeId');
  }

  // Click Save
  await page.getByRole('button', { name: 'Save' }).click();

  const barcodeValidation = page.getByRole('alertdialog', {
    name: 'Insert Barcode',
  });

  const confirmationPopup = page.getByText(
    'Do you really want to save?',
    { exact: true }
  );

  // Wait for validation or confirmation popup
  const result = await Promise.race([
    barcodeValidation.waitFor({ state: 'visible', timeout: 15000 })
      .then(() => 'validation')
      .catch(() => null),

    confirmationPopup.waitFor({ state: 'visible', timeout: 15000 })
      .then(() => 'confirmation')
      .catch(() => null),
  ]);

  // Case 1: Barcode validation appears
  if (result === 'validation') {
    console.log('PASS: Barcode required validation displayed.');
    await expect(barcodeValidation).toBeVisible();
    return;
  }

  // Case 2: Confirmation popup appears without Barcode
  if (result === 'confirmation') {
    console.log('BUG CHECK: Confirmation popup appeared without Barcode.');

    await expect(
      page.getByRole('heading', { name: 'Are you sure ?' })
    ).toBeVisible();

    await expect(
      page.getByText('Do you really want to save?', { exact: true })
    ).toBeVisible();

    // Click OK
    await page.getByRole('button', { name: 'OK' }).click();

    const runtimeError = page.getByText('Runtime error happened', {
      exact: true,
    });

    const saveSuccess = page.getByText(
      'Inventory item save successfully',
      { exact: true }
    );

    // Check runtime error or successful save
    const outcome = await Promise.race([
      runtimeError.waitFor({ state: 'visible', timeout: 15000 })
        .then(() => 'runtime-error')
        .catch(() => null),

      saveSuccess.waitFor({ state: 'visible', timeout: 15000 })
        .then(() => 'saved')
        .catch(() => null),
    ]);

    if (outcome === 'runtime-error') {
      console.log(
        'BUG FOUND: Runtime error appeared after confirming save with Barcode empty.'
      );

      await expect(runtimeError).toBeVisible();

      throw new Error(
        'BUG FOUND: Runtime error happened when saving Inventory Item without Barcode.'
      );
    }

    if (outcome === 'saved') {
      throw new Error(
        'BUG FOUND: Inventory Item was saved without Barcode.'
      );
    }

    throw new Error(
      'Unexpected result: Neither runtime error nor save success message appeared.'
    );
  }

  // Unexpected result
  throw new Error(
    'Neither Barcode validation nor save confirmation popup appeared.'
  );
});
