# FacetWP

## A11yFacetWP

When using FacetWP, we need to add some accessibility features to make it work for everyone. This module adds the necessary ARIA attributes and keyboard navigation to make FacetWP accessible.

```javascript
import { A11yFacetWP } from '@yardinternet/brave-frontend-kit';

// Basic usage
new A11yFacetWP();

// Extended usage: all options
new A11yFacetWP( {
    selectorPrefix: 'js',
    scrollToTopOffset: 150,
} );
```

## FacetWPDateRange

When a facetwp date range facet is used inside a `<dialog>` element, we need to change the place of the datepicker. By default, the datepicker is placed at the end of the body element and that's not working when the date range facet is inside a `<dialog>` element. This module moves the datepicker inside the dialog element when the date range facet is used inside a dialog.

```javascript
import { FacetWPDateRange } from '@yardinternet/brave-frontend-kit';

// Basic usage
new FacetWPDateRange();

// Extended usage: all options
new FacetWPDateRange( {
    mobileBreakpoint: 768,
} );
```
