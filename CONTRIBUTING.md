# Contributing Guide

## Introduction

Thank you for considering contributing to this project! Your help is greatly appreciated. This guide will help you understand how to contribute effectively and ensure that your contributions are aligned with the project's goals.

## How to Report Bugs

If you find a bug, please report it by opening an issue on our GitHub repository. When reporting a bug, please include:

- A clear and descriptive title.
- Steps to reproduce the issue.
- Expected and actual results.
- Screenshots or code snippets, if applicable.
- Any relevant logs or error messages.

## How to Submit Changes

1. **Fork the repository**: Click the "Fork" button on the repository's GitHub page.
2. **Create a new branch**: Use a descriptive name for your branch (e.g., `feature/add-new-feature` or `bugfix/fix-issue`).
3. **Make your changes**: Implement your feature or bugfix.
4. **Commit your changes**: Write clear and concise commit messages.
5. **Push to your fork**: Push your changes to your forked repository.
6. **Submit a pull request**: Open a pull request on the original repository with a clear description of your changes and any relevant information.

## Development Flow

To set up the project for development, follow these steps:

1. First, setup package manager & install dependencies.

  ```bash
  corepack up
  ```

2. Run the project in development mode.

  ```bash
  node --run dev #or pnpm dev
  ```

3. (Optional) If you want https, install [mkcert](https://github.com/FiloSottile/mkcert) and run the following commands.

  ```bash
  mkcert -install
  mkcert localhost
  ```

## Code Style Guidelines

- Follow the existing code style and conventions.
- Use meaningful variable and function names.
- Include comments where necessary to explain your code.
- Ensure your code is well-documented.

Thank you for your contributions! Your efforts help make this project better for everyone.
