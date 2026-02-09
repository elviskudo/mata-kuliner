# Mata Kuliner - Restaurant Management System

A comprehensive Restaurant Management System built with **Next.js 15 (App Router)**, **Bun**, and **Tailwind CSS**.

## Features

- **Role-based Authentication**: Dedicated views for Owner, Cashier, and Kitchen.
- **Owner Dashboard**: Real-time stats, revenue charts, and employee management.
- **POS System**: Fast and intuitive checkout for Cashiers.
- **Kitchen Display**: Live order status tracking and stock alerts.

## Getting Started

### Prerequisites

- **Bun**: This project uses [Bun](https://bun.sh) as the runtime and package manager.

### Troubleshooting: "Command not found"

If you see an error like `bun : The term 'bun' is not recognized`, it means Bun is installed but not added to your system's PATH variable yet.

**Solution: Restart your Terminal**
Close your current terminal window (PowerShell, Command Prompt, or VS Code terminal) and open a new one. This will reload the PATH variables.

**Alternative: Use Absolute Path**
If restarting doesn't work, you can run Bun commands using the full path:
```powershell
C:\Users\ACER\.bun\bin\bun.exe run dev
```

### Installation

1.  **Install dependencies**:
    ```bash
    bun install
    ```

2.  **Run the development server**:
    ```bash
    bun run dev
    ```

3.  **Open the app**:
    Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

- `src/app`: App Router pages and layouts.
- `src/components`: UI components organized by module.
- `src/lib`: Logic and mock data.
