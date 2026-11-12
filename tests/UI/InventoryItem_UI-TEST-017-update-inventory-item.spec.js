
import { test, expect } from '@playwright/test';
import 'dotenv/config';

test('UI-TEST-017 - Update Existing Inventory Item Name and Barcode', async ({ page }) => {

  const username = process.env.APP_USERNAME;
  const password = process.env.APP_PASSWORD;

  if (!username || !password) {
    throw new Error('Check APP_USERNAME and APP_PASSWORD in .env');
  }

  // Existing saved inventory item
  const existingItemName = 'Duplicate Barcode Original 0134';

  // Generate unique updated values
  const uniqueId = Date.now();
  const newItemName = `Updated Inventory Item 017 ${uniqueId}`;
  const newBarcode = `UPDATE017${uniqueId}`;

  // Step 1: Login
  await page.goto('http://192.168.10.99/auth/login');

  await page.getByRole('textbox', { name: 'Username' })
    .fill(username);

  await page.getByRole('textbox', { name: 'Password' })
    .fill(password);

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).not.toHaveURL(/auth\/login/, {
    timeout: 15000
  });

  // Step 2: Navigate to Inventory Item
  await page.locator('app-sidebar')
    .getByRole('button')
    .filter({ hasText: /^$/ })
    .click();

  await page.getByRole('link', {
    name: /Settings & Security/
  }).click();

  await page.getByRole('link', {
    name: 'Inventory Item'
  }).click();

  await expect(page).toHaveURL(
    /module\/setting\/inventory-item/
  );

  await expect(
    page.getByText('Inventory Item List')
  ).toBeVisible();

  // Step 3: Search existing item
  const searchInput = page.locator(
    'input[formControlName="gridSearchTerm"]'
  );

  await searchInput.fill(existingItemName);

  await page.getByRole('button', {
    name: 'Search',
    exact: true
  }).click();

  // Find matching item in the grid
  const itemRow = page.locator('.ag-row').filter({
    has: page.locator(
      '.ag-cell[col-id="itemName"]',
      { hasText: existingItemName }
    )
  });

  await expect(itemRow).toBeVisible({
    timeout: 15000
  });

  
  // Step 4: Click Edit button for the searched item

  // Verify that only one item is found
  await expect(itemRow).toHaveCount(1);

  // Find the Edit button from the grid
  const editButton = page.getByRole('grid')
    .getByRole('button', { name: '\uf044' });

  await expect(editButton).toHaveCount(1);

  await editButton.click();

  // Verify that the form is in Update mode
  await expect(
    page.getByRole('button', {
      name: 'Update',
      exact: true
    })
  ).toBeVisible({ timeout: 10000 });


  // Step 5: Change Item Name and Barcode
  const itemNameInput = page.locator('#itemName');

  const barcodeInput = page.locator(
    'input[formControlName="itemBarcode"]'
  );

  await expect(itemNameInput).toHaveValue(existingItemName);

  await itemNameInput.fill(newItemName);
  await barcodeInput.fill(newBarcode);

  // Verify updated values before submission
  await expect(itemNameInput).toHaveValue(newItemName);
  await expect(barcodeInput).toHaveValue(newBarcode);

 
  // Step 6: Monitor update API response
  const updateResponses = [];

  page.on('response', async (response) => {
    const request = response.request();

    if (
      ['PUT', 'PATCH', 'POST'].includes(request.method()) &&
      response.url().includes('inventory')
    ) {
      let body = '';

      try {
        body = await response.text();
      } catch (error) {
        body = 'Unable to read response body';
      }

      updateResponses.push({
        url: response.url(),
        method: request.method(),
        status: response.status(),
        body
      });

      console.log('Update API:', request.method(), response.url());
      console.log('API Status:', response.status());
      console.log('API Response:', body);
    }
  });

  // Click Update
  await page.getByRole('button', {
    name: 'Update',
    exact: true
  }).click();

  // Verify confirmation dialog
  await expect(
    page.getByText('Do you really want to update?')
  ).toBeVisible({ timeout: 10000 });

  await page.getByRole('button', {
    name: 'OK',
    exact: true
  }).click();

  // Wait for update request to finish or timeout
  await expect.poll(
    () => updateResponses.length,
    { timeout: 15000 }
  ).toBeGreaterThan(0);

  // Check API result
  console.log('Captured API responses:', updateResponses);

  const failedResponses = updateResponses.filter(
    response => response.status >= 400
  );

  expect(
    failedResponses,
    'Update API returned an error'
  ).toHaveLength(0);

  // Step 7: Search updated item
  await searchInput.fill(newItemName);

  await page.getByRole('button', {
    name: 'Search',
    exact: true
  }).click();

  // Verify updated Item Name
  await expect(
    page.getByRole('gridcell', {
      name: newItemName,
      exact: true
    })
  ).toBeVisible({ timeout: 15000 });

  // Verify updated Barcode
  await expect(
    page.getByRole('gridcell', {
      name: newBarcode,
      exact: true
    })
  ).toBeVisible({ timeout: 15000 });

  console.log('UI-TEST-017 PASSED');


});
