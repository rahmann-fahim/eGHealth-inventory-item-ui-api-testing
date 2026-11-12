
import { test, expect } from '@playwright/test';
import 'dotenv/config';

test('API-TEST-015 - Verify Created Inventory Item Through Search API', async ({ request }) => {

  // STEP 1: Configuration
  const requiredEnv = [
    'APP_USERNAME',
    'APP_PASSWORD',
    'API_BRANCH_ID',
    'API_BUILDING_ID',
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

  const searchUrl = `${baseUrl}/api/v1/scm/inventory-item/search-page`;

  // STEP 2: Branch-aware Login (API-TEST-001 flow)
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

  // STEP 3: Existing item from PASS API-TEST-002
  const expectedItem = {
    id: '5fe7291c-fe87-4450-8df9-e57775fb04e9',
    itemName: 'API Required Fields Item 002 1794121305092',
    itemBarcode: 'APIREQ0021794121305092'
  };

  // STEP 4: Prepare search payload
  // Based on Angular InventoryItemSearchDTO
  const searchPayload = {
    itemName: expectedItem.itemName,
    branchId: process.env.API_BRANCH_ID,
    storeIdList: [process.env.API_STORE_ID],
    deletedNotOrNull: true,
    page: 0,
    size: 20
  };

  console.log('--------------------------------');
  console.log('API-TEST-015: Verify Created Item Through Search');
  console.log('Expected Item ID:', expectedItem.id);
  console.log('Expected Item Name:', expectedItem.itemName);
  console.log('Expected Barcode:', expectedItem.itemBarcode);

  // STEP 5: Send Search API request
  const response = await request.post(searchUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    data: searchPayload,
    timeout: 30000
  });

  const httpStatus = response.status();
  const responseText = await response.text();

  let body;

  try {
    body = JSON.parse(responseText);
  } catch {
    throw new Error(
      `Search API returned non-JSON response. HTTP ${httpStatus}: ${responseText}`
    );
  }

  // STEP 6: Log actual response
  console.log('API Method: POST');
  console.log('Search Endpoint:', searchUrl);
  console.log('Actual HTTP Status:', httpStatus);
  console.log('Response Body HTTP Code:', body.httpStatusCode);
  console.log('API Response Code:', body.apiResponseCode);
  console.log('API Status:', body.status);
  console.log('API Message:', body.message);

  // STEP 7: Verify Search API success
  expect(
    response.ok(),
    `Search API failed: HTTP ${httpStatus}. ${body.message || responseText}`
  ).toBeTruthy();

  expect(
    body.status,
    'Search API returned unsuccessful status'
  ).toBe(true);

  // STEP 8: Extract search results
  // Angular Page<T> model contains a content array
  const items = body.data?.content;

  expect(
    Array.isArray(items),
    `Expected data.content array. Response: ${responseText}`
  ).toBe(true);

  console.log('Returned Items Count:', items.length);
  console.log('Total Search Results:', body.data?.totalElements ?? 'N/A');

  // STEP 9: Find the exact previously created item
  const foundItem = items.find(
    item => item.id === expectedItem.id
  );

  expect(
    foundItem,
    `Previously created Item ID ${expectedItem.id} was not found in Search API response`
  ).toBeDefined();

  console.log('Found Item ID:', foundItem.id);
  console.log('Found Item Name:', foundItem.itemName);
  console.log('Found Barcode:', foundItem.itemBarcode);

  // STEP 10: Verify returned item information
  expect(foundItem.id).toBe(expectedItem.id);

  expect(foundItem.itemName).toBe(expectedItem.itemName);

  expect(foundItem.itemBarcode).toBe(expectedItem.itemBarcode);

  expect(
    foundItem.itemTypeEnumKey,
    'Item Type does not match'
  ).toBe('MEDICINE');

  expect(
    foundItem.storeId,
    'Store ID does not match'
  ).toBe(process.env.API_STORE_ID);

  // STEP 11: Final PASS
  console.log('--------------------------------');
  console.log('API-TEST-015 PASSED');
  console.log('Previously created Inventory Item found successfully');
  console.log('Item ID, Name, Barcode, Type and Store matched');
  console.log('--------------------------------');

});
