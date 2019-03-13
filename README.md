# ValueMeasure
A data type and utilities for handling units of measure.

```JavaScript
const {Measure, MeasureUnitCollator, MeasureFormat} = require( 'valuemeasure' );
```

Simple unit as a string.
```JavaScript
let bagMeasure = new Measure(
{
	'value':5,
	'unit':
	{
		'name':'bag',
		'measure':
		{
			'value':80000,
			'unit':'kernel',
		},
	},
});
let measureFormatter = new MeasureFormat({'operator':{'productOperator':' '}});
measureFormatter.formatMeasure( bagMeasure );
// 5 (80,000-kernel) bag
```

Compound (array) unit as a string and objects.
```JavaScript
let torqueMeasure = new Measure(
{
	'value':500,
	'unit':
	[
		'kilogram',
		{
			'name':'meter',
			'exp':2,
		},
		{
			'name':'second',
			'exp':-2,
		},
	],
});
let measureFormatter = new MeasureFormat({'exponent':{'^':'^'}});
measureFormatter.formatMeasure( torqueMeasure );
// 500 kilogram⋅meter^²/second^²
```

Compound (array) complex (nested) unit as objects and a nested `Measure`.
```JavaScript
let fantasiaMeasure = new Measure(
{
	'value':2000,
	'unit':
	[
		{
			'name':'bucket',
			'measure':
			{
				'value':2,
				'unit':'gallon',
			},
		},
		{
			'name':'second',
			'exp':-1,
		},
	],
});
let measureFormatter = new MeasureFormat({'numberFormatOptions':{'useGrouping':false}});
measureFormatter.formatMeasure( fantasiaMeasure );
// 2000 (2-gallon)⋅bucket/second
```


```JavaScript
let accelerationMeasure = new Measure(
{
	'value':9.8,
	'unit':
	[
		'meter',
		{
			'name':'second',
			'exp':-2,
		},
	],
});
let timeMeasure = new Measure(
{
	'value':15,
	'unit':'second',
});
let productUnit = Measure.productOfUnits( accelerationMeasure.unit, timeMeasure.unit );
let speedMeasure = new Measure(
{
	'value':0,
	'unit':
	[
		'meter',
		{
			'name':'second',
			'exp':-1,
		},
	],
});
// Check whether a product of two `Measure`s would produce the expected unit.
let measureCollator = new MeasureCollator();
let wasExpected = measureCollator.compare( productUnit, speedMeasure.unit ) == 0;
// Pretty-print the resulting unit.
let measureFormatter = new MeasureFormat();
let unitFormatted = measureFormatter.formatMeasureUnit( productUnit );

```