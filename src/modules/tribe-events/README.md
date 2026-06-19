# A11yTribeEvents

Localizes and fixes the accessibility of The Events Calendar's top-bar datepicker. It patches the plugin-rendered DOM on every (re-)render to keep `aria-expanded` in sync on the datepicker toggle button, give the previous/next-month and month-switch buttons Dutch `aria-label`s (and matching screen-reader text), and remove the invalid `aria-selected` attribute from day cells.

```javascript
import { A11yTribeEvents } from '@yardinternet/brave-frontend-kit';

new A11yTribeEvents();
```

