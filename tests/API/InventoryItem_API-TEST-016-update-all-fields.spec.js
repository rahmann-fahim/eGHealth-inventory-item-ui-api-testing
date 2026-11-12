import { test, expect } from '@playwright/test';
import 'dotenv/config';

test('API-TEST-016 - Update Inventory Item With All Populated Fields Successfully', async ({ request }) => {
  test.setTimeout(60000);

  // =====================================================
  // STEP 1: CONFIGURATION
  // =====================================================

  const requiredEnv = [
    'APP_USERNAME',
    'APP_PASSWORD',
    'API_BRANCH_ID',
    'API_BUILDING_ID'
  ];

  for (const key of requiredEnv) {
    expect(
      process.env[key]?.trim(),
      `Missing .env variable: ${key}`
    ).toBeTruthy();
  }

  const baseUrl = (
    process.env.API_BASE_URL || 'http://192.168.10.99'
  ).replace(/\/$/, '');

  const loginUrl =
    process.env.API_AUTH_URL ||
    `${baseUrl}/api/v1/authentication/authenticate`;

  const itemUrl = `${baseUrl}/api/v1/scm/inventory-item`;
  const searchUrl = `${itemUrl}/search-page`;

  const branchId = process.env.API_BRANCH_ID;
  const buildingId = process.env.API_BUILDING_ID;
  const storeId =
    process.env.API_STORE_ID ||
    'c13097a7-ef42-49a5-bbf1-bbf6e54854f8';

  // Existing disposable item
  const existingItemId = 'b5e41f3b-8430-4629-b3cf-116da963ee01';
  const existingItemName = 'ff2222';
  const existingBarcode = 'ff2222';

  const uniqueId = Date.now();

  const newItemName = `API Updated Full Form Item 016 ${uniqueId}`;
  const newBarcode = `APIUPDATE016${uniqueId}`;
  const newMaterialName = `Updated Material 016 ${uniqueId}`;
  const newStrength = `API016 Strength ${uniqueId}`;
  const newTherapeuticNote = `Updated Therapeutic Note 016 ${uniqueId}`;

  // =====================================================
  // STEP 2: HELPERS
  // =====================================================

  async function parseJsonResponse(response, label) {
    const rawText = await response.text();

    let body;
    try {
      body = JSON.parse(rawText);
    } catch {
      throw new Error(
        `${label} returned non-JSON response. HTTP ${response.status()}: ${rawText}`
      );
    }

    return { body, rawText };
  }

  // =====================================================
  // STEP 3: BRANCH-AWARE LOGIN
  // =====================================================

  const loginResponse = await request.post(loginUrl, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    data: {
      username: process.env.APP_USERNAME,
      password: process.env.APP_PASSWORD,
      branchId,
      buildingId
    },
    timeout: 30000
  });

  const { body: loginBody, rawText: loginText } =
    await parseJsonResponse(loginResponse, 'Login API');

  expect(
    loginResponse.ok(),
    `Login failed. HTTP ${loginResponse.status()}: ${loginText}`
  ).toBeTruthy();

  expect(
    loginBody.status,
    `Login API returned unsuccessful status: ${loginText}`
  ).not.toBe(false);

  const token =
    loginBody.access_token ||
    loginBody.data?.access_token ||
    loginBody.accessToken ||
    loginBody.data?.accessToken ||
    loginBody.token ||
    loginBody.data?.token;

  expect(token, 'Authentication token missing from login response').toBeTruthy();

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };

  console.log('Branch-aware API Login Successful');

  // =====================================================
  // STEP 4: SEARCH API HELPER
  // =====================================================

  async function searchItem(itemName) {
    const response = await request.post(searchUrl, {
      headers,
      data: {
        itemName,
        branchId,
        storeIdList: [storeId],
        deletedNotOrNull: true,
        page: 0,
        size: 20
      },
      timeout: 30000
    });

    const { body, rawText } =
      await parseJsonResponse(response, 'Inventory Item Search API');

    console.log('Search HTTP Status:', response.status());

    expect(
      response.ok(),
      `Search API failed. HTTP ${response.status()}: ${rawText}`
    ).toBeTruthy();

    expect(
      body.status,
      `Search API returned unsuccessful status: ${body.message || rawText}`
    ).toBe(true);

    const results = body.data?.content;

    expect(
      Array.isArray(results),
      `Search API did not return data.content array: ${rawText}`
    ).toBe(true);

    return results;
  }

  // =====================================================
  // STEP 5: FIND EXISTING ITEM
  // =====================================================

  console.log('--------------------------------');
  console.log('API-TEST-016: Search Existing Inventory Item');
  console.log('Existing Item ID:', existingItemId);
  console.log('Existing Item Name:', existingItemName);

  const existingResults = await searchItem(existingItemName);

  const existingItem = existingResults.find(
    item => item.id === existingItemId
  );

  expect(
    existingItem,
    `Existing item not found by ID ${existingItemId}. Search results: ${JSON.stringify(existingResults)}`
  ).toBeDefined();

  expect(existingItem.itemName).toBe(existingItemName);
  expect(existingItem.itemBarcode).toBe(existingBarcode);

  console.log('Existing Item Found Successfully');
  console.log('Existing Item ID:', existingItem.id);
  console.log('Existing Item Name:', existingItem.itemName);
  console.log('Existing Barcode:', existingItem.itemBarcode);
  console.log('Search Result Count:', existingResults.length);

  // =====================================================
  // STEP 6: PREPARE UPDATE PAYLOAD
  // =====================================================

  const updatePayload = JSON.parse(JSON.stringify(existingItem));

  const manufacturerName =
    existingItem.manufacturerName || '3M Enterprise';

  const supplierId = existingItem.supplierId;
  const manufacturerId = existingItem.manufacturerId;
  const actualStoreId = existingItem.storeId || storeId;

  if (
    !Array.isArray(updatePayload.inventoryItemSupplierList) ||
    updatePayload.inventoryItemSupplierList.length === 0
  ) {
    if (supplierId) {
      updatePayload.inventoryItemSupplierList = [supplierId];
    }
  }

  updatePayload.id = existingItemId;

  updatePayload.itemTypeEnumKey =
    existingItem.itemTypeEnumKey || 'MEDICINE';

  updatePayload.itemCategoryId = existingItem.itemCategoryId;
  updatePayload.genericId = existingItem.genericId;
  updatePayload.routeId = existingItem.routeId;
  updatePayload.doseId = existingItem.doseId;
  updatePayload.unitOfMeasureId = existingItem.unitOfMeasureId;

  updatePayload.packSizeFkId =
    existingItem.packSizeFkId ?? existingItem.unitOfMeasureId;

  updatePayload.supplierId = supplierId;
  updatePayload.manufacturerId = manufacturerId;
  updatePayload.storeId = actualStoreId;

  // Update populated fields with new data
  updatePayload.itemName = newItemName;
  updatePayload.itemBarcode = newBarcode;
  updatePayload.materialName = newMaterialName;
  updatePayload.strength = newStrength;
  updatePayload.reOrderLevel = 15;
  updatePayload.expireNotifyDays = 150;
  updatePayload.therapeuticClassNote = newTherapeuticNote;
  updatePayload.duration = 14;

  // UI update-mode fields
  updatePayload.loadingMode = true;
  updatePayload.updateMode = true;
  updatePayload.page = null;
  updatePayload.size = 10;
  updatePayload.multiSearchProp = null;
  updatePayload.displayProp = null;

  // =====================================================
  // STEP 7: PRE-UPDATE VALIDATION
  // =====================================================

  const requiredFields = [
    'id',
    'itemName',
    'itemBarcode',
    'itemTypeEnumKey',
    'itemCategoryId',
    'genericId',
    'unitOfMeasureId',
    'supplierId',
    'manufacturerId',
    'storeId'
  ];

  for (const field of requiredFields) {
    expect(
      updatePayload[field],
      `Required update field is missing: ${field}`
    ).toBeTruthy();
  }

  expect(updatePayload.id).toBe(existingItemId);
  expect(updatePayload.updateMode).toBe(true);
  expect(updatePayload.loadingMode).toBe(true);

  expect(
    Array.isArray(updatePayload.inventoryItemSupplierList),
    'inventoryItemSupplierList must be an array for the UI-aligned update payload'
  ).toBe(true);

  expect(
    updatePayload.inventoryItemSupplierList.length
  ).toBeGreaterThan(0);

  expect(
    updatePayload.inventoryItemSupplierList
  ).toContain(supplierId);

  console.log('--------------------------------');
  console.log('API-TEST-016: Update Payload Prepared');
  console.log('Existing Item ID:', existingItemId);
  console.log('Old Item Name:', existingItem.itemName);
  console.log('New Item Name:', updatePayload.itemName);
  console.log('Old Barcode:', existingItem.itemBarcode);
  console.log('New Barcode:', updatePayload.itemBarcode);
  console.log('New Material Name:', updatePayload.materialName);
  console.log('New Strength:', updatePayload.strength);
  console.log('Item Type:', updatePayload.itemTypeEnumKey);
  console.log('Item Category ID:', updatePayload.itemCategoryId);
  console.log('Generic ID:', updatePayload.genericId);
  console.log('Route ID:', updatePayload.routeId);
  console.log('Dose ID:', updatePayload.doseId);
  console.log('UOM ID:', updatePayload.unitOfMeasureId);
  console.log('Pack Size FK ID:', updatePayload.packSizeFkId);
  console.log('Supplier ID:', updatePayload.supplierId);
  console.log('Supplier List:', updatePayload.inventoryItemSupplierList);
  console.log('Manufacturer ID:', updatePayload.manufacturerId);
  console.log('Manufacturer Name:', manufacturerName);
  console.log('Store ID:', updatePayload.storeId);
  console.log('Re-Order Level:', updatePayload.reOrderLevel);
  console.log('Expiry Days:', updatePayload.expireNotifyDays);
  console.log('Therapeutic Note:', updatePayload.therapeuticClassNote);
  console.log('Duration:', updatePayload.duration);
  console.log('Update Mode:', updatePayload.updateMode);
  console.log('Loading Mode:', updatePayload.loadingMode);

  // =====================================================
  // STEP 8: SEND PUT UPDATE REQUEST
  // =====================================================

  console.log('--------------------------------');
  console.log('Sending UI-aligned PUT Update Request...');
  console.log('API Method: PUT');
  console.log('API Endpoint:', itemUrl);

  const updateResponse = await request.put(itemUrl, {
    headers,
    data: updatePayload,
    timeout: 30000
  });

  const updateStatus = updateResponse.status();

  const { body: updateBody, rawText: updateText } =
    await parseJsonResponse(updateResponse, 'Inventory Item PUT API');

  console.log('--------------------------------');
  console.log('Actual HTTP Status:', updateStatus);
  console.log('Response Body HTTP Code:', updateBody.httpStatusCode);
  console.log('API Response Code:', updateBody.apiResponseCode);
  console.log('API Status:', updateBody.status);
  console.log('API Message:', updateBody.message);
  console.log('Returned Item ID:', updateBody.data?.id ?? null);
  console.log('Full API Response:', updateText);

  if (!updateResponse.ok() || updateBody.status !== true) {
    console.error('--------------------------------');
    console.error('API-TEST-016 UPDATE FAILED');
    console.error('HTTP Status:', updateStatus);
    console.error('API Message:', updateBody.message);
    console.error('Submitted Item ID:', existingItemId);
    console.error('Submitted Item Name:', newItemName);
    console.error('Submitted Barcode:', newBarcode);
    console.error('Supplier ID:', supplierId);
    console.error('Manufacturer ID:', manufacturerId);
    console.error('Pack Size FK ID:', updatePayload.packSizeFkId);
    console.error('--------------------------------');

    throw new Error(
      `UPDATE FAILED: HTTP ${updateStatus} - ${updateBody.message || updateText}`
    );
  }

  expect(updateBody.data?.id).toBe(existingItemId);
  expect(updateBody.message).toMatch(/updated successfully/i);

  expect(updateBody.data.itemName).toBe(newItemName);
  expect(updateBody.data.itemBarcode).toBe(newBarcode);

  // =====================================================
  // STEP 9: VERIFY THROUGH SEARCH API
  // =====================================================

  console.log('--------------------------------');
  console.log('Searching Updated Item Through Search API...');

  let updatedItem;
  let updatedResults = [];

  for (let attempt = 1; attempt <= 3; attempt++) {
    updatedResults = await searchItem(newItemName);

    updatedItem = updatedResults.find(
      item => item.id === existingItemId
    );

    if (updatedItem) {
      break;
    }

    if (attempt < 3) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  expect(
    updatedItem,
    `Updated item was not found through Search API. Results: ${JSON.stringify(updatedResults)}`
  ).toBeDefined();

  // =====================================================
  // STEP 10: VERIFY UPDATED FIELDS
  // =====================================================

  console.log('--------------------------------');
  console.log('Verifying Updated Inventory Item...');

  const expectedValues = {
    id: existingItemId,
    itemName: newItemName,
    itemBarcode: newBarcode,
    materialName: newMaterialName,
    strength: newStrength,
    therapeuticClassNote: newTherapeuticNote
  };

  for (const [field, expected] of Object.entries(expectedValues)) {
    console.log(`${field}:`, updatedItem[field]);

    expect(
      updatedItem[field],
      `Updated value mismatch for ${field}`
    ).toEqual(expected);
  }

  const numericExpectedValues = {
    reOrderLevel: 15,
    expireNotifyDays: 150,
    duration: 14
  };

  for (const [field, expected] of Object.entries(numericExpectedValues)) {
    expect(
      Number(updatedItem[field]),
      `Updated numeric value mismatch for ${field}`
    ).toBe(expected);

    console.log(`${field}:`, updatedItem[field]);
  }

  // Verify relationship IDs
  const relationshipFields = [
    'itemCategoryId',
    'genericId',
    'routeId',
    'doseId',
    'unitOfMeasureId',
    'packSizeFkId',
    'supplierId',
    'manufacturerId',
    'storeId'
  ];

  for (const field of relationshipFields) {
    if (updatePayload[field] !== undefined) {
      expect(
        updatedItem[field],
        `Relationship ID changed unexpectedly: ${field}`
      ).toEqual(updatePayload[field]);
    }
  }

  console.log('--------------------------------');
  console.log('API-TEST-016 PASSED');
  console.log('Inventory Item Updated Successfully');
  console.log('Verified Existing Item ID:', updatedItem.id);
  console.log('Verified New Item Name:', updatedItem.itemName);
  console.log('Verified New Barcode:', updatedItem.itemBarcode);
  console.log('Verified Material Name:', updatedItem.materialName);
  console.log('Verified Strength:', updatedItem.strength);
  console.log('Verified Re-Order Level:', updatedItem.reOrderLevel);
  console.log('Verified Expiry Days:', updatedItem.expireNotifyDays);
  console.log('Verified Duration:', updatedItem.duration);
  console.log('All updated populated fields verified through Search API.');
  console.log('--------------------------------');
});