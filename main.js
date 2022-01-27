import { getRelevantDistrictData } from './districts.js'
import { interpolate, patternFill } from './styles.js'

// Choose the gradient (base layer) by uncommenting the correct line

const fallbackGradient = 'per_capita_jowar';

// const gradientVariable = 'per_capita_maize';
// const gradientVariable = 'per_capita_total_cereals_millets';
// const gradientVariable = 'per_capita_ragi';
// const gradientVariable = 'bmi_1849_lessthan185';

// const gradientVariable = 'millets_of_ill';
// const gradientVariable = 'per_capita_jowar';
// const gradientVariable = 'per_capita_bajra';
// const gradientVariable = 'per_capita_other_cereal_millet';
// const gradientVariable = 'per_capita_jowar_bajra_other';
// const gradientVariable = 'per_capita_rice';
// const gradientVariable = 'per_capita_wheat';
// const gradientVariable = 'per_capita_jbo';

// Choose the patterns to overlay by uncommenting the corresponding lines in patternVariables and patternThresholds

const patternVariables = ['stunting_total', 'wasting_total']
const patternThresholds = [46, 28]
const patternComparators = ['>=', '<']

// const patternVariables = ['bmi_less', 'sort_ght']
// const patternThresholds = [30, 15]
// const patternComparators = ['>=', '<']

mapboxgl.Map.prototype.loadImageAsync = function(url) {
    const mapContext = this;
    return new Promise((resolve, reject) => {
        mapContext.loadImage(url, (err, image) => {
            if (err) reject(err);
            resolve(image);
        })
    })
};

const gradientExists = typeof gradientVariable !== 'undefined'

const showCorrectLegend = () => {
    if (gradientExists) {
        document.querySelector(`#${gradientVariable}`).style.display = 'block'
    }
    if (typeof patternVariables !== 'undefined') {
        document.querySelector(`#${patternVariables[0]}`).style.display = 'block'
    }
}

showCorrectLegend()

const fetchData = () => new Promise((resolve, reject) => {
    Papa.parse('./data.csv', {
        header: true,
        download: true,
        complete: (results) => {
            resolve(results.data);
        }
    })
});

const harmonizeStateNames = (data) => data.map(row => {
    if (row["state"] !== "Telangana") {
        return row
    } else {
        row["state"] = "Andhra Pradesh"
        return row
    }
})

const recalculate_variables = (data) => data.map(district => {
    const total_population = parseInt(district["total_population"], 10);
    const poor_population = parseInt(district["total_poor_population"], 10);

    const jowar = parseInt(district["jowar"]);
    const bajra = parseInt(district["bajra"]);
    const others = parseInt(district["other_millets"]);
    const illMillets = others + bajra + jowar;
    const maize = parseInt(district["maize"]);
    const rice = parseInt(district["rice"]);
    const wheat = parseInt(district["wheat"]);
    const ragi = parseInt(district["ragi"]);
    const jbo = parseInt(district["jo_baj_othcer"]);


    district["per_capita_jowar"] = (jowar/total_population) * poor_population;
    district["per_capita_bajra"] = (bajra/total_population) * poor_population;
    district["per_capita_other_cereal_millet"] = (others/total_population) * poor_population;
    district["per_capita_jowar_bajra_other"] = (illMillets/total_population) * poor_population;
    district["per_capita_maize"] = (maize/total_population) * poor_population;
    district["per_capita_rice"] = (rice/total_population) * poor_population;
    district["per_capita_wheat"] = (wheat/total_population) * poor_population;
    district["per_capita_ragi"] = (ragi/total_population) * poor_population;
    district["per_capita_jbo"] = (jbo/total_population) * poor_population;
    return district
})

const fetchGeo = () => {
    return fetch('./districts.geojson').then(async (response) => {
        return await response.json();
    })
}

const enhanceData = (geojsonData, csvData) => {
    geojsonData.features = geojsonData.features.map((feature) => {
        const districtData = getRelevantDistrictData(feature, csvData)
        if (districtData && districtData[0]) {

            if (gradientExists) {
                const stringValue = districtData[0][gradientVariable]
                const floatValue = parseFloat(stringValue)
                feature.properties[gradientVariable] = floatValue
            } else {
                const stringValue = districtData[0][fallbackGradient]
                const floatValue = parseFloat(stringValue)
                feature.properties[fallbackGradient] = floatValue
            }

            for (const patternVariable of patternVariables) {
                const stringPatternValue = districtData[0][patternVariable]
                const floatPatternValue = parseFloat(stringPatternValue)
                feature.properties[patternVariable] = floatPatternValue
            }
            feature.properties["label"] = districtData[0]["label"]
        }
        return feature
    })
    return geojsonData
}

const createLegend = (interpolator) => {
    const target = document.querySelector(`#${gradientVariable}`);
    const colors = interpolator.slice(3);

    for (let index = 0; index < colors.length; index += 2) {
        const value = colors[index];
        const color = colors[index + 1];
        const newLevel = document.createElement('div');
        const newSpan = document.createElement('span');
        newSpan.setAttribute('style', `background-color: ${color}`);
        newLevel.appendChild(newSpan);
        const newText = document.createTextNode(value);
        newLevel.appendChild(newText);
        target.appendChild(newLevel);
    }
    const blackLevel = document.createElement('div');
    const blackSpan = document.createElement('span');
    blackSpan.setAttribute('style', `background-color: #ccc`)
    blackLevel.appendChild(blackSpan);
    const blackText = document.createTextNode("No data");
    blackLevel.appendChild(blackText);
    target.appendChild(blackLevel);
}

const mapStuff = (geojsonData) => {
    const zoom = 5.4
    var map = new mapboxgl.Map({
        container: 'map',
        style: './mapStyle.json',
        center: [83, 23],
        zoom
    });
    window.map = map;

    map.on('load', () => {
        mapLoader(map, geojsonData)
    });
}

const mapLoader = async (map, geojsonData) => {

    map.addSource('districts', {
        type: 'geojson',
        data: geojsonData
    });
    
    const interpolator = gradientExists ?
        [
            'case',
            ['==', ['get', gradientVariable], null],
            '#ccc',
            interpolate(gradientVariable)
        ] :
        [
            'case',
            ["==", ["get", fallbackGradient], null], '#ccc',
            [">=", ["get", fallbackGradient], 0], '#bbb', //'#eeab54',
            '#ccc'
        ]

    if (gradientExists) createLegend(interpolate(gradientVariable));
    
    map.addLayer({
        id: 'districts',
        type: 'fill',
        source: 'districts',
        paint: {
            'fill-color': interpolator,
            'fill-outline-color': '#333'
        }
    });

    const horizontalImage = await map.loadImageAsync('./assets/horizontal.png').catch(console.error);
    map.addImage('horizontalPattern', horizontalImage, {
        pixelRatio: 1
    });

    const verticalImage = await map.loadImageAsync('./assets/vertical.png').catch(console.error);
    map.addImage('verticalPattern', verticalImage, {
        pixelRatio: 1
    });

    const angledImage = await map.loadImageAsync('./assets/angled.png').catch(console.error);
    map.addImage('angledPattern', angledImage, {
        pixelRatio: 1
    });

    const emptyImage = await map.loadImageAsync('./assets/empty.png').catch(console.error);
    map.addImage('empty', emptyImage);

    // Use images
    map.addLayer({
        'id': 'pattern-layer',
        'type': 'fill',
        'source': 'districts',
        'paint': {
            'fill-pattern': patternFill(
                patternVariables[0],
                patternVariables[1],
                patternThresholds[0],
                patternThresholds[1],
                patternComparators[0],
                patternComparators[1]
            ),
            'fill-opacity': 0.7
        }
    });
    if (!gradientExists) {
        map.addLayer({
            'id': 'poi-labels',
            'type': 'symbol',
            'source': 'districts',
            'paint': {
                'text-color': 'white',
                'text-halo-color': 'black',
                'text-halo-width': 1
            },
            'layout': {
                'text-field': ['get', 'label'],
                'text-font': ['Open Sans Bold'],
                'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                'text-radial-offset': 0.5,
                'text-justify': 'auto'
            }
        })
    }
    
}

(async () => {
    let data = await fetchData();
    data = recalculate_variables(data)

    let geographies = await fetchGeo();

    let combinedData = enhanceData(geographies, data);

    mapStuff(combinedData);

})();