
import { test, expect } from '@playwright/test';
import 'dotenv/config';

test('API-TEST-004 - Create Inventory Item Without Item Name', async ({ request }) => {

  // Step 1: Read environment variables
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

  // Step 2: Branch-aware API Login
  const loginResponse = await request.post(loginUrl, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
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

  // Step 3: Generate unique Barcode
  const uniqueId = Date.now();
  const barcode = `APIREQ004${uniqueId}`;

  // Step 4: Prepare Inventory Item payload
  // Item Name is intentionally null
  const payload = {
    id: null,
    itemName: null,
    itemBarcode: barcode,

    // Required fields
    itemTypeEnumKey: process.env.API_ITEM_TYPE_KEY,
    itemCategoryId: process.env.API_ITEM_CATEGORY_ID,
    genericId: process.env.API_GENERIC_ID,
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

    genericName: null,
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

    loadingMode: true,
    updateMode: false,

    page: null,
    size: 10,
    multiSearchProp: null,
    displayProp: null
  };

  // Step 5: Verify negative test data
  expect(payload.itemName).toBeNull();

  expect(payload.itemBarcode).toBeTruthy();
  expect(payload.itemTypeEnumKey).toBeTruthy();
  expect(payload.itemCategoryId).toBeTruthy();
  expect(payload.genericId).toBeTruthy();
  expect(payload.unitOfMeasureId).toBeTruthy();
  expect(payload.manufacturerId).toBeTruthy();
  expect(payload.storeId).toBeTruthy();

  expect(payload.inventoryItemSupplierList)
    .toHaveLength(1);

  expect(payload.inventoryItemSupplierList[0])
    .toBeTruthy();

  // Step 6: Send POST request without Item Name
  console.log('--------------------------------');
  console.log('API-TEST-004: Item Name Required Validation');
  console.log('Submitted Item Name:', payload.itemName);
  console.log('Test Barcode:', barcode);
  console.log('Sending POST request without Item Name...');

  const response = await request.post(saveUrl, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    data: payload,
    timeout: 30000
  });

  // Step 7: Capture actual API response
  const httpStatus = response.status();
  const responseText = await response.text();

  let responseBody;

  try {
    responseBody = JSON.parse(responseText);
  } catch {
    throw new Error(
      `Unexpected non-JSON response: HTTP ${httpStatus} - ${responseText}`
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

  // Step 8: Identify unexpected API behavior

  // Bug: API accepted missing Item Name
  if (response.ok() || responseBody.status === true) {
    console.error('--------------------------------');
    console.error('BUG FOUND: Missing Item Name Accepted');
    console.error('Expected: API should reject empty Item Name');
    console.error(`Actual HTTP Status: ${httpStatus}`);
    console.error('Actual Response:', responseText);
    console.error('--------------------------------');

    throw new Error(
      `BUG FOUND: Inventory Item API accepted a request without Item Name. HTTP ${httpStatus}`
    );
  }

  // Bug: Internal Server Error
  if (httpStatus >= 500) {
    console.error('--------------------------------');
    console.error('POSSIBLE BACKEND VALIDATION BUG');
    console.error('Item Name was null');
    console.error('Expected: 400 or 422 validation error');
    console.error(`Actual HTTP Status: ${httpStatus}`);
    console.error(`Actual Message: ${responseBody.message}`);
    console.error('--------------------------------');

    throw new Error(
      `BUG FOUND: API returned HTTP ${httpStatus} instead of Item Name validation error. Message: ${responseBody.message}`
    );
  }

  // Authentication or authorization failure
  if (httpStatus === 401 || httpStatus === 403) {
    throw new Error(
      `Authentication/authorization failed: HTTP ${httpStatus}. ${responseBody.message}`
    );
  }

  // Step 9: Verify expected validation response
  expect(
    [400, 422],
    `Expected Item Name validation status 400/422, received HTTP ${httpStatus}`
  ).toContain(httpStatus);

  expect(
    responseBody.status,
    'API should reject an item without Item Name'
  ).toBe(false);

  // Verify specific validation message
  const errorDetails = JSON.stringify(responseBody);

  expect(
    errorDetails,
    'Expected Item Name-specific validation message'
  ).toMatch(/item.?name/i);

  // Verify no new item data was returned
  expect(
    responseBody.data,
    'Invalid request should not return a created item'
  ).toBeNull();

  // Step 10: Print successful validation result
  console.log('--------------------------------');
  console.log('API-TEST-004 PASSED');
  console.log('Item Name required validation worked correctly');
  console.log('HTTP Status:', httpStatus);
  console.log('API Response Code:', responseBody.apiResponseCode);
  console.log('--------------------------------');

});
