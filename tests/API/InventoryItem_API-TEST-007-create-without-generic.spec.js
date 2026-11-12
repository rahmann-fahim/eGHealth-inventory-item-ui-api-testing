
import { test, expect } from '@playwright/test';
import 'dotenv/config';

test('API-TEST-007 - Create Inventory Item Without Generic', async ({ request }) => {

  // Step 1: Check required environment variables
  const requiredEnv = [
    'APP_USERNAME',
    'APP_PASSWORD',
    'API_BRANCH_ID',
    'API_BUILDING_ID',
    'API_ITEM_TYPE_KEY',
    'API_ITEM_CATEGORY_ID',
    'API_UOM_ID',
    'API_SUPPLIER_ID',
    'API_MANUFACTURER_ID',
    'API_STORE_ID'
  ];

  for (const key of requiredEnv) {
    if (!process.env[key]?.trim()) {
      throw new Error(`Missing .env variable: ${key}`);
    }
  }

  const baseUrl = (
    process.env.API_BASE_URL || 'http://192.168.10.99'
  ).replace(/\/$/, '');

  const loginUrl = process.env.API_AUTH_URL ||
    `${baseUrl}/api/v1/authentication/authenticate`;

  const saveUrl = `${baseUrl}/api/v1/scm/inventory-item`;

  // Step 2: Branch-aware API login
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
    `Login API failed: HTTP ${loginResponse.status()}`
  ).toBeTruthy();

  const loginBody = await loginResponse.json();

  expect(
    loginBody.status,
    `Login failed: ${loginBody.message || 'Unknown error'}`
  ).not.toBe(false);

  const token = loginBody.access_token;

  expect(
    token,
    'Access token not found in login response'
  ).toBeTruthy();

  console.log('Branch-aware API Login Successful');

  // Step 3: Generate unique test data
  const uniqueId = Date.now();

  const itemName = `API Without Generic 007 ${uniqueId}`;
  const barcode = `APIREQ007${uniqueId}`;

  // Step 4: Prepare Inventory Item payload
  const payload = {
    id: null,
    itemName,
    itemBarcode: barcode,

    // Valid Item Type and Medicine Item Category
    itemTypeEnumKey: process.env.API_ITEM_TYPE_KEY,
    itemCategoryId: process.env.API_ITEM_CATEGORY_ID,

    // NEGATIVE TEST: Generic is intentionally null
    genericId: null,
    genericName: null,

    // Other required fields remain valid
    unitOfMeasureId: process.env.API_UOM_ID,

    inventoryItemSupplierList: [
      process.env.API_SUPPLIER_ID
    ],

    manufacturerId: process.env.API_MANUFACTURER_ID,
    storeId: process.env.API_STORE_ID,

    // Optional fields
    formattedItemName: null,
    formattedItemNameV2: null,
    formattedItemNameV3: null,
    generalFormattedItemName: null,

    routeId: null,
    routeName: null,
    brandId: null,
    brandName: null,
    departmentId: null,

    doseId: null,
    doseName: null,
    code: null,
    ma: null,
    materialName: null,

    itemCategoryName: null,
    medicinePowerId: null,
    medicinePowerName: null,
    medicineUnitId: null,
    medicineUnitName: null,

    deliverDays: null,
    salesRate: null,
    purchaseRate: null,
    modelId: null,
    modelName: null,

    itemTypeEnumValue: null,
    packSize: null,
    packSizeFkId: null,
    itemStateEnumKey: null,
    itemStateEnumValue: null,

    unitOfMeasureName: null,
    supplierId: null,
    supplierName: null,
    manufacturerName: null,

    rate: null,
    reOrderLevel: null,
    currentStock: null,
    numberOfDay: null,

    foreignFlag: null,
    expirable: null,
    batchable: null,
    dgdaId: null,

    strength: null,
    expireNotifyDays: null,
    demandQty: null,
    enabled: true,

    expiryStatusForNextMonths: null,
    analyzerId: null,
    analyzerUid: null,
    analyzerName: null,

    therapeuticClassId: null,
    therapeuticClassNote: null,

    itemAvailabilityType: null,
    purchaseTypeEnumKey: null,
    salesQuantity: null,
    salesUnitId: null,
    tsQuantity: null,

    doseDurationId: null,
    doseDurationName: null,
    instructionId: null,
    instructionName: null,
    duration: null,
    description: null,

    storage_location_id: null,
    storage_location_name: null,
    storage_condition_id: null,
    storage_condition_name: null,

    oldOty: null,
    expiredOty: null,
    shortDateQty: null,
    itemStockId: null,

    inventoryItemAnalyzerList: null,
    isDepartmentalItem: null,
    storeName: null,

    isParent: null,
    parentId: null,
    reserveQty: null,

    // Same request settings as working API tests
    loadingMode: true,
    updateMode: false,
    page: null,
    size: 10,
    multiSearchProp: null,
    displayProp: null
  };

  // Step 5: Verify negative test input
  expect(
    payload.itemTypeEnumKey,
    'Item Type should be MEDICINE'
  ).toBe('MEDICINE');

  expect(payload.genericId).toBeNull();
  expect(payload.genericName).toBeNull();

  const validFields = [
    'itemName',
    'itemBarcode',
    'itemCategoryId',
    'unitOfMeasureId',
    'manufacturerId',
    'storeId'
  ];

  for (const field of validFields) {
    expect(
      payload[field],
      `Required field missing: ${field}`
    ).toBeTruthy();
  }

  expect(payload.inventoryItemSupplierList).toHaveLength(1);
  expect(payload.inventoryItemSupplierList[0]).toBeTruthy();

  // Step 6: Send POST request without Generic
  console.log('--------------------------------');
  console.log('API-TEST-007: Generic Required Validation');
  console.log('Test Item Name:', itemName);
  console.log('Test Barcode:', barcode);
  console.log('Submitted Item Type:', payload.itemTypeEnumKey);
  console.log('Submitted Item Category:', payload.itemCategoryId);
  console.log('Submitted Generic ID:', payload.genericId);
  console.log('Sending POST request without Generic...');

  const response = await request.post(saveUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    data: payload,
    timeout: 30000
  });

  // Step 7: Read and display actual API response
  const httpStatus = response.status();
  const responseText = await response.text();

  let responseBody;

  try {
    responseBody = JSON.parse(responseText);
  } catch {
    console.error('Actual HTTP Status:', httpStatus);
    console.error('Non-JSON API Response:', responseText);

    throw new Error(
      `Unexpected non-JSON API response: HTTP ${httpStatus}`
    );
  }

  console.log('API Method: POST');
  console.log('API Endpoint:', saveUrl);
  console.log('Actual HTTP Status:', httpStatus);
  console.log(
    'Response Body HTTP Code:',
    responseBody.httpStatusCode ?? 'Not provided'
  );
  console.log('API Response Code:', responseBody.apiResponseCode);
  console.log('API Status:', responseBody.status);
  console.log('API Message:', responseBody.message);
  console.log('Returned Item ID:', responseBody.data?.id ?? null);
  console.log('Full API Response:', responseText);

  // Step 8: Detect invalid data accepted by backend
  if (
    response.ok() ||
    responseBody.status === true ||
    responseBody.apiResponseCode === 'SAVE_SUCCESS' ||
    responseBody.data?.id
  ) {
    console.error('--------------------------------');
    console.error('POSSIBLE BUG: Generic validation bypassed');
    console.error('Expected: Missing Generic should be rejected');
    console.error('Actual HTTP Status:', httpStatus);
    console.error('Actual API Message:', responseBody.message);
    console.error('Returned Item ID:', responseBody.data?.id ?? null);
    console.error('--------------------------------');

    throw new Error(
      `BUG FOUND: API accepted Inventory Item without Generic. HTTP ${httpStatus}`
    );
  }

  // Step 9: Detect HTTP 500 or server errors
  if (httpStatus >= 500) {
    console.error('--------------------------------');
    console.error('POSSIBLE BACKEND VALIDATION BUG');
    console.error('Submitted Generic ID: null');
    console.error('Expected: 400/422 with Generic validation');
    console.error('Actual HTTP Status:', httpStatus);
    console.error('Actual Message:', responseBody.message);
    console.error('--------------------------------');

    throw new Error(
      `BUG FOUND: API returned HTTP ${httpStatus} instead of Generic validation error. Message: ${responseBody.message}`
    );
  }

  // Step 10: Detect authentication/authorization issues
  if (httpStatus === 401 || httpStatus === 403) {
    throw new Error(
      `Authentication/authorization failed: HTTP ${httpStatus}. ${responseBody.message}`
    );
  }

  // Step 11: Verify expected validation response
  expect(
    [400, 422],
    `Expected Generic validation HTTP 400/422 but received ${httpStatus}`
  ).toContain(httpStatus);

  expect(
    responseBody.status,
    'API should reject the request when Generic is missing'
  ).toBe(false);

  // Message must specifically identify Generic
  const errorDetails = JSON.stringify(responseBody);

  expect(
    errorDetails,
    'Expected a Generic-related validation message'
  ).toMatch(/generic/i);

  expect(
    responseBody.data,
    'Invalid request should not return a created item'
  ).toBeNull();

  // Step 12: Print PASS only after validation succeeds
  console.log('--------------------------------');
  console.log('API-TEST-007 PASSED');
  console.log('Generic required validation worked correctly');
  console.log('Actual HTTP Status:', httpStatus);
  console.log('API Response Code:', responseBody.apiResponseCode);
  console.log('API Message:', responseBody.message);
  console.log('--------------------------------');

});
