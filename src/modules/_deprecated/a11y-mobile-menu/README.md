# A11yMobileMenu

**DEPRECATED**: This module is deprecated but still available because it is used in older themes. Use the `BraveNavigation` module instead.

Enhances the mobile menu with expand/open/close buttons, aria labels, animations, and a focus trap.

```javascript
import { A11yMobileMenu } from '@yardinternet/brave-frontend-kit';

// Basic usage
new A11yMobileMenu();

// Extended usage: all options
new A11yMobileMenu( {
    selectorPrefix: 'js',
    onActivateFocusTrapAnimate: {
        keyframes: [
            {
                transform: 'translateX(100%)',
                opacity: '0',
                visibility: 'hidden',
            },
            {
                transform: 'translateX(0)',
                opacity: '1',
                visibility: 'visible',
            },
        ],
        options: {
            duration: 500,
            easing: 'cubic-bezier(0.22,1,0.36,1)',
            fill: 'both',
        },
    },
} );
```
