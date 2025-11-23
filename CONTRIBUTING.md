# Contributing to Loan Calculator

Thank you for your interest in contributing to the Loan Calculator project! This document provides a guide on how to set up the project locally, understand our deployment pipeline, and submit changes.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

-   [Node.js](https://nodejs.org/) (Version 18 or higher is recommended)
-   [npm](https://www.npmjs.com/) (comes with Node.js)
-   [Git](https://git-scm.com/)

## Local Development Setup

Follow these steps to get the project running on your local machine:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/ishtiaqSamdani/LCal.git
    cd LCal
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Start the Development Server**:
    ```bash
    npm run dev
    ```
    The application will start, and you can access it at `http://localhost:5173`.

4.  **Building for Production**:
    To create a production-ready build (which creates a `dist` folder):
    ```bash
    npm run build
    ```

## CI/CD Pipeline (Continuous Deployment)

This project uses **GitHub Actions** for Continuous Integration and Continuous Deployment (CI/CD). This means that every time code is pushed to the `main` branch, the application is automatically built and deployed to GitHub Pages.

### How it Works

The workflow is defined in `.github/workflows/deploy.yml`. Here is the process:

1.  **Trigger**: The action starts automatically whenever a `push` occurs on the `main` branch.
2.  **Environment**: It runs on an `ubuntu-latest` virtual machine.
3.  **Steps**:
    -   **Checkout**: Checks out the latest code from the repository.
    -   **Setup Node**: Installs Node.js (v18).
    -   **Install**: Runs `npm install` to fetch project dependencies.
    -   **Build**: Runs `npm run build` to compile the React app into static files in the `dist/` directory.
    -   **Deploy**: Uses the `JamesIves/github-pages-deploy-action` to push the contents of the `dist/` folder to the `gh-pages` branch.

### Deployment

GitHub Pages is configured to serve the website from the `gh-pages` branch. 
-   **Source Code**: Lives in `main`.
-   **Live Site Code**: Lives in `gh-pages` (generated automatically).

**Note**: You do not need to manually deploy or merge to `gh-pages`. Just push your changes to `main`, and the automation will handle the rest.

## Making Changes

1.  Create a new branch for your feature or fix:
    ```bash
    git checkout -b my-new-feature
    ```
2.  Make your changes in the code.
3.  Commit your changes:
    ```bash
    git add .
    git commit -m "Description of what I changed"
    ```
4.  Push to GitHub:
    ```bash
    git push origin my-new-feature
    ```
5.  Open a **Pull Request** on GitHub to merge your changes into `main`.

