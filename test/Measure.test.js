const {Measure} = require( '../dist/ValueMeasure' );
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
test( 'Measure unit can be a string', () =>
{
	let volume = new Measure(
	{
		'value':5,
		'unit':'gallon',
	});
	expect( volume.unit.name ).toBe( 'gallon' );
});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
test( 'Measure unit can be an object', () =>
{
	let containerVolume = new Measure(
	{
		'value':2000,
		'unit':
		{
			'name':'bucket',
			'measure':
			{
				'value':5,
				'unit':'gallon',
			},
		},
	});
	expect( containerVolume.unit.name ).toBe( 'bucket' );
	expect( containerVolume.unit.measure.unit.name ).toBe( 'gallon' );
});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
test( 'Measure unit can be an array of strings and/or objects', () =>
{
	let containerVolumeRate = new Measure(
	{
		'value':2000,
		'unit':
		[
			{
				'name':'bucket',
				'measure':
				{
					'value':5,
					'unit':'gallon',
				},
			},
			{
				'name':'second',
				'exp':-1,
			},
		],
	});
	  
	expect( containerVolumeRate.unit[ 0 ].name ).toBe( 'bucket' );
	expect( containerVolumeRate.unit[ 0 ].measure.unit.name ).toBe( 'gallon' );
	expect( containerVolumeRate.unit[ 1 ].name ).toBe( 'second' );
});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//