'use strict';
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
class MeasureCollator
{
	/**
	 * @typedef MeasureCollatorOptions
	 * @param {*} options
	 * @property {?[string]=[]} operator.locales
	 *
	 * @param {MeasureCollatorOptions} this.options
	 */
	constructor( options )
	{
		let derived_locales = (typeof( options ) === 'object' && options !== null)
			?options.locales
			:MeasureCollator.defaults.locales;
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
MeasureCollator.defaults =
{
	'locales':[],
};
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
if( typeof( module ) !== 'undefined' ){module.exports = MeasureCollator;}