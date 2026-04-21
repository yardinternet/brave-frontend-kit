import { Accordion } from '@modules/Accordion';
import { A11yCards } from '@modules/A11yCards';
import { A11yFacetWP } from '@modules/A11yFacetWP';
import { A11yMobileMenu } from '@modules/A11yMobileMenu';
import { BraveNavigation } from '@modules/BraveNavigation';
import { BraveNavigationManager } from '@modules/BraveNavigationManager';
import { BraveTooltip } from '@modules/BraveTooltip';
import { BraveTooltipManager } from '@modules/BraveTooltipManager';
import { Dialog } from '@modules/Dialog';
import { DialogManager } from '@modules/DialogManager';
import { EnhanceExternalLinks } from '@modules/EnhanceExternalLinks';
import { EnhancePDFLinks } from '@modules/EnhancePDFLinks';
import { FacetWPDateRange } from '@modules/FacetWPDateRange';
import { FocusStyle } from '@modules/FocusStyle';
import { Navigation } from '@modules/Navigation';
import { WebShareApi } from '@modules/WebShareApi';
import { findTabbable, findFirstTabbable, transformTag } from '@utils/a11y';
import { checkCanFocusTrap } from '@utils/focus-trap';
import { slugify } from '@utils/slugify';

// Modules
export {
	Accordion,
	A11yCards,
	A11yFacetWP,
	A11yMobileMenu,
	BraveNavigation,
	BraveNavigationManager,
	BraveTooltip,
	BraveTooltipManager,
	Dialog,
	DialogManager,
	EnhanceExternalLinks,
	EnhancePDFLinks,
	FacetWPDateRange,
	FocusStyle,
	Navigation,
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
