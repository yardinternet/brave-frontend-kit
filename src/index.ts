import { FocusStyle } from '@modules/FocusStyle';
import { FacetWP } from '@modules/FacetWP';
import { EnhanceExternalLinks } from '@modules/EnhanceExternalLinks';
import { EnhancePDFLinks } from '@modules/EnhancePDFLinks';
import { WebShareApi } from '@modules/WebShareApi';
import { findTabbable, findFirstTabbable, transformTag } from '@utils/a11y';
import { checkCanFocusTrap } from '@utils/focus-trap';

// Modules
export {
	EnhancePDFLinks,
	EnhanceExternalLinks,
	FocusStyle,
	WebShareApi,
	FacetWP,
};

// Utils
export { checkCanFocusTrap, findTabbable, findFirstTabbable, transformTag };
