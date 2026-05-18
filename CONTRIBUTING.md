# Contributing to PrepStack 🤝

First off, thank you for considering contributing to **PrepStack**! It’s people like you who make PrepStack an amazing hub for academic success. 

This guide is designed to make contributing easy, transparent, and rewarding for developers and students of all experience levels.

---

## 📚 Table of Contents

1. [Code of Conduct](#-code-of-conduct)
2. [How Can I Contribute?](#-how-can-i-contribute)
   - [Reporting Bugs](#reporting-bugs)
   - [Suggesting Features](#suggesting-features)
   - [Submitting Pull Requests](#submitting-pull-requests)
3. [Development Setup](#-development-setup)
4. [Coding Standards](#-coding-standards)
5. [Note Upload Guidelines](#-note-upload-guidelines)

---

## 🤝 Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment. We expect all contributors to:
- Be respectful and collaborative.
- Provide constructive feedback.
- Keep academic resources accurate, organized, and free of plagiarism.

---

## 💡 How Can I Contribute?

### Reporting Bugs
If you find a bug, please check the [Issues list](https://github.com/anam0505/PrepStack/issues) first to make sure it hasn't been reported already. If not, open a new issue with:
- A clear, descriptive title.
- Steps to reproduce the issue.
- Expected vs. actual behavior.
- Screenshots or error logs (if applicable).

### Suggesting Features
Have an idea to make PrepStack better? We'd love to hear it! Open a feature request issue and describe:
- The problem this feature solves.
- How the feature should work.
- Mockups or structural concepts (if available).

### Submitting Pull Requests
1. **Fork** the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/amazing-feature-name
   ```
2. **Make your changes** following our coding standards.
3. **Commit** your changes with clear, descriptive commit messages:
   ```bash
   git commit -m "feat: add PDF zoom functionality to student dashboard"
   ```
4. **Push** your branch to your fork:
   ```bash
   git push origin feature/amazing-feature-name
   ```
5. **Open a Pull Request (PR)** against the `main` branch of PrepStack.

---

## 🛠️ Development Setup

To set up the workspace for code development:

1. Clone your fork of the repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/PrepStack.git
   ```
2. Install local dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
4. Build for production to check for bundler errors:
   ```bash
   npm run build
   ```

---

## 🎨 Coding Standards

To maintain a clean codebase, we enforce linting and component structures:
- **Linting**: Run `npm run lint` before committing to catch formatting and syntax issues.
- **Styling**: We use **TailwindCSS** for responsive and modular design. Avoid writing inline styling.
- **State Management**: Keep components pure and leverage React Hooks (`useState`, `useEffect`, `useCallback`) efficiently.
- **Icons**: Use `lucide-react` for system iconography to ensure visual consistency.

---

## 📄 Note Upload Guidelines

If you are contributing study materials or academic documents directly through the app interface:
- **Accuracy**: Ensure notes are high-quality, readable, and match the official **Mumbai University** syllabus.
- **Sparsity & Compression**: Keep file names short and descriptive.
- **Plagiarism**: Do not upload copyrighted textbooks or materials without permission. Stick to handwritten notes, PYQ solutions, or lab manuals.

Thank you for building a smarter, unified academic ecosystem! Happy coding! 🚀
