import { describe, it, expect } from 'vitest';
import { slugify } from './../../utils/slugify.ts';

describe( 'slugify', () => {
	it( 'returns empty string when input is undefined', () => {
		expect( slugify( undefined ) ).toBe( '' );
	} );

	it( 'returns empty string when input is empty string', () => {
		expect( slugify( '' ) ).toBe( '' );
	} );

	it( 'trims and lowercases a simple sentence', () => {
		expect( slugify( '  Hello World  ' ) ).toBe( 'hello-world' );
	} );

	it( 'replaces multiple spaces with single hyphen', () => {
		expect( slugify( 'Hello   world again' ) ).toBe( 'hello-world-again' );
	} );

	it( 'removes special characters', () => {
		expect( slugify( 'Hello, world! How are you?' ) ).toBe(
			'hello-world-how-are-you'
		);
	} );

	it( 'keeps hyphens and underscores', () => {
		expect( slugify( 'dash-separated_and_underscored' ) ).toBe(
			'dash-separated_and_underscored'
		);
	} );

	it( 'removes emojis and symbols', () => {
		expect( slugify( 'Hello 🌍🚀✨' ) ).toBe( 'hello' );
	} );

	it( 'handles accented characters via normalization', () => {
		expect( slugify( 'Café déjà vu' ) ).toBe( 'cafe-deja-vu' );
	} );

	it( 'replaces multiple hyphens with a single one', () => {
		expect( slugify( 'Hello--world----again' ) ).toBe(
			'hello-world-again'
		);
	} );

	it( 'removes mixed punctuation and symbols', () => {
		expect( slugify( '!@#hello$%^&*()_+world[]{}' ) ).toBe( 'hello_world' );
	} );

	it( 'returns digits correctly', () => {
		expect( slugify( 'Page 123 Section 4' ) ).toBe( 'page-123-section-4' );
	} );

	it( 'handles non-Latin characters by stripping them', () => {
		expect( slugify( 'こんにちは 世界' ) ).toBe( '' ); // Japanese - removed by regex
		expect( slugify( 'Привет мир' ) ).toBe( '' ); // Cyrillic - removed by regex
	} );

	it( 'handles mixed Latin and non-Latin characters', () => {
		expect( slugify( 'Hello 世界' ) ).toBe( 'hello' ); // Only Latin part remains
	} );

	it( 'normalizes long strings with irregular spacing and symbols', () => {
		const input = '   This    is   a --- Very__Strange%%%Input###   ';
		expect( slugify( input ) ).toBe( 'this-is-a-very__strangeinput' );
	} );
} );
