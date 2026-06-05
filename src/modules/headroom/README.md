# Headroom

Wrapper around [headroom.js](https://wicky.nillia.ms/headroom.js/) that hides/shows a header element based on scroll direction.

```javascript
import { Headroom } from '@yardinternet/brave-frontend-kit';

// Basic usage
new Headroom();

// Extended usage: all options
new Headroom( {
    selector: '.js-headroom',
    headroomOptions: {
        tolerance: {
            up: 10,
            down: 30,
        },
    },
});
```
