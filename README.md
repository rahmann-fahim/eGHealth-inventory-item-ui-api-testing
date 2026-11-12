
# 🏥 eGhealth HMS — Inventory Item Module | UI & API Test Automation

![Playwright](https://img.shields.io/badge/Playwright-Test_Automation-2EAD33?style=flat-square&logo=playwright&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![SQA](https://img.shields.io/badge/Software_Quality_Assurance-SQA-blue?style=flat-square)
![Testing](https://img.shields.io/badge/Testing-UI_%26_API-orange?style=flat-square)
![Project](https://img.shields.io/badge/Project-Internship_Portfolio-purple?style=flat-square)

## 📌 Project Overview

This repository showcases my practical **Software Quality Assurance (SQA)** work on the **Inventory Item Module** of **eGhealth**, a Hospital Management System (HMS) developed by **eGeneration PLC**.

The testing activities were carried out as part of my SQA internship experience, with a focus on validating application functionality, automating repetitive test scenarios, investigating unexpected system behavior, and documenting test execution results.

I used **Playwright with JavaScript** to perform both **UI Automation Testing** and **REST API Automation Testing**.

The repository contains the test automation scripts, test case documentation, defect observations, and Inventory Item module screenshots included in my portfolio.

> **Confidentiality Notice**
>
> In accordance with eGeneration PLC's company confidentiality requirements, the proprietary eGhealth application source code has **not been published** in this repository.
>
> This repository is intended to showcase my SQA testing work rather than the application's implementation.
>
> Application screenshots and testing artifacts should be shared only where permitted by the company and must not expose confidential operational or patient information.

---

## 🏢 Project Information

| Information | Details |
|---|---|
| Organization | eGeneration PLC |
| Application | eGhealth |
| Application Type | Hospital Management System (HMS) |
| Tested Module | SCM — Inventory Item |
| Project Category | Software Quality Assurance |
| Experience Context | SQA Internship |
| Testing Approaches | UI Automation & API Automation |
| Automation Framework | Playwright Test |
| Programming Language | JavaScript |
| API Style | REST |
| Data Format | JSON |
| Browser Testing | Chromium / Google Chrome |
| Test Execution | Playwright Test Runner |
| UI Request Investigation | Chrome Developer Tools |
| Documentation | Test Cases, Execution Results & Defect Observations |
| Version Control | Git & GitHub |

---

## 🎯 Testing Objectives

The primary objective of this project was to evaluate the quality, reliability, and functional behavior of the Inventory Item module.

My testing activities focused on:

- Validating Inventory Item creation and update functionality.
- Verifying required-field validation.
- Testing duplicate Item Name and Barcode handling.
- Checking the behavior of dropdown fields and related master data.
- Validating Inventory Item search and reset operations.
- Automating REST API requests and response verification.
- Performing positive and negative API testing.
- Comparing expected and actual application behavior.
- Identifying potential frontend and backend validation issues.
- Investigating HTTP response errors and runtime failures.
- Verifying saved and updated records through the Search API.
- Preparing structured test documentation based on actual execution results.

---

## 🧪 Testing Scope

Testing was conducted on the **SCM Inventory Item** module of eGhealth.

### 1. UI Automation Testing

The UI automation test cases cover the following scenarios:

| Test ID | Test Scenario |
|---|---|
| UI-TEST-001 | Verify Inventory Item Page Navigation |
| UI-TEST-002 | Full Inventory Item Form Submission |
| UI-TEST-003 | Create Inventory Item with Valid Data |
| UI-TEST-004 | Barcode Required Validation |
| UI-TEST-005 | Item Name Required Validation |
| UI-TEST-006 | Item Type Required Validation |
| UI-TEST-007 | Item Category Required Validation |
| UI-TEST-008 | Generic Required Validation |
| UI-TEST-009 | Unit of Measurement Required Validation |
| UI-TEST-010 | Supplier Required Validation |
| UI-TEST-011 | Manufacturer Required Validation |
| UI-TEST-012 | Store Required Validation |
| UI-TEST-013 | Duplicate Barcode Validation |
| UI-TEST-014 | Duplicate Item Name Validation |
| UI-TEST-015 | Reset Button Functionality |
| UI-TEST-016 | Search Inventory Item by Name and Reset Search |

**Total Documented UI Test Cases: 16**

These scenarios cover page navigation, form interaction, mandatory-field validation, duplicate-data handling, successful submission, and search functionality.

### 2. API Automation Testing

API testing was performed using Playwright's API request capabilities.

The test suite includes both positive and negative scenarios.

| Test ID | Test Scenario |
|---|---|
| API-TEST-001 | Create Inventory Item with All Fields Data |
| API-TEST-002 | Create Inventory Item with All Required Fields |
| API-TEST-003 | Create Inventory Item Without Barcode |
| API-TEST-004 | Create Inventory Item Without Item Name |
| API-TEST-005 | Create Inventory Item Without Item Type |
| API-TEST-006 | Create Inventory Item Without Item Category |
| API-TEST-007 | Create Inventory Item Without Generic |
| API-TEST-008 | Create Inventory Item Without UOM |
| API-TEST-009 | Create Inventory Item Without Supplier |
| API-TEST-010 | Create Inventory Item Without Manufacturer |
| API-TEST-011 | Create Inventory Item Without Store |
| API-TEST-012 | Create Inventory Item with Duplicate Barcode |
| API-TEST-013 | Create Inventory Item with Duplicate Item Name |
| API-TEST-014 | Create Inventory Item with All Required Fields Empty |
| API-TEST-015 | Verify Created Inventory Item Through Search API |
| API-TEST-016 | Update Inventory Item with Populated Fields Successfully |

**Additional API Verification Scenario:**

`Update_Inventory_Item_With_All_Fields_Successfully.spec.js`

This additional scenario verifies the update of an Inventory Item originally created through API-TEST-001 and compares the successful API update with a separately observed UI update failure.

**Total Documented API Test Entries: 17**

---

## 📊 Test Execution Summary

The following figures summarize the execution results recorded in the test documentation.

### UI Testing Results

| Metric | Result |
|---|---:|
| Total Documented UI Tests | 16 |
| Passed | 15 |
| Failed | 1 |
| Pass Rate | 93.75% |

### API Testing Results

| Metric | Result |
|---|---:|
| Total Documented API Test Entries | 17 |
| Passed | 5 |
| Failed | 12 |

The API results include positive scenarios, negative validation scenarios, and additional update verification.

**Important:** A failed negative test does not necessarily mean that an API operation was unavailable. Several scenarios identified unexpected validation behavior or incorrect HTTP error handling, which were recorded as testing findings.

The additional UI update failure observed during API update investigation is reported separately from the original 16 UI test cases.

---

## 🔍 Key Functional Areas Tested

### Inventory Item Creation

Validated the creation of Inventory Items using:

- All applicable populated fields.
- Required fields.
- Valid Item Name and Barcode.
- Item Type and Item Category.
- Generic information.
- Unit of Measurement.
- Supplier and Manufacturer.
- Store information.
- Additional medicine-related fields.

### Required-Field Validation

Tested application behavior when mandatory information was missing.

Special attention was given to:

- Item Name.
- Barcode.
- Item Type.
- Item Category.
- Generic.
- Unit of Measurement.
- Supplier.
- Manufacturer.
- Store.

### Duplicate Data Validation

Evaluated the application's response when attempting to create Inventory Items with:

- An existing Barcode.
- An existing Item Name within applicable uniqueness constraints.

### Inventory Item Search

Verified that previously created Inventory Items could be retrieved using the Search API.

Assertions included:

- Item ID matching.
- Item Name matching.
- Barcode matching.
- Item Type validation.
- Store ID verification.

### Inventory Item Update

Validated update operations using an existing Inventory Item record.

The automation:

1. Authenticated successfully.
2. Retrieved the existing record through the Search API.
3. Preserved the original Item ID.
4. Preserved existing relationship IDs.
5. Updated selected populated editable fields.
6. Submitted the update using a PUT request.
7. Validated the success response.
8. Searched for the updated Item.
9. Verified that the new values were persisted.

---

## 🐞 Defect Investigation & QA Findings

During testing, several unexpected behaviors were observed and documented.

### Finding 1: Missing Barcode Validation

**Scenario:** Create an Inventory Item without a Barcode.

**Expected Behavior:** The application should reject the request and provide a meaningful Barcode validation message.

**Observed Behavior:** The API returned HTTP 500 with the message:

`Runtime error happened`

**Finding:** Potential backend validation or error-handling issue.

### Finding 2: Missing Required Fields Accepted by API

During negative API testing, requests with certain missing values were accepted successfully.

Examples included:

- Missing Item Type.
- Missing Generic.
- Missing Unit of Measurement.

These results differed from the frontend's required-field validation behavior.

**Finding:** Potential inconsistency between frontend validation requirements and backend validation enforcement.

The final defect classification depends on confirmation of the API's required-field contract.

### Finding 3: Duplicate Data Error Handling

The API identified duplicate Barcode and Item Name conditions.

However, the related responses used HTTP 500 instead of an appropriate client-error status.

**Expected Behavior:** A meaningful duplicate-data validation response using an appropriate HTTP status, subject to the documented API contract.

**Observed Behavior:** Duplicate detection occurred, but HTTP 500 was returned.

**Finding:** Potential HTTP status-code mapping issue.

### Finding 4: UI Update Failure While API Update Succeeded

This was an important investigation during the project.

The same Inventory Item was successfully updated through direct Playwright API automation.

The API returned:

- HTTP Status: `200 OK`
- API Response Code: `SAVE_SUCCESS`
- API Status: `true`
- Message: `Inventory Item Updated Successfully`

A subsequent Search API request also confirmed the updated values.

However, a separate UI update attempt on the same Item generated:

- HTTP Status: `500 Internal Server Error`
- API Response Code: `ERROR`
- API Status: `false`
- Message: `Runtime error happened`

**Investigation:** The UI-generated PUT request was compared with the successful automated API update.

Differences in request payload values, including the `code` and `itemBarcode` fields, were observed.

**Finding:** The failure may involve frontend request construction or backend processing of the UI-generated payload.

The exact root cause was not confirmed. Further investigation using backend exception logs was recommended.

---

## ⚙️ Automation Approach

### UI Automation

UI tests were implemented using Playwright and JavaScript.

The automation workflow involved:

1. Launching the browser.
2. Authenticating to the application.
3. Navigating to the Inventory Item module.
4. Interacting with input fields and dropdowns.
5. Submitting forms or triggering validation.
6. Checking visible application behavior.
7. Comparing actual results with expected outcomes.

### API Automation

The API automation was implemented using Playwright's `request` fixture.

The general workflow was:

```text
Authentication
     |
     v
Receive Access Token
     |
     v
Prepare Request Payload
     |
     v
Send REST API Request
     |
     v
Validate HTTP Status
     |
     v
Validate API Response
     |
     v
Verify Returned Data
     |
     v
Record Test Result
```

### API Update Verification Workflow

```text
Branch-aware Login
       |
       v
Search Existing Item
       |
       v
Retrieve Existing Data
       |
       v
Prepare Update Payload
       |
       v
Preserve Item ID & Relationships
       |
       v
Submit PUT Request
       |
       v
Validate Success Response
       |
       v
Search Updated Item
       |
       v
Verify Persisted Values
       |
       v
PASS / FAIL
```

This approach helped validate both the immediate API response and the data returned by a subsequent API request.

---

## 🛠️ Tools & Technologies

| Tool / Technology | Usage |
|---|---|
| Playwright Test | UI and API test automation |
| JavaScript | Automation script development |
| Node.js | JavaScript runtime |
| npm | Dependency management and test execution |
| REST API | Backend functional testing |
| JSON | API request and response data |
| Chrome Developer Tools | Network request and payload investigation |
| Git | Version control |
| GitHub | Test project portfolio and documentation |
| Microsoft Word | Detailed test case documentation |

---

## 📁 Repository Structure

```text
eghealth-inventory-item-ui-api-testing/
│
├── Documentation_test-cases & bug-reports/
│   └── Test documentation and defect records
│
├── Module Inventory_Item UI screenshots/
│   └── Inventory Item module screenshots
│
├── playwright configs/
│   └── Playwright configuration files
│
├── tests/
│   ├── UI/
│   │   └── UI automation test scripts
│   │
│   └── API/
│       └── API automation test scripts
│
└── README.md
```

### Folder Description

**Documentation_test-cases & bug-reports**

Contains structured test case documentation, expected and actual results, test execution outcomes, and documented defect observations.

**Module Inventory_Item UI screenshots**

Contains Inventory Item module screenshots used to illustrate application screens and testing evidence.

**playwright configs**

Contains configuration-related files used for Playwright automation.

**tests/UI**

Contains Playwright scripts for UI navigation, form testing, field validation, duplicate detection, and search-related functionality.

**tests/API**

Contains Playwright scripts for Inventory Item creation, negative validation, search, and update testing.

**README.md**

Provides a consolidated overview of the SQA project, test coverage, automation approach, findings, and repository contents.

---

## ▶️ Running the Automation Tests

### Prerequisites

- Node.js and npm
- Playwright Test
- Access to an authorized testing environment
- Valid test credentials
- Required application configuration and test data

**Note:** The eGhealth application is proprietary. Running these tests requires authorized access to the relevant application environment.

Public repository visitors may review the test scripts and documentation without having access to the internal application.

### Install Dependencies

If the repository contains a compatible `package.json`, install the project dependencies:

```bash
npm install
```

Install Playwright browsers if needed:

```bash
npx playwright install
```

### Run UI Tests

```bash
npx playwright test tests/UI/ --reporter=list
```

### Run API Tests

```bash
npx playwright test tests/API/ --reporter=list
```

### Run a Specific Test

```bash
npx playwright test tests/API/InventoryItem_API-TEST-016-update-all-fields.spec.js --reporter=list
```

### View Playwright HTML Report

If the HTML reporter is configured and a report has been generated:

```bash
npx playwright show-report
```

Execution also depends on the appropriate Playwright configuration, environment variables, credentials, test data, and application availability.

These requirements are not publicly distributed where they contain confidential information.

---

## 🔐 Source Code Confidentiality & Data Protection

The eGhealth application is developed by **eGeneration PLC**.

Due to company confidentiality and intellectual property requirements, the original application source code is not included in this repository.

The repository is focused on the SQA testing work performed on the Inventory Item module.

The application is not reproduced or redistributed here.

Sensitive materials such as the following should not be published:

- Application source code.
- Real login credentials or passwords.
- Authentication tokens.
- Private infrastructure addresses.
- Internal environment configuration.
- Confidential application data.
- Patient-related or personally identifiable information.

Any screenshots, documentation, and testing artifacts shared publicly should be reviewed for confidentiality and company authorization.

This portfolio is a presentation of testing experience and should not be interpreted as an official product release, an official QA certification, or an endorsement by eGeneration PLC.

---

## 💡 Challenges & Learning Outcomes

Working on this module provided practical experience with real application testing and debugging.

### Technical Skills Practiced

- Writing and organizing Playwright automation tests.
- Automating browser-based user interactions.
- Creating REST API requests using JavaScript.
- Working with Bearer-token authentication.
- Handling branch-aware API login.
- Preparing and validating JSON request payloads.
- Testing required and optional fields.
- Implementing positive and negative test scenarios.
- Verifying persisted data through follow-up API requests.
- Investigating HTTP 4xx and 5xx responses.
- Comparing frontend-generated and automation-generated API requests.
- Interpreting test runner output.
- Documenting expected versus actual behavior.

### Quality Assurance Skills Practiced

- Test case design.
- Functional testing.
- Validation testing.
- Regression-oriented verification.
- Defect identification.
- Defect documentation.
- Reproducible test execution.
- Root-cause investigation.
- Evidence-based reporting.
- Test result analysis.

### A Key Learning Experience

One of the most valuable experiences was investigating an Inventory Item that could be updated successfully through direct API automation but failed when updated through the UI.

This highlighted the importance of testing multiple application layers and comparing actual requests rather than assuming that every HTTP 500 response has the same root cause.

---

## 📈 Project Highlights

- **16 documented UI test cases** covering functional and validation scenarios.
- **16 numbered API test scenarios** covering creation, validation, search, and update.
- **1 additional API update verification scenario** involving an existing test record.
- Automated positive and negative testing using Playwright.
- Successful verification of updated data through the Search API.
- Investigation of validation inconsistencies and HTTP error handling.
- Structured test case and defect documentation.
- Separate documentation of successful API behavior and unsuccessful UI behavior.
- Portfolio presentation without publishing the proprietary application source code.

---

## 📚 Test Documentation & Evidence

Detailed information is available in the repository's documentation and screenshot folders.

The documentation includes:

- Test Case IDs and titles.
- Test objectives.
- Preconditions.
- Test data.
- Execution steps.
- Expected results.
- Actual results.
- PASS / FAIL status.
- Relevant API responses.
- Defect observations.
- Investigation notes.

The screenshots provide visual context for the Inventory Item module and selected test observations.

---

## 🎯 Professional Development

This project represents my hands-on learning and practical contributions during an SQA internship involving a Hospital Management System.

My objective was not only to execute test cases but also to understand system behavior, identify unexpected results, investigate potential defects, and communicate findings through clear technical documentation.

The experience strengthened my interest in:

- Software Quality Assurance.
- Manual and Automated Testing.
- REST API Testing.
- Web Application Testing.
- Test Automation Frameworks.
- Defect Analysis and Reporting.

I am continuing to develop my SQA skills through practical projects, test automation, and structured quality engineering practices.

---

## 🏁 Conclusion

The eGhealth Inventory Item Module SQA project demonstrates practical experience in testing a real-world healthcare management application using Playwright and JavaScript.

The project includes UI automation, API testing, validation scenarios, test execution documentation, and investigation of unexpected application behavior.

By combining successful test verification with careful reporting of failed scenarios, this repository reflects an evidence-based approach to Software Quality Assurance.

**Focus: Test the functionality, verify the results, investigate the failures, and document the findings.**

---

## 👨‍💻 Author

**Tinjilur Rahman Fahim**  
**Role:** Software Quality Assurance (SQA) Intern  
**Organization:** eGeneration PLC  
**Project:** eGhealth — Hospital Management System (HMS)  
**Tested Module:** SCM — Inventory Item  
**Technical Skills:** Playwright, JavaScript, UI Automation, REST API Testing, Functional Testing, Test Case Design & Defect Reporting

### 📬 Connect With Me

- **Email:** [rahmannfahim001@gmail.com](mailto:rahmannfahim001@gmail.com)
- **LinkedIn:** [Tinjilur Rahman Fahim](https://www.linkedin.com/in/tinjilur-rahman-fahim-75bb6a287/)
- **GitHub:** [rahmann-fahim](https://github.com/rahmann-fahim)

---

*This project showcases my hands-on Software Quality Assurance experience during my internship at eGeneration PLC, focusing on UI and API test automation, validation testing, and defect investigation within the eGhealth Hospital Management System.*

**© 2026 Tinjilur Rahman Fahim — SQA Internship Portfolio**
