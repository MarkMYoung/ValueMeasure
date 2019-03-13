'use strict';
// const Measure = require( './Measure' );
// const MeasureUnitCollator = require( './MeasureUnitCollator' );
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
class MeasureFormat
{
	/**
	 * @typedef MeasureFormatOptions
	 * @property {?object} exponent
	 * @property {?[string]=[]} locales
	 * @property {?object={'useGrouping':true}} numberFormatOptions
	 * @property {?object} operator
	 * @property {?string='-'} operator.compoundSeparator
	 * @property {?string='/'} operator.divisionOperator
	 * @property {?string=')'} operator.groupRight
	 * @property {?string='('} operator.groupLeft
	 * @property {?string='\u{22C5}'} operator.productOperator
	 * @property {?string=' '} operator.valueUnitDelimiter
	 *
	 * @param {MeasureFormatOptions} this.options
	 */
	constructor( options )
	{
		this.options = Object.assign({}, options );
		this.options.exponent = Object.assign({}, MeasureFormat.exponentDefaults, this.options.exponent );
		this.options.operator = Object.assign({}, MeasureFormat.operatorDefaults, this.options.operator );
		let derived_locales = (typeof( options ) === 'object' && options !== null)
			?options.locales
			:MeasureFormat.defaults.locales;
		//
		let derivedNumberFormatOptions = (typeof( options ) === 'object' && options !== null)
			?options.numberFormatOptions
			:MeasureFormat.defaults.numberFormatOptions;
		this.options.numberFormatter = new Intl.NumberFormat( derived_locales, derivedNumberFormatOptions );
		//
		this.measureUnitCollator = new MeasureUnitCollator();
	}
	formatMeasure( measure )
	{
		const value =
		[
			this.options.numberFormatter.format( measure.value ),
			this.formatMeasureUnit( measure.unit )
		].join( this.options.operator.valueUnitDelimiter );
		return( value );
	}
	formatMeasureUnit( measureUnit )
	{
		// Only assume that the unit is iterable.
		//X const unitList = measureUnit.list;
		const unitList = Array.isArray( measureUnit )?measureUnit:[measureUnit];
		let value = unitList
			.reduce( Measure.unitReducer, [])
			.sort( this.measureUnitCollator.unitSorterFactory())
			.reduce( this.unitListToStringReducerFactory(), '' );
		return( value );
	}
	formatUnitOfMeasure( unitOfMeasure )
	{
		let power = unitOfMeasure.exp.toString().split( '' )
			.map( function( digit, d, digits )
			{
				let character = this.options.exponent[ digit ];
				if( unitOfMeasure.exp == 1 )
				{character = '';}
				return( character );
			}, this )
			.join( '' );
		let value = unitOfMeasure.name;
		if( power !== '' )
		{value = [unitOfMeasure.name, power].join( this.options.exponent['^']);}
		return( value );
	}
	/** Reduce the unit list to string.
	 */
	unitListToStringReducerFactory()
	{
		const self = this;
		return( function toStringReducer( result, each, n, every )
		{
			result = ((typeof( result ) === 'string' || result instanceof String)?(result):(''));
			let exponent = each.exp || 1;
			// if( result === '' && exponent < 0 )
			// {result = result.concat( '1' );}
			if( !!each.measure )
			{
				result = ''.concat(
					self.options.operator.groupLeft,
					self.options.numberFormatter.format( each.measure.value ),
					self.options.operator.compoundSeparator,
					self.formatMeasureUnit( each.measure.unit ),
					self.options.operator.groupRight
				);
			}
			if( result !== '' )
			{
				if( exponent < 0 )
				{result = result.concat( self.options.operator.divisionOperator );}
				else
				{result = result.concat( self.options.operator.productOperator );}
			}
			let power = Math.abs( exponent ).toString().split( '' )
				.map( function( character, c, characters )
				{
					let symbol = self.options.exponent[ character ];
					if( Math.abs( exponent ) == 1 )
					{symbol = '';}
					return( symbol );
				}, self )
				.join( '' );
			if( power !== '' )
			{
				result = result.concat(
					[each.name, power].join( self.options.exponent['^'])
				);
			}
			else
			{result = result.concat( each.name );}
			return( result );
		});
	}
}
MeasureFormat.defaults =
{
	'locales':[],
	'numberFormatOptions':{'useGrouping':true,},
};
MeasureFormat.exponentDefaults =
{
	// '0':'\u{2070}',
	'1':'\u{00B9}',
	'2':'\u{00B2}',
	'3':'\u{00B3}',
	'4':'\u{2074}',
	'5':'\u{2075}',
	'6':'\u{2076}',
	'7':'\u{2077}',
	'8':'\u{2078}',
	'9':'\u{2079}',
	// '+':'\u{207A}',
	'-':'\u{207B}',
	'^':'',
};
MeasureFormat.operatorDefaults =
{
	'compoundSeparator':'-',// hyphen
	'divisionOperator':'/',// solidus
	'groupLeft':'(',
	'groupRight':')',
	'productOperator':'\u{22C5}',// interpunct
	'valueUnitDelimiter':' ',
};
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
if( typeof( module ) !== 'undefined' ){module.exports = MeasureFormat;}