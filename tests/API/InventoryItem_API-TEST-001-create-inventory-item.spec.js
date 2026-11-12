
import { test, expect } from '@playwright/test';
import 'dotenv/config';

test('API-TEST-001 - Create Inventory Item with All Fields Data', async ({ request }) => {

  // Step 1: Read environment variables
  const username = process.env.APP_USERNAME;
  const password = process.env.APP_PASSWORD;

  const baseUrl = (
    process.env.API_BASE_URL || 'http://192.168.10.99'
  ).replace(/\/$/, '');

  const loginUrl = process.env.API_AUTH_URL ||
    `${baseUrl}/api/v1/authentication/authenticate`;

  const saveUrl = `${baseUrl}/api/v1/scm/inventory-item`;

  const branchId = process.env.API_BRANCH_ID;
  const buildingId = process.env.API_BUILDING_ID;

  const requiredConfig = [
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

  for (const key of requiredConfig) {
    if (!process.env[key]?.trim()) {
      throw new Error(`Missing .env variable: ${key}`);
    }
  }

  // Step 2: Login with Branch and Building context
  const loginResponse = await request.post(loginUrl, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    data: {
      username,
      password,
      branchId,
      buildingId
    },
    timeout: 30000
  });

  const loginText = await loginResponse.text();

  expect(
    loginResponse.ok(),
    `Login API failed: HTTP ${loginResponse.status()}`
  ).toBeTruthy();

  let loginBody;

  try {
    loginBody = JSON.parse(loginText);
  } catch {
    throw new Error('Login API did not return valid JSON');
  }

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

  // Step 3: Generate unique item data
  const uniqueId = Date.now();

  const itemName = `API Full Form Item 001 ${uniqueId}`;
  const barcode = `APIFULL001${uniqueId}`;

  // Step 4: Prepare full inventory item payload
  const payload = {
    id: null,
    itemName,
    formattedItemName: null,
    formattedItemNameV2: null,
    formattedItemNameV3: null,
    generalFormattedItemName: null,

    routeId: '8cb09555-1fe9-4e71-934c-1e94fe6fbc2f',
    routeName: null,

    brandId: null,
    brandName: null,
    departmentId: null,

    genericId: process.env.API_GENERIC_ID,
    genericName: '10 Vitamin & 6 Mineral',

    doseId: '466541e1-acd0-4170-b0e1-bca3b8a35e66',
    doseName: '০ +০ + ১',

    code: null,
    ma: null,

    itemBarcode: barcode,
    materialName: 'hello',

    itemCategoryId: process.env.API_ITEM_CATEGORY_ID,
    itemCategoryName: 'Tablet',

    medicinePowerId: null,
    medicinePowerName: null,
    medicineUnitId: null,
    medicineUnitName: null,

    deliverDays: null,
    salesRate: null,
    purchaseRate: null,

    modelId: null,
    modelName: null,

    itemTypeEnumKey: process.env.API_ITEM_TYPE_KEY,
    itemTypeEnumValue: null,

    packSize: null,
    packSizeFkId:
      'pdcl609d17-c0c7-4fb9-81ec-hinb35fccf145',

    itemStateEnumKey: null,
    itemStateEnumValue: null,

    unitOfMeasureId: process.env.API_UOM_ID,
    unitOfMeasureName: null,

    supplierId: null,
    supplierName: null,

    manufacturerId: process.env.API_MANUFACTURER_ID,
    manufacturerName: null,

    rate: null,
    reOrderLevel: '5',
    currentStock: null,
    numberOfDay: null,

    foreignFlag: null,
    expirable: null,
    batchable: null,

    dgdaId: null,
    strength: 'hello',
    expireNotifyDays: '120',

    demandQty: null,
    enabled: true,
    expiryStatusForNextMonths: null,

    analyzerId: null,
    analyzerUid: null,
    analyzerName: null,

    therapeuticClassId:
      '87a6b98c-7be4-45ce-a4d9-eba2ed5129ea',

    therapeuticClassNote: 'nha haan ',

    itemAvailabilityType: null,
    purchaseTypeEnumKey: null,

    salesQuantity: null,
    salesUnitId: null,
    tsQuantity: null,

    doseDurationId:
      '327b9337-4b60-491f-87ae-e604eddda0f0',

    doseDurationName: 'দিন',

    instructionId:
      'b6ac42ee-76bd-4e08-bbb9-d82ad1ff17d3',

    instructionName: 'খাওয়ার পরে',

    duration: 7,
    description: null,

    storage_location_id: null,
    storage_location_name: null,
    storage_condition_id: null,
    storage_condition_name: null,

    oldOty: null,
    expiredOty: null,
    shortDateQty: null,

    itemStockId: null,

    inventoryItemSupplierList: [
      process.env.API_SUPPLIER_ID
    ],

    inventoryItemAnalyzerList: null,
    isDepartmentalItem: null,

    storeId: process.env.API_STORE_ID,
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

  // Step 5: Send POST request directly to API
  console.log('Sending Inventory Item Create Request...');

  const response = await request.post(saveUrl, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    data: payload,
    timeout: 30000
  });

  // Step 6: Read API response
  const status = response.status();
  const responseText = await response.text();

  console.log('API Method: POST');
  console.log('API Endpoint:', saveUrl);
  console.log('HTTP Status:', status);
  console.log('API Response:', responseText);

  // Step 7: Verify HTTP status
  expect(
    response.ok(),
    `Create API failed: HTTP ${status} - ${responseText}`
  ).toBeTruthy();

  // Step 8: Parse response body
  let responseBody;

  try {
    responseBody = JSON.parse(responseText);
  } catch {
    throw new Error('Save API did not return valid JSON');
  }

  // Step 9: Verify application-level success
  expect(
    responseBody.status,
    `Save failed: ${responseBody.message || 'Unknown error'}`
  ).toBe(true);

  expect(
    responseBody.apiResponseCode
  ).not.toBe('ERROR');

  expect(
    responseBody.apiResponseCode
  ).not.toBe('FORBIDDEN');

  // Step 10: Verify returned data if available
  if (responseBody.data?.itemName !== undefined) {
    expect(responseBody.data.itemName).toBe(itemName);
  }

  if (responseBody.data?.itemBarcode !== undefined) {
    expect(responseBody.data.itemBarcode).toBe(barcode);
  }

  console.log('--------------------------------');
  console.log('API-TEST-001 PASSED');
  console.log('Created Item Name:', itemName);
  console.log('Created Barcode:', barcode);
  console.log('HTTP Status:', status);
  console.log('--------------------------------');

});
