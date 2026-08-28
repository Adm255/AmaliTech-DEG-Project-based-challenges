# 🛡️ SecureVault Explorer

An enterprise-grade, secure file management dashboard built with React, Vite, and Tailwind CSS. Designed with high-security clearance aesthetics, keyboard accessibility, and deep hierarchical navigation.

---

## 🚀 Core Features & Implementation

### 1. The Recursive Tree (Story 1)

- **Architecture:** Utilizes a recursive component design pattern (`TreeNode.jsx`) to handle arbitrarily deep directory nesting without fixed depth limits.
- **State Management:** Independent folder open/closed state management coupled with safe event bubbling prevention (`e.stopPropagation()`).

### 2. Properties & Metadata Inspection (Story 2)

- **Dynamic Inspection Panel:** Selecting any file or folder instantly renders an enterprise-grade properties sidebar showing ID, type, byte/item size, and simulated cryptographic status (`AES-256`).

### 3. Full Keyboard Accessibility (Story 3)

- **WAI-ARIA Tree View Pattern:** Fully navigable via keyboard without requiring a mouse:
  - `Arrow Up` / `Arrow Down`: Traverse visible tree nodes.
  - `Arrow Right`: Expand folders.
  - `Arrow Left`: Collapse folders.
  - `Enter` / `Space`: Select items and trigger properties inspection.

### 4. Wildcard Innovation Feature (Story 4)

- **Dynamic Path Breadcrumb Trail:** Automatically tracks hierarchy traversal and displays a live path bar (e.g., `SecureVault / Shared_Resources`) at the top of the explorer to enhance orientation for enterprise users.

---

## 🛠️ Tech Stack

- **Frontend Library:** React (via Vite)
- **Styling:** Tailwind CSS v4
- **Version Control:** Git & GitHub (Structured conventional commits)

---

## ⚙️ Getting Started & Local Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Adm255/AmaliTech-DEG-Project-based-challenges.git](https://github.com/Adm255/AmaliTech-DEG-Project-based-challenges.git)
   ```
