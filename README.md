# Personal ERP Management System (React)

A highly structured, modular personal resource planning system inspired by classic enterprise SAP terminal architectures. This application provides precise transaction code (T-Code) routing to manage finances, materials, schedules, and workflows out of a single centralized local web matrix.

---

## 📋 Available System Modules & Transactions

### 💰 Expense Management
* **VA01** - Initialize Expense Entry (Create)
* **VA02** - Adjust Financial Records (Change)
* **VA03** - Audit Line Item Ledger (Display)

### 📦 Material & Inventory Management
* **MM01** - Log New Material/Asset (Create)
* **MM02** - Update Material Parameters (Change)
* **MM03** - Inspect Material Master Data (Display)

### ⭐ Wishlist & Request Pipeline
* **WS01** - Stage New Entertainment Request (Create)
* **WS02** - Modify Queue Priorities (Change)
* **WS03** - Review Entertainment Backlog (Display)

### 📝 Core Notes Management
* **NT01** - Author Personal Note Vector (Create)
* **NT02** - Edit Document Content (Change)
* **NT03** - Open Static Read-Only Node (Display)

### 📋 List Collections
* **LC01** - Generate Structured Matrix Collection (Create)
* **LC02** - Restructure Existing Dataset Rows (Change)
* **LC03** - Render List View Display Sheet (Display)

### 📅 Calendar Management
* **CS01** - Initialize Standard/Recurring Events (Create)
* **CS02** - Reschedule/Modify Time-Blocks (Change)
* **CS03** - Display System Schedule Layout (Display)

### ⚙️ System Administration & Analytics
* **SE16** - **Data Browser:** Direct inspection and validation of persistent engine tables.
* **SU01** - **User Settings:** Adjust local profiles, interface preferences, and system parameters.
* **ZDASH** - **Executive Dashboard:** Centralized high-level interface analytics dashboard.
* **ZEXP_REPORT** - **Financial Reporting:** Engine tracking expenses, data yields, and metrics over time.

---

## ⚡ Quick Access Diagnostic Tables

The local persistence framework maps structural payloads into rapid-query indexed dictionary segments:
1.  **Expenses Table:** Active tracking registry mapping line-item receipts, values, and categorizations.
2.  **Wishlist Table:** Active consumer processing queue handling request data logs.
3.  **Notes Table:** Plaintext fallback directory utilizing fast-access local keys.

---

## 🚀 Architectural Tech Stack

* **View Layer:** React.js (Functional architecture utilizing `useState`, `useEffect`, `useRef`)
* **Styling Architecture:** Combined Neobrutalist design specs along with isolated CSS Modules (`*.module.css`) to prevent variable collisions.
* **State & Global Bus Controls:** Dedicated action middleware context wrappers:
    * `ActionContext` (Global toolbar pipeline hooks)
    * `TransactionContext` (T-Code execution monitor state tracking)
    * `ConfirmContext` (System modal verification triggers)
* **Storage Framework:** LocalStorage client storage layer mapping structural modifications dynamically.

---

## 🛠️ Local Development Installation

1.  Clone this repository onto your machine:
    ```bash
    git clone [https://github.com/your-username/personal-erp-system.git](https://github.com/your-username/personal-erp-system.git)
    cd personal-erp-system
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Execute the dev runtime pipeline locally:
    ```bash
    npm start
    ```

4.  Open [http://localhost:3000](http://localhost:3000) to log into the main transaction terminal interface.