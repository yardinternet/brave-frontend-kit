# BraveNavigation

Navigation dropdown component with a single-instance API (`BraveNavigation`) and a multi-instance manager (`BraveNavigationManager`). Supports both hover and click modes.

## `BraveNavigation`

Controls one navigation container.

```javascript
import { BraveNavigation } from '@yardinternet/brave-frontend-kit';

const container = document.querySelector( '.brave-nav' );

if ( container ) {
    new BraveNavigation( container );
}
```

## `BraveNavigationManager`

Automatically initialises a `BraveNavigation` for every `.brave-nav` element on the page and wires up shared keyboard and focus events.

```javascript
import { BraveNavigationManager } from '@yardinternet/brave-frontend-kit';

new BraveNavigationManager();
```
