# SecureVault Explorer

A modern, dark-mode file explorer interface designed for SecureVault Inc., an
enterprise cloud-security platform serving organizations such as law firms and
financial institutions.

The application provides an intuitive way to navigate deeply nested folder
structures, inspect file and folder metadata, search through the vault, and
navigate the explorer using the keyboard.

---

## Overview

SecureVault Explorer transforms a complex hierarchical file structure into a
clear and efficient interactive interface.

The application focuses on:

- Recursive folder navigation
- File and folder inspection
- Keyboard accessibility
- Search and filtering
- Automatic expansion of matching nested folders
- Security-oriented visual design
- Clear visual hierarchy and interaction states

The interface follows a dark-mode visual language intended to communicate
precision, security, and efficiency.

---

## Features

### Recursive File Explorer

The explorer renders hierarchical data recursively, allowing the interface to
handle deeply nested folder structures without requiring separate components for
each depth level.

Users can:

- Expand folders
- Collapse folders
- Navigate through nested directories
- Select files and folders
- View the current location through the breadcrumb path

The recursive structure allows the same component to represent both shallow and
deep directory structures.

---

### File & Folder Properties

Selecting an item displays its properties in the inspection panel.

The panel provides information such as:

- Name
- Type
- Item ID
- Size
- Security status

For folders, the size field represents the number of items contained within
the folder.

---

### Keyboard Navigation

The explorer supports keyboard-based navigation for power users and improved
accessibility.

Supported controls:

| Key | Action |
|-----|--------|
| `Arrow Up` | Move focus to the previous visible item |
| `Arrow Down` | Move focus to the next visible item |
| `Arrow Right` | Expand a collapsed folder |
| `Arrow Left` | Collapse an expanded folder |
| `Enter` | Select or activate the focused item |
| `Space` | Activate the focused item |

Visible focus states are provided so keyboard users can clearly identify the
currently focused item.

---

### Search & Filter

The application includes a search field for finding files and folders.

Search supports nested structures. When a matching item exists deeper inside
the hierarchy, its parent folders are automatically expanded so that the
result becomes visible.

This allows users to locate files without manually opening every folder.

---

## Wildcard Feature

### Security Status Indicator

The original requirements focus on navigation and file inspection but do not
provide users with additional security context.

To improve the enterprise-security experience, the Properties Panel includes a
security status indicator.

The current interface displays:

`Encrypted (AES-256)`

This gives users an immediate visual indication of the security state associated
with the selected item.

> **Important:** The current security status is a UI demonstration only. It
> does not represent real encryption performed by the frontend. In a production
> environment, this information would be provided and verified by the backend
> security layer.

### Business Value

For organizations such as law firms and banks, security visibility is an
important part of the file-management experience.

Displaying security status directly within the inspection panel can help users
understand the protection state of sensitive files without leaving the explorer.

---

## Design System

The SecureVault interface follows a dedicated design system covering:

- Typography
- Color palette
- Spacing
- Component states
- Focus states
- Selection states
- Dark-mode surfaces

The design system was created before implementation and is reflected in the
implemented interface.

### Design System PDF

The project includes the design-system handoff document:

`design/SecureVault_Design_System.pdf`

The document contains:

- Primary explorer design frames
- Nested navigation frame
- Typography scale
- Color palette
- Spacing grid
- Component states
- Accessibility considerations
- Design-to-implementation notes

---

## Design Principles

### Cyber-Secure

Dark surfaces, restrained contrast, and emerald security accents create a
security-focused visual language.

### Precise

Clear spacing, consistent alignment, readable metadata, and predictable
interaction states reduce visual noise.

### Fast

The interface allows users to navigate nested structures, search for content,
and inspect items without page reloads.

### Accessible

Keyboard navigation and visible focus states are treated as part of the core
interface rather than an additional feature.

---

## Typography

The interface uses a clear hierarchy to maintain readability.

| Level | Size | Purpose |
|-------|------|---------|
| Display | 30px | Major presentation titles |
| Heading | 21px | Section headings |
| Subheading | 15px | Component headings |
| Body | 11–12px | General interface content |
| UI Label | 10–12px | Metadata and navigation |
| Caption | 9–10px | Secondary information |

The implementation prioritizes readable text sizes and sufficient contrast,
especially for important navigation and metadata.

---

## Color System

| Token | Value | Purpose |
|-------|-------|---------|
| App Background | `#060A1A` | Main application background |
| Explorer Panel | `#0F172A` | Primary navigation surface |
| Secondary Panel | `#111827` | Properties and secondary surfaces |
| Border | `#1E293B` | Dividers and component boundaries |
| Primary Text | `#E5E7EB` | Main content |
| Secondary Text | `#94A3B8` | Supporting information |
| Security Accent | `#10B981` | Security, focus and active states |
| Selected Surface | `#0F3D38` | Selected navigation items |

---

## Spacing System

The interface follows a 4px base spacing grid.

Common spacing values include:

`4px · 8px · 12px · 16px · 24px · 32px · 48px`

The spacing system is used consistently for:

- Component padding
- Tree indentation
- Panel spacing
- Section gaps
- Navigation hierarchy

---

## Component States

Interactive components use consistent states:

- Default
- Hover
- Focus
- Selected
- Expanded
- Search Active
- Search Empty

The selected and focused states use the SecureVault emerald accent to provide
clear visual feedback.

---

## Recursive Strategy

The folder structure is represented as a tree where each node can contain
children.

The `TreeNode` component renders one node and, when the node is a folder with
children, renders another `TreeNode` for each child.

Conceptually:

```text
TreeNode
 ├── Folder
 │    ├── TreeNode
 │    ├── TreeNode
 │    └── TreeNode
 │         └── TreeNode
 └── File
