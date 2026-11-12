
import { test, expect } from '@playwright/test';
import 'dotenv/config';

test('API-TEST-012 - Create Inventory Item With Duplicate Barcode', async ({ request }) => {

  // STEP 1: API configuration
  const baseUrl = (
    process.env.API_BASE_URL || 'http://192.168.10.99'
  ).replace(/\/$/, '');

  const loginUrl = process.env.API_AUTH_URL ||
    `${baseUrl}/api/v1/authentication/authenticate`;

  const saveUrl = `${baseUrl}/api/v1/scm/inventory-item`;

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

  // STEP 2: Branch-aware login
  const loginResponse = await request.post(loginUrl, {
    data: {
      username: process.env.APP_USERNAME,
      password: process.env.APP_PASSWORD,
      branchId: process.env.API_BRANCH_ID,
      buildingId: process.env.API_BUILDING_ID
    }
  });

  expect(loginResponse.ok()).toBeTruthy();

  const loginBody = await loginResponse.json();
  const token = loginBody.access_token;

  expect(token).toBeTruthy();

  console.log('Branch-aware API Login Successful');

  // STEP 3: Existing barcode, new item name
  const itemName = `API Duplicate Barcode Test 012 ${Date.now()}`;

  // Existing barcode from successful API-TEST-008
  const existingBarcode = 'APIREQ0081794156463380';

  // STEP 4: Prepare request payload
  const payload = {
    id: null,
    itemName,
    itemBarcode: existingBarcode,

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

  console.log('--------------------------------');
  console.log('API-TEST-012: Duplicate Barcode Validation');
  console.log('New Item Name:', itemName);
  console.log('Existing Barcode:', existingBarcode);
  console.log('Sending POST request with duplicate Barcode...');

  // STEP 5: Send POST request
  const response = await request.post(saveUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    data: payload
  });

  const httpStatus = response.status();
  const responseText = await response.text();

  let body;
  try {
    body = JSON.parse(responseText);
  } catch {
    throw new Error(
      `Unexpected non-JSON response: HTTP ${httpStatus}: ${responseText}`
    );
  }

  // STEP 6: Log API response
  console.log('API Method: POST');
  console.log('API Endpoint:', saveUrl);
  console.log('Actual HTTP Status:', httpStatus);
  console.log('Response Body HTTP Code:', body.httpStatusCode);
  console.log('API Response Code:', body.apiResponseCode);
  console.log('API Status:', body.status);
  console.log('API Message:', body.message);
  console.log('Returned Item ID:', body.data?.id ?? null);
  console.log('Full API Response:', responseText);

  // STEP 7: Detect duplicate Barcode being accepted
  if (
    body.status === true ||
    body.apiResponseCode === 'SAVE_SUCCESS' ||
    body.data?.id
  ) {
    throw new Error(
      `BUG FOUND: API created another item with duplicate Barcode. HTTP ${httpStatus}, Item ID: ${body.data?.id ?? 'N/A'}`
    );
  }

  // STEP 8: Detect backend runtime errors
  if (httpStatus >= 500) {
    throw new Error(
      `BUG FOUND: API returned HTTP ${httpStatus} instead of duplicate Barcode validation. Message: ${body.message}`
    );
  }

  // STEP 9: Verify duplicate Barcode validation
  expect(
    [400, 409, 422],
    `Expected duplicate Barcode rejection with HTTP 400/409/422, received ${httpStatus}`
  ).toContain(httpStatus);

  expect(body.status).toBe(false);

  const errorDetails = JSON.stringify(body);

  expect(
    errorDetails,
    'Expected a Barcode-related duplicate validation message'
  ).toMatch(/barcode/i);

  expect(
    errorDetails,
    'Expected an indication that the Barcode already exists'
  ).toMatch(/duplicate|already|exists|exist|taken|in use|used/i);

  expect(body.data?.id ?? null).toBeNull();

  console.log('--------------------------------');
  console.log('API-TEST-012 PASSED');
  console.log('Duplicate Barcode was correctly rejected');
  console.log('Validation Message:', body.message);
  console.log('--------------------------------');

});
