const yellowPalette = ['#F2F12D','#EED322','#E6B71E','#DA9C20','#CA8323','#B86B25','#A25626','#8B4225','#723122']

const bluePalette1 = ['#b3cde0', '#d4add0', '#6497b1', '#7487a5', '#8477a1', '#9467a1', '#005b96', '#03396c', '#011f4b']

const greyScale = ['#eee', '#ddd', '#ccc', "#bbb", '#aaa', '#999', '#888', '#777', '#666']

const blueRedPalette = ['#5084DD', '#3064C6' , '#2147B6', '#1034A6', '#412F88', '#722B6A', '#A2264B', '#D3212D', '#F62D2D']

const whitebrownorange = ['#fdfdfd', '#fcf1e3', '#f9e1c2', '#f6d3a6', '#f4c88f', '#f1ba73', '#eeab54', '#ea982e', '#E58100']

const palette = whitebrownorange

const interpolator = (name) =>  [
    'interpolate',
    ['linear'],
    ['get', name],
    0,
    palette[0],
    10,
    palette[1],
    100,
    palette[2],
    1000,
    palette[3],
    5000,
    palette[4],
    10000,
    palette[5],
    50000,
    palette[6],
    100000,
    palette[7],
    500000,
    palette[8],
]

const interpolate = interpolator

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
    patternFill,
}
