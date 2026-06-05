# BraveTooltip

Tooltip component with a single-instance API (`BraveTooltip`) and a multi-instance manager (`BraveTooltipManager`). Use in combination with the tooltips components from [brave-components](https://github.com/yardinternet/brave-components).

## `BraveTooltip`

Controls one tooltip instance bound to one trigger element.

```javascript
import { BraveTooltip } from '@yardinternet/brave-frontend-kit';

const trigger = document.querySelector( '.js-brave-tooltip-trigger' );

if ( trigger ) {
    // Basic usage
    new BraveTooltip( trigger );

    // Extended usage: all options
    new BraveTooltip( trigger, {
        selectorArrow: '.js-brave-tooltip-arrow',
        hideDelay: 150,
        placement: 'top',
        hiddenClass: 'hidden',
    } );
}
```

### Required markup

```html
<button class='js-brave-tooltip-trigger' aria-describedby='tooltip-id'>
    Tooltip trigger
</button>

<div id='tooltip-id' class='hidden' aria-hidden='true'>
    <div class='js-brave-tooltip-arrow'></div>
    Tooltip content
</div>
```

## `BraveTooltipManager`

Manages multiple tooltip instances on a page, exposing methods to open, close, toggle, and close all tooltips by tooltip ID.

```javascript
import { BraveTooltipManager } from '@yardinternet/brave-frontend-kit';

// Basic usage
new BraveTooltipManager();

// Extended usage: all options
const tooltips = new BraveTooltipManager( {
    selectorTrigger: '.js-brave-tooltip-trigger',
    selectorArrow: '.js-brave-tooltip-arrow',
    hideDelay: 150,
    placement: 'top',
    hiddenClass: 'hidden',
} );

tooltips.open( 'tooltip-id' );
tooltips.close( 'tooltip-id' );
tooltips.toggle( 'tooltip-id' );
tooltips.closeAll();
```
