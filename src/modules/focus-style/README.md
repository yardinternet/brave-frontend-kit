# FocusStyle

Adds a specific class to the body when the user is navigating via keyboard (Tab key). Lets you style keyboard users differently from mouse users.

![FocusStyle Example](../../../docs/example-focus-style.gif)

```javascript
import { FocusStyle } from '@yardinternet/brave-frontend-kit';

// Basic usage
const focusStyle = new FocusStyle();

// Extended usage: all options
const customFocusStyle = new FocusStyle( {
    bodyClass: 'custom-class',
} );
```
