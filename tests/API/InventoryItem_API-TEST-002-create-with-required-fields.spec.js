
import { test, expect } from '@playwright/test';
import 'dotenv/config';

test('API-TEST-002 - Create Inventory Item with All Required Fields', async ({ request }) => {

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

  // Step 3: Generate unique Item Name and Barcode
  const uniqueId = Date.now();

  const itemName = `API Required Fields Item 002 ${uniqueId}`;
  const barcode = `APIREQ002${uniqueId}`;

  // Step 4: Prepare required fields payload
  // Optional fields are kept null
  const payload = {
    id: null,

    itemName,
    itemBarcode: barcode,

    // Required dropdown fields
    itemTypeEnumKey: process.env.API_ITEM_TYPE_KEY,
    itemCategoryId: process.env.API_ITEM_CATEGORY_ID,
    genericId: process.env.API_GENERIC_ID,
    unitOfMeasureId: process.env.API_UOM_ID,

    inventoryItemSupplierList: [
      process.env.API_SUPPLIER_ID
    ],

    manufacturerId: process.env.API_MANUFACTURER_ID,
    storeId: process.env.API_STORE_ID,

    // Optional item details
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

    // Same control values as API-TEST-001
    loadingMode: true,
    updateMode: false,
    page: null,
    size: 10,
    multiSearchProp: null,
    displayProp: null
  };

  // Step 5: Verify required data before API request
  const requiredFields = [
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
      payload[field],
      `Required field is missing: ${field}`
    ).toBeTruthy();
  }

  expect(payload.inventoryItemSupplierList.length).toBeGreaterThan(0);
  expect(payload.routeId).toBeNull();
  expect(payload.doseId).toBeNull();
  expect(payload.packSizeFkId).toBeNull();
  expect(payload.therapeuticClassId).toBeNull();

  // Step 6: Send POST request
  console.log('Sending Inventory Item Required Fields Request...');

  const response = await request.post(saveUrl, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    data: payload,
    timeout: 30000
  });

  // Step 7: Read actual API response
  const httpStatus = response.status();
  const responseText = await response.text();

  console.log('API Method: POST');
  console.log('API Endpoint:', saveUrl);
  console.log('HTTP Status:', httpStatus);
  console.log('API Response:', responseText);

  // Step 8: Verify HTTP status
  expect(
    response.ok(),
    `Create API failed: HTTP ${httpStatus} - ${responseText}`
  ).toBeTruthy();

  // Step 9: Parse response JSON
  let responseBody;

  try {
    responseBody = JSON.parse(responseText);
  } catch {
    throw new Error('Save API did not return valid JSON');
  }

  // Step 10: Verify application-level success
  expect(
    responseBody.status,
    `Save failed: ${responseBody.message || 'Unknown error'}`
  ).toBe(true);

  expect(responseBody.apiResponseCode).toBe('SAVE_SUCCESS');

  // Step 11: Verify created Inventory Item
  expect(
    responseBody.data,
    'Created inventory item data is missing'
  ).toBeTruthy();

  expect(responseBody.data.id).toBeTruthy();

  expect(responseBody.data.itemName).toBe(itemName);
  expect(responseBody.data.itemBarcode).toBe(barcode);

  expect(responseBody.data.itemTypeEnumKey)
    .toBe(payload.itemTypeEnumKey);

  expect(responseBody.data.itemCategoryId)
    .toBe(payload.itemCategoryId);

  expect(responseBody.data.genericId)
    .toBe(payload.genericId);

  expect(responseBody.data.unitOfMeasureId)
    .toBe(payload.unitOfMeasureId);

  expect(responseBody.data.manufacturerId)
    .toBe(payload.manufacturerId);

  expect(responseBody.data.storeId)
    .toBe(payload.storeId);

  // Step 12: Print final result
  console.log('--------------------------------');
  console.log('API-TEST-002 PASSED');
  console.log('Created Item ID:', responseBody.data.id);
  console.log('Created Item Name:', itemName);
  console.log('Created Barcode:', barcode);
  console.log('HTTP Status:', httpStatus);
  console.log('API Response Code:', responseBody.apiResponseCode);
  console.log('Response Body HTTP Code:', responseBody.httpStatusCode);
  console.log('--------------------------------');

});
