import { test, expect } from '@playwright/test';
import 'dotenv/config';

test('Update Inventory Item With All Fields Successfully', async ({ request }) => {

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

  const itemUrl =
    `${baseUrl}/api/v1/scm/inventory-item`;

  const searchUrl =
    `${itemUrl}/search-page`;

  const branchId = process.env.API_BRANCH_ID;
  const buildingId = process.env.API_BUILDING_ID;

  const storeId =
    process.env.API_STORE_ID ||
    'c13097a7-ef42-49a5-bbf1-bbf6e54854f8';

  // API-TEST-001 CREATED ITEM
  const existingItemId =
    '80db6ad5-34d6-4266-8647-9fb3b3669255';

  const existingItemName =
    'API Full Form Item 001 1794083972745';

  const existingBarcode =
    'APIFULL0011794083972745';

  const uniqueId = Date.now();

  const newItemName =
    `API001 Updated Full Form Item ${uniqueId}`;

  const newBarcode =
    `API001UPDATE${uniqueId}`;

  const newMaterialName =
    `API001 Updated Material ${uniqueId}`;

  const newStrength =
    `API001 Updated Strength ${uniqueId}`;

  const newTherapeuticNote =
    `API001 Updated Therapeutic Note ${uniqueId}`;

  // =====================================================
  // STEP 2: JSON RESPONSE HELPER
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

  const {
    body: loginBody,
    rawText: loginText
  } = await parseJsonResponse(loginResponse, 'Login API');

  expect(
    loginResponse.ok(),
    `Login failed: ${loginText}`
  ).toBeTruthy();

  expect(loginBody.status).not.toBe(false);

  const token =
    loginBody.access_token ||
    loginBody.data?.access_token ||
    loginBody.accessToken ||
    loginBody.data?.accessToken ||
    loginBody.token ||
    loginBody.data?.token;

  expect(
    token,
    'Authentication token missing'
  ).toBeTruthy();

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

    const {
      body,
      rawText
    } = await parseJsonResponse(
      response,
      'Inventory Item Search API'
    );

    console.log('Search HTTP Status:', response.status());

    expect(
      response.ok(),
      `Search API failed: ${rawText}`
    ).toBeTruthy();

    expect(
      body.status,
      `Search API unsuccessful: ${body.message}`
    ).toBe(true);

    expect(
      Array.isArray(body.data?.content),
      'Search result content is not an array'
    ).toBe(true);

    return body.data.content;
  }

  // =====================================================
  // STEP 5: FIND API-TEST-001 CREATED ITEM
  // =====================================================

  console.log('--------------------------------');
  console.log('RECHECK: API-TEST-001 CREATED ITEM');

  console.log('Existing Item ID:', existingItemId);
  console.log('Existing Item Name:', existingItemName);
  console.log('Existing Barcode:', existingBarcode);

  const existingResults =
    await searchItem(existingItemName);

  const existingItem =
    existingResults.find(
      item => item.id === existingItemId
    );

  expect(
    existingItem,
    `API-TEST-001 item not found: ${existingItemId}`
  ).toBeDefined();

  expect(existingItem.itemName).toBe(existingItemName);

  expect(existingItem.itemBarcode).toBe(existingBarcode);

  console.log('Existing API-TEST-001 Item Found Successfully');
  console.log('Item ID:', existingItem.id);
  console.log('Item Name:', existingItem.itemName);
  console.log('Barcode:', existingItem.itemBarcode);

  // =====================================================
  // STEP 6: PREPARE UPDATE PAYLOAD
  // =====================================================

  // Use complete existing Search API object.
  // Preserve existing relationships and nullable fields.

  const updatePayload =
    JSON.parse(JSON.stringify(existingItem));

  // Preserve original relationship IDs.
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

  const originalRelationships = {};

  for (const field of relationshipFields) {
    originalRelationships[field] =
      updatePayload[field];
  }

  // Preserve existing supplier list.
  if (
    (!Array.isArray(updatePayload.inventoryItemSupplierList) ||
      updatePayload.inventoryItemSupplierList.length === 0) &&
    updatePayload.supplierId
  ) {
    updatePayload.inventoryItemSupplierList = [
      updatePayload.supplierId
    ];
  }

  // Change editable populated fields.
  updatePayload.itemName = newItemName;
  updatePayload.itemBarcode = newBarcode;
  updatePayload.materialName = newMaterialName;
  updatePayload.strength = newStrength;

  updatePayload.reOrderLevel = 15;
  updatePayload.expireNotifyDays = 150;

  updatePayload.therapeuticClassNote =
    newTherapeuticNote;

  updatePayload.duration = 14;

  // UI update-mode properties.
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
    'manufacturerId',
    'storeId'
  ];

  for (const field of requiredFields) {

    expect(
      updatePayload[field],
      `Missing update field: ${field}`
    ).toBeTruthy();

  }

  expect(updatePayload.id).toBe(existingItemId);

  expect(
    Array.isArray(updatePayload.inventoryItemSupplierList) &&
    updatePayload.inventoryItemSupplierList.length > 0,
    'Existing Supplier List is missing'
  ).toBe(true);

  console.log('--------------------------------');
  console.log('UPDATE PAYLOAD PREPARED');

  console.log('Existing Item ID:', existingItemId);

  console.log('Old Item Name:', existingItem.itemName);
  console.log('New Item Name:', newItemName);

  console.log('Old Barcode:', existingItem.itemBarcode);
  console.log('New Barcode:', newBarcode);

  console.log('New Material Name:', newMaterialName);
  console.log('New Strength:', newStrength);

  console.log('Item Type:', updatePayload.itemTypeEnumKey);

  console.log('Item Category:', updatePayload.itemCategoryId);
  console.log('Generic ID:', updatePayload.genericId);

  console.log('UOM ID:', updatePayload.unitOfMeasureId);
  console.log('Supplier ID:', updatePayload.supplierId);
  console.log('Supplier List:', updatePayload.inventoryItemSupplierList);

  console.log('Manufacturer ID:', updatePayload.manufacturerId);
  console.log('Store ID:', updatePayload.storeId);

  console.log('Pack Size FK ID:', updatePayload.packSizeFkId);

  console.log('Re-Order Level:', updatePayload.reOrderLevel);
  console.log('Expiry Days:', updatePayload.expireNotifyDays);

  console.log('Therapeutic Note:', newTherapeuticNote);
  console.log('Duration:', updatePayload.duration);

  console.log('Update Mode:', updatePayload.updateMode);
  console.log('Loading Mode:', updatePayload.loadingMode);

  // =====================================================
  // STEP 8: SEND PUT REQUEST
  // =====================================================

  console.log('--------------------------------');
  console.log('Sending PUT Update Request...');

  console.log('API Method: PUT');
  console.log('API Endpoint:', itemUrl);

  const updateResponse = await request.put(itemUrl, {

    headers,

    data: updatePayload,

    timeout: 30000

  });

  const updateStatus = updateResponse.status();

  const {
    body: updateBody,
    rawText: updateText
  } = await parseJsonResponse(
    updateResponse,
    'Inventory Item PUT API'
  );

  console.log('--------------------------------');

  console.log('Actual HTTP Status:', updateStatus);

  console.log(
    'Response Body HTTP Code:',
    updateBody.httpStatusCode
  );

  console.log(
    'API Response Code:',
    updateBody.apiResponseCode
  );

  console.log('API Status:', updateBody.status);
  console.log('API Message:', updateBody.message);

  console.log(
    'Returned Item ID:',
    updateBody.data?.id ?? null
  );

  console.log('Full API Response:', updateText);

  if (!updateResponse.ok() || updateBody.status !== true) {

    console.error('--------------------------------');
    console.error('API-TEST-001 ITEM UPDATE FAILED');

    console.error('HTTP Status:', updateStatus);
    console.error('API Message:', updateBody.message);

    console.error('Submitted Item ID:', existingItemId);
    console.error('Submitted Item Name:', newItemName);
    console.error('Submitted Barcode:', newBarcode);

    console.error('Supplier ID:', updatePayload.supplierId);
    console.error('Manufacturer ID:', updatePayload.manufacturerId);

    console.error('Supplier List:', updatePayload.inventoryItemSupplierList);

    console.error('--------------------------------');

    throw new Error(
      `UPDATE FAILED: HTTP ${updateStatus} - ${updateBody.message || updateText}`
    );

  }

  expect(updateBody.data?.id).toBe(existingItemId);

  expect(
    updateBody.message
  ).toMatch(/updated successfully/i);

  expect(updateBody.data.itemName).toBe(newItemName);

  expect(updateBody.data.itemBarcode).toBe(newBarcode);

  // =====================================================
  // STEP 9: VERIFY THROUGH SEARCH API
  // =====================================================

  console.log('--------------------------------');
  console.log('VERIFYING UPDATED ITEM THROUGH SEARCH API');

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
      await new Promise(
        resolve => setTimeout(resolve, 1000)
      );
    }

  }

  expect(
    updatedItem,
    'Updated API-TEST-001 item not found through Search API'
  ).toBeDefined();

  // =====================================================
  // STEP 10: VERIFY UPDATED FIELD VALUES
  // =====================================================

  console.log('--------------------------------');
  console.log('VERIFYING UPDATED FIELDS');

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
      `Updated value mismatch: ${field}`
    ).toEqual(expected);

  }

  const numericExpectedValues = {

    reOrderLevel: 15,

    expireNotifyDays: 150,

    duration: 14

  };

  for (const [field, expected] of Object.entries(numericExpectedValues)) {

    console.log(`${field}:`, updatedItem[field]);

    expect(
      Number(updatedItem[field]),
      `Updated numeric value mismatch: ${field}`
    ).toBe(expected);

  }

  // Verify original relationship IDs.
  for (const field of relationshipFields) {

    if (originalRelationships[field] !== undefined) {

      expect(
        updatedItem[field],
        `Relationship ID changed: ${field}`
      ).toEqual(originalRelationships[field]);

    }

  }

  // =====================================================
  // STEP 11: FINAL RESULT
  // =====================================================

  console.log('--------------------------------');
  console.log('UPDATE INVENTORY ITEM WITH ALL FIELDS SUCCESSFULLY');
  console.log('--------------------------------');

  console.log('API TEST PASSED');

  console.log('Original Item ID:', existingItemId);

  console.log('Updated Item Name:', updatedItem.itemName);

  console.log('Updated Barcode:', updatedItem.itemBarcode);

  console.log('Updated Material:', updatedItem.materialName);

  console.log('Updated Strength:', updatedItem.strength);

  console.log('Updated Re-Order Level:', updatedItem.reOrderLevel);

  console.log('Updated Expiry Days:', updatedItem.expireNotifyDays);

  console.log('Updated Duration:', updatedItem.duration);

  console.log('All updated fields verified through Search API.');

  console.log('--------------------------------');

});