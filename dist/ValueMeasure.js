'use strict';
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
class MeasureUnitCollator
{
	/**
	 * @typedef MeasureUnitCollatorOptions
	 * @param {*} options
	 * @property {?[string]=[]} operator.locales
	 *
	 * @param {MeasureUnitCollatorOptions} this.options
	 */
	constructor( options )
	{
		let derived_locales = (typeof( options ) === 'object' && options !== null)
			?options.locales
			:MeasureUnitCollator.defaults.locales;
		this.exponentCollator = new Intl.Collator( derived_locales, {'numeric':true});
		this.nameCollator = new Intl.Collator( derived_locales, {'sensitivity':'base'});
	}
	compare( leftMeasureUnit, rightMeasureUnit )
	{
		const leftUnitList = Array.isArray( leftMeasureUnit )?leftMeasureUnit:[leftMeasureUnit];
		const rightUnitList = Array.isArray( rightMeasureUnit )?rightMeasureUnit:[rightMeasureUnit];
		let comparison = Math.max( -1, Math.min( leftUnitList.length - rightUnitList.length, +1 ));
		if( comparison === 0 )
		{
			const unitSorter = this.unitSorterFactory();
			const leftSortedList = leftUnitList.sort( unitSorter );
			const rightSortedList = rightUnitList.sort( unitSorter );
			for( let i = 0; i < leftSortedList.length; ++i )
			{
				const leftUnit = leftSortedList[ i ], rightUnit = rightSortedList[ i ];
				let sub_comp = this.nameCollator.compare( leftUnit.name, rightUnit.name );
				if( sub_comp === 0 )
				{
					sub_comp = this.exponentCollator.compare( leftUnit.exp, rightUnit.exp );
					if( sub_comp === 0 )
					{
						if( !leftUnit.measure && !!rightUnit.measure )
						{sub_comp = -1;}
						else if( !!leftUnit.measure && !rightUnit.measure )
						{sub_comp = +1;}
						if( sub_comp === 0 )
						{
							if( !!leftUnit.measure && !!rightUnit.measure )
							{
								sub_comp = this.compare( leftUnit.measure.unit, rightUnit.measure.unit );
								if( sub_comp === 0 )
								{
									sub_comp = ((leftUnit.value < rightUnit.value)?-1
										:((leftUnit.value > rightUnit.value)?+1
											:((leftUnit.value === rightUnit.value)?0
												:-1
											)
										)
									);
								}
								else
								{
									comparison = sub_comp;
									break;
								}
							}
						}
						else
						{
							comparison = sub_comp;
							break;
						}
					}
					else
					{
						comparison = sub_comp;
						break;
					}
				}
				else
				{
					comparison = sub_comp;
					break;
				}
			}
		}
		return( comparison );
	}
	/** Sort the unit list by power descending.
	 */
	exponentSorter( leftUnit, rightUnit )
	{
		var order = this.exponentCollator.compare( leftUnit.exp, rightUnit.exp );
		return( order );
	}
	/** Sort the unit list by name ascending.
	 */
	nameSorter( leftUnit, rightUnit )
	{
		var order = this.nameCollator.compare( leftUnit.name, rightUnit.name );
		return( order );
	}
	/** Sort unit list by power descending then by name ascending.
	 */
	unitSorterFactory()
	{
		const self = this;
		return( function unitSorter( leftUnit, rightUnit )
		{
			var order = self.nameSorter( leftUnit, rightUnit );
			if( order == 0 )
			{order = self.exponentSorter( leftUnit, rightUnit );}
			return( order );
		});
	}
}
MeasureUnitCollator.defaults =
{
	'locales':[],
};
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
// if( typeof( module ) !== 'undefined' ){module.exports = MeasureUnitCollator;}
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
// 'use strict';
// const MeasureUnitCollator = require( './MeasureUnitCollator' );
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
/**
 * @version 1.0.0 (2019-01-07)
 * @typedef Measure
 * @property {?(string|object|[object]|UnitOfMeasure|[UnitOfMeasure])=''} unit - Unit(s) of the measure.
 * @property {?number=0.0} value - Numeric value of the measure.
 * @example <caption>5 (80,000-kernel) bag</caption>
 *	let bagMeasure = new Measure(
 *	{
 *		'value':5,
 *		'unit':
 *		{
 *			'name':'bag',
 *			'measure':
 *			{
 *				'unit':'kernel',
 *				'value':80000,
 *			},
 *		},
 *	});
 *	let measureFormatter = new MeasureFormat({'operator':{'productOperator':' '}});
 *	measureFormatter.formatMeasure( bagMeasure );
 * @example <caption>500 kilogram⋅meter^²/second^²</caption>
 *	let torqueMeasure = new Measure(
 *	{
 *		'value':500,
 *		'unit':
 *		[
 *			'kilogram',
 *			{
 *				'name':'meter',
 *				'exp':2,
 *			},
 *			{
 *				'name':'second',
 *				'exp':-2,
 *			},
 *		],
 *	});
 *	let measureFormatter = new MeasureFormat({'exponent':{'^':'^'}});
 *	measureFormatter.formatMeasure( torqueMeasure );
 * @example <caption>2000 (2-gallon)⋅bucket/second</caption>
 *	let fantasiaMeasure = new Measure(
 *	{
 *		'value':2000,
 *		'unit':
 *		[
 *			{
 *				'name':'bucket',
 *				'measure':
 *				{
 *					'unit':'gallon',
 *					'value':2,
 *				},
 *			},
 *			{
 *				'name':'second',
 *				'exp':-1,
 *			},
 *		],
 *	});
 *	let measureFormatter = new MeasureFormat({'numberFormatOptions':{'useGrouping':false}});
 *	measureFormatter.formatMeasure( fantasiaMeasure );
 */
class Measure
{
	/**
	 * @param {?(object|Measure)} measure - An object or another Measure instance to copy.
	 */
	constructor( measure )
	{
		this.unit = '';
		this.value = 0.0;
		if( typeof( measure ) === 'object' && measure !== null )
		{
			this.unit = measure.unit || this.unit;
			this.value = measure.value || this.value;
		}
		// if( this.unit !== null && typeof( this.unit ) !== 'undefined' )
		// {this.unit = new Measure.MeasureUnit( this.unit );}
		if( Array.isArray( this.unit ))
		{this.unit = this.unit.map( uom => new Measure.UnitOfMeasure( uom ));}
		else if( this.unit !== null && typeof( this.unit ) !== 'undefined' )
		{this.unit = new Measure.UnitOfMeasure( this.unit );}
		if( typeof( this.value ) !== 'number' )
		{throw( new TypeError( ''.concat( "'value' must be a number (or literally 'NaN'), '", this.value, "'." )));}
	}
	static canAddOrSubtract( leftMeasureUnit, rightMeasureUnit )
	{
		const measureUnitCollator = new MeasureUnitCollator();
		const comparison = measureUnitCollator.compare( leftMeasureUnit, rightMeasureUnit );
		return( comparison == 0 );
	}
	/** Invert the unit list.
	 */
	static inverseUnitMapper( each, n, every )
	{
		return(
		{
			'exp':each.exp * -1,
			'measure':each.measure,
			'name':each.name,
		});
	}
	static productOfUnits( leftMeasureUnitList, rightMeasureUnitList )
	{
		// Use Array.prototype.concat since the left and/or right unit may or may not be an Array.
		let units = [].concat( leftMeasureUnitList, rightMeasureUnitList )
			.reduce( Measure.unitReducer, []);
		return( units );
	}
	static quotientOfUnits( leftMeasureUnitList, rightMeasureUnitList )
	{
		// Use Array.prototype.concat since the left unit may or may not be an Array.
		let invertedList = [].concat( rightMeasureUnitList ).map( Measure.inverseUnitMapper );
		let units = Measure.productOfUnits( leftMeasureUnitList, invertedList )
			.reduce( Measure.unitReducer, []);
		return( units );
	}
	/** Combine and eliminate units.
	 */
	static unitReducer( result, each, n, every )
	{
		result = ((result instanceof Array)?(result):([]));
		var index = result.reduce( function( index, unit, u, units )
		{
			index = ((!isNaN( index ))?(index):(-1));
			if( unit.name === each.name )
			{index = u;}
			return( index );
		}, -1 );
		if( index < 0 )
		{result.push( each );}
		else
		{result[ index ].exp += each.exp;}
		return( result );
	}
	get [Symbol.toStringTag]()
	{return( 'Measure' );}
	toJSON()
	{
		// Initialize with all the properties to control their order of appearance.
		let json =
		{
			'unit':this.unit,
			'value':this.value,
		};
		if( typeof( json.unit ) === 'object' && json.unit !== null )
		{
			function toJSON_if_possible( uom, u, uoms )
			{
				// Explicitly serialize the "unit of measure".
				if( uom.hasOwnProperty( 'toJSON' ))
				{uom = uom.toJSON();}
				return( uom );
			}
			if( json.unit.hasOwnProperty( 'toJSON' ))
			{json.unit = toJSON_if_possible( json.unit, -1, []).bind( this );}
			else if( Array.isArray( json.unit ))
			{json.unit = json.unit.map( toJSON_if_possible, this );}
		}
		return( json );
	}
}
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
/**
 * @typedef UnitOfMeasure
 * @memberof Measure
 * @property {?Measure=null} measure - Scaling measure.
 * @property {?string=''} name - Common name of the unit.
 * @property {?number=1} exp - Exponent of the unit.
 */
Measure.UnitOfMeasure = class
{
	/**
	 * @param {?(string|object|UnitOfMeasure)} unitOfMeasure - An string, object, or another UnitOfMeasure instance to copy.
	 */
	constructor( unitOfMeasure )
	{
		this.name = '';
		this.exp = 1;
		this.measure = null;
		if( typeof( unitOfMeasure ) === 'string' )
		{this.name = unitOfMeasure;}
		else if( typeof( unitOfMeasure ) === 'object' && unitOfMeasure !== null )
		{
			this.measure = unitOfMeasure.measure || this.measure;
			this.name = unitOfMeasure.name || this.name;
			this.exp = unitOfMeasure.exp || 1;
		}
		if( typeof( this.measure ) === 'object' && this.measure !== null )
		{this.measure = new Measure( this.measure );}
		if( !Number.isInteger( this.exp ))
		{throw( new TypeError( ''.concat( "'exp' must be an integer, '", this.exp, "'." )));}
	}
	get [Symbol.toStringTag]()
	{return( 'Measure.UnitOfMeasure' );}
	toJSON()
	{
		// Initialize with all the properties to control their order of appearance.
		let json =
		{
			'exp':this.exp,
			'measure':this.measure,
			'name':this.name,
		};
		const is_default_exp = json.exp == 1;
		const is_default_measure = !json.measure;
		// Reduce to just a string.
		if( is_default_exp && is_default_measure )
		{json = this.name;}
		else
		{
			// Remove the default exponent.
			if( is_default_exp )
			{delete( json.exp );}
			// Remove the default measure.
			if( is_default_measure )
			{delete( json.measure );}
			// Explicitly serialize the measure.
			else if( typeof( json.measure ) === 'object' && json.measure !== null
				&& json.measure.hasOwnProperty( 'toJSON' ))
			{json.measure = json.measure.toJSON();}
		}
		return( json );
	}
};
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
// if( typeof( module ) !== 'undefined' ){module.exports = Measure;}
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
// 'use strict';
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
// if( typeof( module ) !== 'undefined' ){module.exports = MeasureFormat;}
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
if( typeof( module ) !== 'undefined' ){module.exports.Measure = Measure;}
if( typeof( module ) !== 'undefined' ){module.exports.MeasureUnitCollator = MeasureUnitCollator;}
if( typeof( module ) !== 'undefined' ){module.exports.MeasureFormat = MeasureFormat;}