import { A11yCards } from '@modules/A11yCards';
import { A11yFacetWP } from '@modules/A11yFacetWP.ts';
import { A11yMobileMenu } from '@modules/A11yMobileMenu.ts';
import { EnhanceExternalLinks } from '@modules/EnhanceExternalLinks';
import { EnhancePDFLinks } from '@modules/EnhancePDFLinks';
import { FocusStyle } from '@modules/FocusStyle';
import { Navigation } from '@modules/Navigation';
import { SearchBar } from '@modules/SearchBar';
import { WebShareApi } from '@modules/WebShareApi';
import { findTabbable, findFirstTabbable, transformTag } from '@utils/a11y';
import { checkCanFocusTrap } from '@utils/focus-trap';
import { slugify } from '@utils/slugify';

// Modules
export {
	A11yCards,
	A11yFacetWP,
	A11yMobileMenu,
	EnhanceExternalLinks,
	EnhancePDFLinks,
	FocusStyle,
	Navigation,
	SearchBar,
	WebShareApi,
};

// Utils
export {
	checkCanFocusTrap,
	findTabbable,
	findFirstTabbable,
	transformTag,
	slugify,
};
