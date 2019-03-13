'use strict';
// const MeasureCollator = require( './MeasureCollator' );
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
		const measureCollator = new MeasureCollator();
		const comparison = measureCollator.compare( leftMeasureUnit, rightMeasureUnit );
		return( comparison == 0 );
	}
	/** Invert the unit list.
	 */
	static inverseMapper( each, n, every )
	{
		each.exp *= -1;
		return( each );
	}
	static multiplyBy( leftMeasureUnitList, rightMeasureUnitList )
	{
		let units = [].concat( leftMeasureUnitList, rightMeasureUnitList )
			.reduce( Measure.unitReducer, []);
		return( units );
	}
	static divideBy( leftMeasureUnitList, rightMeasureUnitList )
	{
		let invertedList = rightMeasureUnitList.map( Measure.inverseMapper );
		let units = multiplyBy( leftMeasureUnitList, invertedList )
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
if( typeof( module ) !== 'undefined' ){module.exports = Measure;}