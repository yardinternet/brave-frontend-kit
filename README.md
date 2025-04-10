# Brave frontend kit

A modular frontend toolkit designed to help with Brave project development, including accessibility enhancements, utility functions, and easy-to-use classes.

## ✅ Installation

```bash
npm install @yardinternet/brave-frontend-kit
```

## ⚙️ Classes

### `FocusStyle`

Adds a specific class to the body when the user is navigating via keyboard (Tab key). It ensures that we can style keyboard users differently from mouse users.

```javascript
import { FocusStyle } from '@yardinternet/brave-frontend-kit';

// Default: initialize the FocusStyle class
const focusStyle = new FocusStyle();

// Options: add a custom class
const customFocusStyle = new FocusStyle( {
    bodyClass: 'custom-class',
} );
```

## 🛠️ Helpers

TBA

## 👷‍♀️ Package development

1. Run `npm link` inside this project.
2. Run `npm link @yardinternet/brave-frontend-kit` inside the project or theme. This will create a symbolic link to the project folder.
3. Run `npm run start` inside this project AND the equivalent script inside the project or theme.

## 🚀 How to publish

1. Change the version of `package.json` to the desired version and commit this change.
2. Go to [releases of the package](https://github.com/yardinternet/brave-frontend-kit/releases) and click on "Draft a new release"
3. Click "Choose a tag", type the corresponding version and press Enter. Add a title and description for the release.
4. Click "Publish release"

The Github Workflow `release-package.yml` will run whenever a release is created in this repository. If the tests pass, then the package will be published to Github packages.
