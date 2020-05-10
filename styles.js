const interpolator = (name) =>  [
    'interpolate',
    ['linear'],
    ['get', name],
    0,
    '#F2F12D',
    10,
    '#EED322',
    100,
    '#E6B71E',
    1000,
    '#DA9C20',
    5000,
    '#CA8323',
    10000,
    '#B86B25',
    50000,
    '#A25626',
    100000,
    '#8B4225',
    500000,
    '#723122'
]

const interpolate = (variable) => interpolator(variable)

const patternFill = (var1, var2, var1t, var2t, greater, lesser) => [
    'case',

    [
        'all',
        [greater, ["get", var1], var1t],
        [lesser, ["get", var2], var2t]
    ],
    'horizontalPattern',

    [
        'all',
        [lesser, ["get", var1], var1t],
        [greater, ["get", var2], var2t]
    ],
    'verticalPattern',

    [
        'all',
        [greater, ["get", var1], var1t],
        [greater, ["get", var2], var2t]
    ],
    'angledPattern',

    'empty'
]


export {
    interpolate,
    patternFill
}
