
import { test, expect } from '@playwright/test';
import 'dotenv/config';

test('API-TEST-013 - Create Inventory Item With Duplicate Item Name', async ({ request }) => {

  // STEP 1: Check environment configuration
  const requiredEnv = [
    'APP_USERNAME',
    'APP_PASSWORD',
    'API_BRANCH_ID',
    'API_BUILDING_ID',
    'API_ITEM_TYPE_KEY',
    'API_ITEM_CATEGORY_ID',
    'API_GENERIC_ID',
    'API_UOM_ID',
    'API_SUPPLIER_ID',
    'API_MANUFACTURER_ID',
    'API_STORE_ID'
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

  const loginUrl = process.env.API_AUTH_URL ||
    `${baseUrl}/api/v1/authentication/authenticate`;

  const saveUrl = `${baseUrl}/api/v1/scm/inventory-item`;

  // STEP 2: Branch-aware API login
  const loginResponse = await request.post(loginUrl, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    data: {
      username: process.env.APP_USERNAME,
      password: process.env.APP_PASSWORD,
      branchId: process.env.API_BRANCH_ID,
      buildingId: process.env.API_BUILDING_ID
    },
    timeout: 30000
  });

  expect(
    loginResponse.ok(),
    `Login failed: HTTP ${loginResponse.status()}`
  ).toBeTruthy();

  const loginBody = await loginResponse.json();

  expect(
    loginBody.status,
    `Login failed: ${loginBody.message || 'Unknown error'}`
  ).not.toBe(false);

  const token = loginBody.access_token;
  expect(token, 'Access token missing').toBeTruthy();

  console.log('Branch-aware API Login Successful');

  // STEP 3: Existing Item Name, new Barcode
  const existingItemName = 'API Without UOM 008 1794156463380';
  const newBarcode = `APIDUPNAME013${Date.now()}`;

  // STEP 4: Prepare valid payload with duplicate name
  const payload = {
    id: null,

    // NEGATIVE TEST: Existing Item Name
    itemName: existingItemName,

    // Unique Barcode to isolate Item Name validation
    itemBarcode: newBarcode,

    itemTypeEnumKey: process.env.API_ITEM_TYPE_KEY,
    itemCategoryId: process.env.API_ITEM_CATEGORY_ID,
    genericId: process.env.API_GENERIC_ID,
    unitOfMeasureId: process.env.API_UOM_ID,

    inventoryItemSupplierList: [
      process.env.API_SUPPLIER_ID
    ],

    manufacturerId: process.env.API_MANUFACTURER_ID,
    storeId: process.env.API_STORE_ID,

    enabled: true,
    loadingMode: true,
    updateMode: false,
    page: null,
    size: 10
  };

  expect(payload.itemName).toBe(existingItemName);
  expect(payload.itemBarcode).not.toBe('APIREQ0081794156463380');
  expect(payload.itemTypeEnumKey).toBe('MEDICINE');

  // STEP 5: Display submitted test data
  console.log('--------------------------------');
  console.log('API-TEST-013: Duplicate Item Name Validation');
  console.log('Existing Item Name:', existingItemName);
  console.log('New Barcode:', newBarcode);
  console.log('Submitted Item Type:', payload.itemTypeEnumKey);
  console.log('Submitted Item Category:', payload.itemCategoryId);
  console.log('Submitted Generic ID:', payload.genericId);
  console.log('Submitted UOM ID:', payload.unitOfMeasureId);
  console.log('Submitted Store ID:', payload.storeId);
  console.log('Sending POST request with duplicate Item Name...');

  // STEP 6: Send Inventory Item Save request
  const response = await request.post(saveUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    data: payload,
    timeout: 30000
  });

  const httpStatus = response.status();
  const responseText = await response.text();

  let body;
  try {
    body = JSON.parse(responseText);
  } catch {
    console.error('Non-JSON Response:', responseText);

    throw new Error(
      `Unexpected non-JSON response: HTTP ${httpStatus}`
    );
  }

  // STEP 7: Display actual API response
  console.log('API Method: POST');
  console.log('API Endpoint:', saveUrl);
  console.log('Actual HTTP Status:', httpStatus);
  console.log('Response Body HTTP Code:', body.httpStatusCode);
  console.log('API Response Code:', body.apiResponseCode);
  console.log('API Status:', body.status);
  console.log('API Message:', body.message);
  console.log('Returned Item ID:', body.data?.id ?? null);
  console.log('Full API Response:', responseText);

  // STEP 8: Check whether duplicate name was accepted
  if (
    body.status === true ||
    body.apiResponseCode === 'SAVE_SUCCESS' ||
    body.data?.id
  ) {
    console.error('--------------------------------');
    console.error('POSSIBLE DUPLICATE ITEM NAME VALIDATION ISSUE');
    console.error('Existing Item Name:', existingItemName);
    console.error('New Barcode:', newBarcode);
    console.error('Actual HTTP Status:', httpStatus);
    console.error('Returned Item ID:', body.data?.id ?? null);
    console.error('--------------------------------');

    throw new Error(
      `POSSIBLE BUG: API accepted duplicate Item Name. HTTP ${httpStatus}. Confirm whether Item Name must be unique.`
    );
  }

  // STEP 9: Check backend server error
  if (httpStatus >= 500) {
    console.error('--------------------------------');
    console.error('POSSIBLE HTTP STATUS HANDLING BUG');
    console.error('Actual API Message:', body.message);
    console.error('Expected: Appropriate 4xx validation response');
    console.error('Actual HTTP Status:', httpStatus);
    console.error('--------------------------------');

    throw new Error(
      `BUG FOUND: API returned HTTP ${httpStatus} instead of appropriate duplicate Item Name validation status. Message: ${body.message}`
    );
  }

  // STEP 10: Check authentication errors
  if (httpStatus === 401 || httpStatus === 403) {
    throw new Error(
      `Authentication/authorization issue: HTTP ${httpStatus}. ${body.message}`
    );
  }

  // STEP 11: Verify duplicate Item Name validation
  expect(
    [400, 409, 422],
    `Expected 400/409/422 but received HTTP ${httpStatus}`
  ).toContain(httpStatus);

  expect(body.status).toBe(false);

  const errorDetails = JSON.stringify(body);

  expect(
    errorDetails,
    'Expected Item Name-related validation message'
  ).toMatch(/item[\s_-]*name/i);

  expect(
    errorDetails,
    'Expected duplicate or already-exists indication'
  ).toMatch(/duplicate|already|exists|exist|taken|in use|used/i);

  expect(
    body.data?.id ?? null,
    'Duplicate Item Name should not create a new item'
  ).toBeNull();

  // STEP 12: PASS
  console.log('--------------------------------');
  console.log('API-TEST-013 PASSED');
  console.log('Duplicate Item Name correctly rejected');
  console.log('Validation Message:', body.message);
  console.log('--------------------------------');

});
