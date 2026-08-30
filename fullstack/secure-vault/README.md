# SecureVault Explorer

A modern, accessible file explorer interface designed for SecureVault's
enterprise cloud-security environment.

SecureVault Explorer provides an intuitive way to navigate nested folders,
inspect file metadata, use keyboard navigation, and quickly locate files
through search.

---

## Overview

SecureVault Explorer is a React-based frontend application that transforms
a deeply nested file structure into an interactive file-explorer experience.

The interface uses a dark, security-focused visual language designed to
communicate precision, clarity, and reliability.

The application works entirely from the provided `data.json` structure and
renders the hierarchy dynamically without requiring changes to the underlying
data model.

---

## Features

### Recursive File Tree

The explorer renders folders and files recursively from the provided JSON
data structure.

Folders can be expanded and collapsed without reloading the page, and the
recursive component structure supports arbitrary nesting depth.

### File & Folder Selection

Users can select files or folders directly from the explorer.

The selected item receives a distinct visual state and its information is
displayed in the Properties Panel.

### Properties Panel

The Properties Panel provides contextual information for the selected item,
including:

- Name
- Type
- Size
- Item ID

The panel adapts its displayed information depending on whether the selected
item is a file or folder.

### Keyboard Accessibility

The explorer supports keyboard-based navigation.

Supported controls include:

- `Arrow Up` — move focus to the previous visible item
- `Arrow Down` — move focus to the next visible item
- `Arrow Right` — expand a folder
- `Arrow Left` — collapse an expanded folder
- `Enter` — select the focused item
- `Space` — activate the focused item

The tree uses semantic `tree` and `treeitem` roles together with keyboard
focus management.

### Search & Filter

The explorer includes a search field for quickly locating files and folders.

Search results are filtered recursively, including items nested deeply inside
the folder hierarchy.

When a matching item exists inside a folder, the relevant parent folders are
automatically expanded so that the result is immediately visible.

This feature was implemented as the optional bonus feature from the challenge.

### Security Status Indicator

The Properties Panel includes an additional security-status indicator to
provide contextual security information within the interface.

The current `Encrypted (AES-256)` status is intentionally presented as a UI
demonstration only. It is not derived from real encryption operations or
encryption metadata.

---

## Design System

The interface follows a dark-mode design direction intended to communicate:

- Cyber security
- Precision
- Speed
- Clarity
- Enterprise reliability

The design system defines the visual foundation used throughout the
application, including:

- Typography scale
- Color palette
- Spacing system
- Component states
- Focus states
- Selected states
- Hover states

### Design File

> Design file link will be added here after the final design-system PDF is
> published.

### Design File

The SecureVault Design System documents the visual foundation of the
application, including typography, color palette, spacing, component states,
and accessibility states.

[View the SecureVault Design System PDF](./docs/SecureVault_Design_System_Final.pdf)
## Technology Stack

- React
- Vite
- JavaScript
- Tailwind CSS
- ESLint

No component library such as Bootstrap, Material UI, Chakra UI, or
Ant Design is used.

The interface components are implemented directly within the application,
with Tailwind CSS used as the styling foundation.

---

## Recursive Strategy

The file explorer uses a recursive `TreeNode` component to represent the
hierarchical data.

Each node determines whether it represents a folder or a file.

For folders containing children, the component renders another set of
`TreeNode` components for those children.

Conceptually, the structure follows:

```text
TreeNode
 ├── Folder
 │    ├── TreeNode
 │    ├── TreeNode
 │    └── Folder
 │         ├── TreeNode
 │         └── TreeNode
 └── File
