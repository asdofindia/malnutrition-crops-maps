import { levenshtein } from './levenshtein.js'
import { synonym } from './dictionary.js'
import { blacklist } from './blacklist.js'


const findDistrictRows = ({
    district, altDistrict, data, districtColumn
}) => {
    let dataRow = data.filter(districtRow => districtRow[districtColumn] == district)
    if (dataRow.length === 0) {
        dataRow = data.filter(districtRow => districtRow[districtColumn] == altDistrict)
    }
    return dataRow
}

const findDictionaryDistrict = ({
    district, altDistrict, data, districtColumn
}) => {
    const synonyms = synonym(district)
    let dataRow = data.filter(districtRow => synonyms.includes(districtRow[districtColumn]))
    return dataRow
}

const findClosestMatchDistrict = ({
    district, altDistrict, data, districtColumn
}) => {
    const reducer = (bestDistrict, districtRow) => {
        const dataDistrict = districtRow[districtColumn]
        const distance = levenshtein(district, dataDistrict).steps
        districtRow.distance = distance
        if (distance < bestDistrict.distance) return districtRow
        return bestDistrict
    }
    let dataRow = data.reduce(reducer, {distance: 10, district: null})
    return [dataRow]
}


const findDistrictDataInCSV = ({
    state, district, altDistrict, csvData, csvStateColumn, csvDistrictColumn
}) => {
    let sameStateRows = csvData.filter(districtRow => districtRow[csvStateColumn] == state)
    if (sameStateRows.length === 0) {
        const stateSynonyms = synonym(state)
        sameStateRows = csvData.filter(districtRow => stateSynonyms.includes(districtRow[csvStateColumn]))
        if (sameStateRows.length === 0) {
            console.log(`State: ${state} has no entry in the csv. Kindly check`)
            let districtRow = findDistrictRows({
                district, altDistrict, data: csvData, districtColumn: csvDistrictColumn
            })
            console.log(`Found ${districtRow.length} districts for ${district} by searching without state filter`)
            return districtRow
        }
    }

    let matchType = "direct"
    let withoutStateFilter = "Without state filter"
    let synonymMatch = "synonym"
    let levenshtein = "levenshtein distance"
    let defeat = "defeat"
    let excludedMatch = "blacklist"
    let districtRow = findDistrictRows({
                district, altDistrict, data: sameStateRows, districtColumn: csvDistrictColumn
    })
    if (districtRow.length === 0) {
        matchType = withoutStateFilter
        districtRow = findDistrictRows({
            district, altDistrict, data: csvData, districtColumn: csvDistrictColumn
        })
    }
    if (districtRow.length === 0) {
        matchType = synonymMatch
        districtRow = findDictionaryDistrict({
            district, altDistrict, data: csvData, districtColumn: csvDistrictColumn
        })
    }
    if (districtRow.length === 0) {
        matchType = levenshtein
        districtRow = findClosestMatchDistrict({
            district, altDistrict, data: csvData, districtColumn: csvDistrictColumn
        })
    }
    if (districtRow[0].district == null) {
        console.log(`Could not match ${district}`)
        matchType = defeat
    }
    if (Object.keys(blacklist).includes(district)) {
        matchType = excludedMatch
        districtRow = []
    }
    switch (matchType) {
        case excludedMatch:
            console.warn(`${district} of ${state} excluded. (${blacklist[district]})`)
            break;
        case synonymMatch:
            console.info(`${district} of ${state} matched through dictionary to ${districtRow[0].district} of ${districtRow[0].state}`)
            break;
        case levenshtein:
            console.warn(`${district} of ${state} matched through levenshtein to ${districtRow[0].district} of ${districtRow[0].state}`)
            break;
    }

    return districtRow
}

const findHighestAndLowestOf = (variable, data) => {
    const lowest = data.reduce((prevLowest, row) => Math.min(prevLowest, row[variable]), Number.POSITIVE_INFINITY)
    const highest = data.reduce((prevHighest, row) => Math.max(prevHighest, row[variable]), Number.NEGATIVE_INFINITY)
    return [lowest, highest]
}

const getGradientLevel = (value, range) => {
    const [lowest, highest] = range
    return (value - lowest) * (255 / (highest - lowest))
}

const getPattern = (value) => {
    if (value > 45) return "circle"
}

const getRelevantDistrictData = (feature, localData) => {
        const featureState = feature.properties["NAME_1"]
        const featureDistrict = feature.properties["NAME_2"]
        const featureDistrictAlt = feature.properties["VARNAME_2"]
        if (localData.length != 0) {
            const districtData = findDistrictDataInCSV({
                state: featureState,
                district: featureDistrict,
                altDistrict: featureDistrictAlt,
                csvData: localData,
                csvStateColumn: "state",
                csvDistrictColumn: "district"
            })
            return districtData
        }
}

const getGradientColor = (gradientValue) => `rgb(255, ${255 - (gradientValue * 0.5)}, ${255 - gradientValue})`

const Map = ({data, gradientVariable, patternVariable}) => {
    if (!gradientVariable) {
        gradientVariable = "per_capita_maize"
    }

    if (!patternVariable) {
        patternVariable = "stunted_5"
    }

    const [gradientRange, setGradientRange] = useState([0, 1])

    const [localData, setLocalData] = useState([])
    const position = [22.5, 83.5]
    const zoom = 5
    const preferCanvas = false

    const getGradientStyle = (feature) => {
        const districtData = getRelevantDistrictData(feature, localData)
        const styles = {
            fill: true,
            fillOpacity: 0.8,
            stroke: false,
        }
        if (districtData && districtData[0]) {
            const gradientValue = getGradientLevel(districtData[0][gradientVariable], gradientRange)
            styles.color = getGradientColor(gradientValue)
            return styles
        } else {
            styles.color = `lightgrey`
            return styles
        }
    }

    const getPatternStyle = (feature) => {
        const districtData = getRelevantDistrictData(feature, localData)
        const styles = {
            fill: true,
            color: `#ffffffff`,
            fillOpacity: 1,
            stroke: false,
        }
        if (districtData && districtData[0]) {
            const gradientValue = getGradientLevel(districtData[0][gradientVariable], gradientRange)
            const patternValue = districtData[0][patternVariable]
            // const pattern = getPattern(districtData[0][patternVariable])
            styles.color = getGradientColor(gradientValue)
            if (patternValue > 45) {
                styles.fillPattern = Patterns.StripePattern({
                    color: `black`,
                    key: `stripe`,
                    spaceColor: getGradientColor(gradientValue),
                    spaceOpacity: 1,
                    weight: 0.5,
                    dashArray: "4, 4, 2",
                    spaceWeight: 0.5,
                    angle: 45,
                    width: 25,
                    height: 10,
                })
            }
            return styles
        } else {
            return styles
        }
    }

    const enhanceData = (csvData) => {
        setGradientRange(findHighestAndLowestOf(gradientVariable, csvData))
        setLocalData(csvData)
    }
}

export {
    getGradientColor,
    getRelevantDistrictData
}

