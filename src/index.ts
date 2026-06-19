import { A11yCards } from '@modules/a11y-cards/A11yCards';
import { A11yFacetWP } from '@modules/facetwp/A11yFacetWP';
import { FacetWPDateRange } from '@modules/facetwp/FacetWPDateRange';
import { A11yTribeEvents } from '@modules/tribe-events/A11yTribeEvents';
import { A11yMobileMenu } from '@modules/_deprecated/a11y-mobile-menu/A11yMobileMenu';
import { BraveAccordion } from '@modules/brave-accordion/BraveAccordion';
import { BraveDialog } from '@modules/brave-dialog/BraveDialog';
import { BraveDialogManager } from '@modules/brave-dialog/BraveDialogManager';
import { BraveNavigation } from '@modules/brave-navigation/BraveNavigation';
import { BraveNavigationManager } from '@modules/brave-navigation/BraveNavigationManager';
import { BraveTooltip } from '@modules/brave-tooltip/BraveTooltip';
import { BraveTooltipManager } from '@modules/brave-tooltip/BraveTooltipManager';
import { EnhanceExternalLinks } from '@modules/enhance-links/EnhanceExternalLinks';
import { EnhancePDFLinks } from '@modules/enhance-links/EnhancePDFLinks';
import { FocusStyle } from '@modules/focus-style/FocusStyle';
import { Headroom } from '@modules/headroom/Headroom';
import { Navigation } from '@modules/_deprecated/navigation/Navigation';
import { WebShareApi } from '@modules/web-share-api/WebShareApi';
import { checkCanFocusTrap } from '@utils/focus-trap';
import { findTabbable, findFirstTabbable, transformTag } from '@utils/a11y';
import { slugify } from '@utils/slugify';

// Deprecated modules
export { A11yMobileMenu, Navigation };

// Old module names
export {
	BraveAccordion as Accordion,
	BraveDialog as Dialog,
	BraveDialogManager as DialogManager,
};

// Modules
export {
	A11yCards,
	A11yFacetWP,
	A11yTribeEvents,
	BraveAccordion,
	BraveDialog,
	BraveDialogManager,
	BraveNavigation,
	BraveNavigationManager,
	BraveTooltip,
	BraveTooltipManager,
	EnhanceExternalLinks,
	EnhancePDFLinks,
	FacetWPDateRange,
	FocusStyle,
	Headroom,
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
