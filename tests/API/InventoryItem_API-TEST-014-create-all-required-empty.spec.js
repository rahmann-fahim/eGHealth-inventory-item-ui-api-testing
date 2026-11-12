
import { test, expect } from '@playwright/test';
import 'dotenv/config';

test('API-TEST-014 - Create Inventory Item With All Required Fields Empty', async ({ request }) => {

  // STEP 1: Check login configuration
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

  const loginUrl = process.env.API_AUTH_URL ||
    `${baseUrl}/api/v1/authentication/authenticate`;

  const saveUrl = `${baseUrl}/api/v1/scm/inventory-item`;

  // STEP 2: Branch-aware API Login
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

  expect(
    token,
    'Access token not found in login response'
  ).toBeTruthy();

  console.log('Branch-aware API Login Successful');

  // STEP 3: Prepare payload with all identified required fields empty
  const payload = {
    id: null,

    // Required identity fields
    itemName: null,
    itemBarcode: null,

    // Required dropdown fields
    itemTypeEnumKey: null,
    itemCategoryId: null,
    genericId: null,
    unitOfMeasureId: null,

    // Supplier selection
    supplierId: null,
    supplierName: null,
    inventoryItemSupplierList: null,

    // Manufacturer and Store
    manufacturerId: null,
    manufacturerName: null,
    storeId: null,
    storeName: null,

    // Related display fields
    itemTypeEnumValue: null,
    itemCategoryName: null,
    genericName: null,
    unitOfMeasureName: null,

    // Optional fields from the working payload
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

    medicinePowerId: null,
    medicinePowerName: null,
    medicineUnitId: null,
    medicineUnitName: null,

    deliverDays: null,
    salesRate: null,
    purchaseRate: null,
    modelId: null,
    modelName: null,

    packSize: null,
    packSizeFkId: null,
    itemStateEnumKey: null,
    itemStateEnumValue: null,

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

    isParent: null,
    parentId: null,
    reserveQty: null,

    // Non-required request settings
    enabled: true,
    loadingMode: true,
    updateMode: false,
    page: null,
    size: 10,
    multiSearchProp: null,
    displayProp: null
  };

  // STEP 4: Verify all target fields are empty
  const emptyFields = [
    'itemName',
    'itemBarcode',
    'itemTypeEnumKey',
    'itemCategoryId',
    'genericId',
    'unitOfMeasureId',
    'inventoryItemSupplierList',
    'manufacturerId',
    'storeId'
  ];

  for (const field of emptyFields) {
    expect(
      payload[field],
      `${field} must be null for this negative test`
    ).toBeNull();
  }

  console.log('--------------------------------');
  console.log('API-TEST-014: All Required Fields Empty');
  console.log('Submitted Empty Fields:');
  for (const field of emptyFields) {
    console.log(`${field}:`, payload[field]);
  }

  // STEP 5: Send POST request
  console.log('Sending POST request with all required fields empty...');

  const response = await request.post(saveUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    data: payload,
    timeout: 30000
  });

  // STEP 6: Read actual response
  const httpStatus = response.status();
  const responseText = await response.text();

  let body;

  try {
    body = JSON.parse(responseText);
  } catch {
    console.error('Actual HTTP Status:', httpStatus);
    console.error('Non-JSON API Response:', responseText);

    throw new Error(
      `Unexpected non-JSON response: HTTP ${httpStatus}`
    );
  }

  console.log('--------------------------------');
  console.log('API Method: POST');
  console.log('API Endpoint:', saveUrl);
  console.log('Actual HTTP Status:', httpStatus);
  console.log(
    'Response Body HTTP Code:',
    body.httpStatusCode ?? 'Not provided'
  );
  console.log('API Response Code:', body.apiResponseCode);
  console.log('API Status:', body.status);
  console.log('API Message:', body.message);
  console.log('Returned Item ID:', body.data?.id ?? null);
  console.log('Full API Response:', responseText);

  // STEP 7: Detect invalid item creation
  if (
    body.status === true ||
    body.apiResponseCode === 'SAVE_SUCCESS' ||
    body.data?.id
  ) {
    console.error('--------------------------------');
    console.error('POSSIBLE BUG: Invalid item accepted');
    console.error('All identified required fields were null');
    console.error('Actual HTTP Status:', httpStatus);
    console.error('Returned Item ID:', body.data?.id ?? null);
    console.error('--------------------------------');

    throw new Error(
      `BUG FOUND: API accepted an Inventory Item with all required fields empty. HTTP ${httpStatus}`
    );
  }

  // STEP 8: Detect unexpected server errors
  if (httpStatus >= 500) {
    console.error('--------------------------------');
    console.error('POSSIBLE BACKEND VALIDATION / ERROR-HANDLING BUG');
    console.error('Expected: Proper 4xx validation response');
    console.error('Actual HTTP Status:', httpStatus);
    console.error('Actual Message:', body.message);
    console.error('--------------------------------');

    throw new Error(
      `BUG FOUND: API returned HTTP ${httpStatus} instead of a proper required-field validation response. Message: ${body.message}`
    );
  }

  // STEP 9: Detect authentication issues
  if (httpStatus === 401 || httpStatus === 403) {
    throw new Error(
      `Authentication/authorization failed: HTTP ${httpStatus}. ${body.message}`
    );
  }

  // STEP 10: Verify validation response
  expect(
    [400, 422],
    `Expected HTTP 400/422, received HTTP ${httpStatus}`
  ).toContain(httpStatus);

  expect(
    body.status,
    'API must reject invalid request'
  ).toBe(false);

  const errorDetails = JSON.stringify(body);

  // At least one missing field should be identified
  expect(
    errorDetails,
    'Expected a meaningful required-field validation message'
  ).toMatch(
    /item[\s_-]*name|barcode|item[\s_-]*type|category|generic|unit[\s_-]*of[\s_-]*measure|uom|supplier|manufacturer|store/i
  );

  expect(
    body.data?.id ?? null,
    'Invalid request must not return a created Item ID'
  ).toBeNull();

  // STEP 11: Final PASS
  console.log('--------------------------------');
  console.log('API-TEST-014 PASSED');
  console.log('API rejected the empty required fields');
  console.log('Actual HTTP Status:', httpStatus);
  console.log('API Message:', body.message);
  console.log('--------------------------------');

});
