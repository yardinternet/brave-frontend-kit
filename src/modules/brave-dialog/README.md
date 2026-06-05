# BraveDialog

Dialog component with a single-instance API (`BraveDialog`) and a multi-instance manager (`BraveDialogManager`). Use in combination with the dialog components from [brave-components](https://github.com/yardinternet/brave-components).

## `BraveDialog`

Controls one dialog instance bound to one trigger element.

```javascript
import { BraveDialog } from '@yardinternet/brave-frontend-kit';

const trigger = document.querySelector( '.js-brave-dialog' );

if ( trigger ) {
    const dialog = new BraveDialog( trigger );

    dialog.open();
    dialog.close();
    dialog.toggle();
}
```

## `BraveDialogManager`

Manages multiple dialog instances on a page, allowing easy opening, closing, and toggling by dialog ID.

```javascript
import { BraveDialogManager } from '@yardinternet/brave-frontend-kit';

// Basic usage
new BraveDialogManager();

// Extended usage: all options
const dialogs = new BraveDialogManager( {
    selector: '.js-brave-dialog',
} );

dialogs.open( 'js-brave-mobile-menu' );
dialogs.close( 'js-brave-mobile-menu' );
dialogs.toggle( 'js-brave-mobile-menu' );
dialogs.closeAll();
```
