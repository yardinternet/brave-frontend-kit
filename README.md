# Brave frontend kit

A modular frontend toolkit designed to help with Brave project development, including accessibility enhancements, utility functions, and easy-to-use classes.

## ✅ Installation

```bash
npm install @yardinternet/brave-frontend-kit
```

## 👷‍♀️ Package development

1. Run `npm link` inside this project.
2. Run `npm link @yardinternet/brave-frontend-kit` inside the project or theme. This will create a symbolic link to the project folder.
3. Run `npm run start` inside this project AND the equivalent script inside the project or theme.

## 🚀 How to publish

1. Go to [releases of the package](https://github.com/yardinternet/brave-frontend-kit/releases) and click on "Draft a new release"
2. Click "Choose a tag", type the corresponding version (e.g. `v1.2.3`) and press Enter. Add a title and description for the release.
3. Click "Publish release"

The Github Workflow `release-package.yml` will run whenever a release is created in this repository. It sets `package.json`'s version from the release tag, then, if the tests pass, publishes the package to Github packages.

## About us

[![banner](https://raw.githubusercontent.com/yardinternet/.github/refs/heads/main/profile/assets/small-banner-github.svg)](https://www.yard.nl/werken-bij/)
