import { Accordion } from '@modules/Accordion';
import { A11yCards } from '@modules/A11yCards';
import { A11yFacetWP } from '@modules/A11yFacetWP';
import { A11yMobileMenu } from '@modules/A11yMobileMenu';
import { Dialog } from '@modules/Dialog';
import { DialogManager } from '@modules/DialogManager';
import { EnhanceExternalLinks } from '@modules/EnhanceExternalLinks';
import { EnhancePDFLinks } from '@modules/EnhancePDFLinks';
import { FocusStyle } from '@modules/FocusStyle';
import { Navigation } from '@modules/Navigation';
import { ReadSpeaker } from '@modules/ReadSpeaker';
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
	Dialog,
	DialogManager,
	EnhanceExternalLinks,
	EnhancePDFLinks,
	FocusStyle,
	Navigation,
	ReadSpeaker,
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
