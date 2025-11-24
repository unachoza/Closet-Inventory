# Closet-Inventory

Closet Inventory is a personal wardrobe management application that allows users to upload, categorize, and organize clothing items.

## Description

Closet Inventory is designed to help users digitally catalog their wardrobe.  
The app includes:

- A **9-step guided item creation flow**
- **Image upload + preview**
- **LocalStorage persistence**
- A **responsive closet overview grid**
- Animated **toast notifications** for user actions

## 📌 Features

### 🪜 Multi-Step Item Creation Form
- Custom progress tracker with step labels  
- Steps include: **category, color, size, brand, material, occasion, age/date, image upload**
- Reusable components: dropdowns, checkboxes, pill inputs
- Multi-step flow resets automatically after submission

### 📸 Image Upload + Preview
- File uploads via `<input type="file" />`
- Base64 conversion for persistence
- Live preview
- Optionally auto-generates stock photos by category

### 📅 Custom Date Picker + Intelligent Age Calculation
- Radix-based Month/Year selector  
- Automatic age conversion:
  - `< 20 months → "X months"`
  - `≥ 20 months → "Y years"`

### 🔔 Animated Toast Notifications
- Radix UI + Framer Motion  
- Context-driven system (`ToastProvider`)  
- Alerts user when an item is successfully created

### 🗂️ Local Storage Persistence
All saved items include:
- UUID  
- Normalized item payload  
- Image thumbnail  
- Auto-generated display name (brand + category)

### 👚 Closet Overview Grid
- Responsive layout displaying all stored items  
- Clean, minimal UI  
- Ready for sort/filter expansion  

---


## Project Structure
src/
 ├── Components/
 │     ├── ProgressionTracker/
 │     ├── DatePicker/
 │     ├── ImageUploader/
 │     ├── Closet/
 │     └── Shared UI Components
 ├── hooks/
 │     ├── useLocalCloset.ts
 │     ├── useLocalStorage.ts
 │     └── useStockPhoto.ts
 ├── utils/
 │     ├── types.ts
 │     ├── constants.ts
 │     └── formatters.ts
 ├── App.tsx
 └── main.tsx

## Installation & Setup

git clone https://github.com/your-username/closet-inventory.git
cd closet-inventory
npm install
npm run dev


## Architecture Notes
- Uses composable, reusable UI components.
- Logic extracted into hooks for maintainability.
- Date and age logic fully abstracted from UI.
- LocalStorage interactions centralized in useLocalStorageCloset.
- Toast system decoupled and reusable across the app.
- Multi-step form automatically resets on submit.

## Tech Stach Libraries Used
| Area               | Technology                           |
| ------------------ | ------------------------------------ |
| Framework          | React (Typescript)                   |
| Styling            | Custom CSS modules + theme variables |
| Animations         | Framer Motion                        |
| UI & Accessibility | Radix UI                             |
| State & Data       | React hooks + localStorage           |
| Testing            | Vitest + Testing Library             |
| Build Tool         | Vite                                 |

## ⚙️ Installation & Setup

git clone https://github.com/your-username/closet-inventory.git
cd closet-inventory
npm install
npm run dev

## 🧠 Future Enhancements
- Filtering by category, color, material, brand
- Sorting by age and price
- Auto-import clothing from shopping confirmation emails
- "Pack a Bag" travel component
- User authentication
- Outfits Mode (build looks like Clueless)
- Fabric care & clothing education page