# 🏛️ OpticBreak20 — Project Architecture

This document explains the internal design and technical flow of the **OpticBreak20** application.

---

## 🏗️ High-Level Overview

**OpticBreak20** is a **Progressive Web App (PWA)** built as a lightweight, static Single Page Application (SPA). It uses purely native web technologies (HTML, CSS, JS) to ensure maximum compatibility and performance across all devices.

### 📐 Project Structure
| File | Responsibility |
| :--- | :--- |
| **`index.html`** | The main application shell and UI. |
| **`info.html`** | The medical blog (Study More) page. |
| **`style.css`** | Global design system using CSS Variables for theme management. |
| **`script.js`** | Core application state, timer logic, and PWA install handling. |
| **`service-worker.js`** | Background asset management and offline caching strategy. |
| **`manifest.json`** | App metadata (icons, colors, startup behavior) for PWA installation. |

---

## 🔄 Core Application Flow

### 1. Timer Execution Engine (`script.js`)
*   **Persistent State**: The app saves the `endTime` in `localStorage`. This allows the timer to survive page reloads or browser restarts.
*   **State Machine**:
    -   **Running**: The user clicks "Start Timer" &rarr; `setInterval` ticks every 500ms to update the UI &rarr; `localStorage` is updated.
    -   **Alarm**: When `currentTime >= endTime` &rarr; `triggerAlarm()` is called.
    -   **Break Session**: The Break Popup appears with a mandatory 20-second countdown using a local timer loop.
    -   **Dismissal**: Clicking "Done" resets the state and automatically starts the next session.

### 2. PWA & Offline Support (`service-worker.js`)
*   **Caching Strategy**: On the first visit, the Service Worker downloads all core assets (`index.html`, `info.html`, `style.css`, etc.) into the **`eye-break-v8`** cache.
*   **Offline Access**: On subsequent visits, the Service Worker intercepts network requests and serves the files from the cache first (`Cache First` strategy). This allows the app to work without an internet connection.
*   **Update Lifecycle**: The `skipWaiting()` and `clients.claim()` methods ensure that whenever you push a code update, the browser replaces the old version immediately across all open tabs.

### 3. Native Integration
*   **Desktop Notifications**: The app uses the `Notification API` to send a system-level toast even if the window is hidden.
*   **Install Logic**: The `beforeinstallprompt` event is intercepted to provide a custom UI button in the "Instructions Box," triggering the native browser install dialog.

---

## 🏥 Design System
*   **Theming**: Uses CSS variables (`--primary`, `--bg`, `--surface`) to maintain a consistent hospital-grade look across both the App and the Info pages.
*   **Responsiveness**: Uses a CSS Grid/Flexbox layout with `clamp()` and media queries to support desktop, tablets, and phones seamlessly.
