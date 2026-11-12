import 'dotenv/config';
import { test, expect } from '@playwright/test';

const username = process.env.APP_USERNAME;
const password = process.env.APP_PASSWORD;

test('UI-TEST-013 - Full Inventory Item Form Submission', async ({ page }) => {

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

  // Helper: locate input next to its field label
  async function fillFieldByLabel(labelText, value) {
    const label = page.getByText(labelText, { exact: true });

    await expect(label).toBeVisible();

    const input = label
      .locator('xpath=..')
      .locator('input')
      .first();

    await input.fill(value);
  }

  // Helper: select first available option from dropdown
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

  // Helper: select first available option using form dropdown order
  async function selectOptionalDropdown(index) {
    const dropdown = page.locator('ng-select').nth(index);

    await expect(dropdown).toBeVisible();
    await dropdown.click();

    const option = page.locator(
      '.ng-dropdown-panel .ng-option:not(.ng-option-disabled):visible'
    ).first();

    if (await option.isVisible().catch(() => false)) {
      await option.click();
    }

    await page.keyboard.press('Escape');
  }

  // Basic fields
  await page.getByRole('textbox').nth(0).fill('AUTO-UI-TEST-013');

  await page.locator('#itemName')
    .fill('Automation Full Form Item 013');

  await page.getByRole('textbox', { name: 'Strength' })
    .fill('500 mg');

  // Material Name has no accessible textbox name
  await fillFieldByLabel('Material Name', 'Automation Test Material');

  // Required dropdowns
  await selectFirstOption('itemTypeEnumKey');
  await selectFirstOption('itemCategoryId');
  await selectFirstOption('genericId');
  await selectFirstOption('unitOfMeasureId');
  await selectFirstOption('inventoryItemSupplierList');
  await selectFirstOption('manufacturerId');

  // Store is already selected by default in the UI
  const storeDropdown = page.locator(
    'ng-select[formControlName="storeId"]'
  ).first();

  if (await storeDropdown.locator('.ng-value').count() === 0) {
    await selectFirstOption('storeId');
  }

  // Optional dropdown fields
  await selectOptionalDropdown(3);   // Route
  await selectOptionalDropdown(5);   // Pack Size
  await selectOptionalDropdown(8);   // Dose
  await selectOptionalDropdown(9);   // Therapeutic Class
  await selectOptionalDropdown(10);  // Dose Duration
  await selectOptionalDropdown(11);  // Instruction

  // Numeric / text fields
  await page.getByRole('textbox', { name: 'Re-Order Qty' })
    .fill('10');

  await page.getByRole('textbox', { name: 'No. of Day(Exp.)' })
    .fill('365');

  await fillFieldByLabel(
    'Therapeutic Class Note',
    'Automation test note'
  );

  await page.getByRole('spinbutton').fill('7');

  // Checkbox values
  // Active is checked by default.
  // Other checkboxes remain unchecked for this test.

  // Save Inventory Item
  await page.getByRole('button', { name: 'Save', exact: true }).click();

  // Confirm save if confirmation popup appears
  const confirmation = page.getByText('Do you really want to save?');

  if (await confirmation.isVisible().catch(() => false)) {
    const confirmButton = page.getByRole('button', {
      name: /Yes|OK|Confirm/i
    }).last();

    await confirmButton.click();
  }

  // Verify the item appears in the Inventory Item list
  await expect(
    page.getByText('Automation Full Form Item 013', { exact: true })
  ).toBeVisible({ timeout: 15000 });

});