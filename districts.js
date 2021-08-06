import { levenshtein } from './levenshtein.js'
import { synonym } from './dictionary.js'
import { blocklist } from './blocklist.js'
import config from "./config.js";

const findDistrictRowsInTable = ({
    district, altDistrict, data, districtColumn
}) => {
    return filterExactMatchOrValues(data, districtColumn, district, altDistrict)
}

const filterExactMatchOrValues = (rows, columnToSearch, exactMatch, alternateValues) => {
    const matchingRows = filterRowsWithValue(rows, columnToSearch, exactMatch)
    if (matchingRows.length > 0) {
        return matchingRows
    }
    return filterRowsWithValues(rows, columnToSearch, alternateValues)
} 

const filterRowsWithValue = (rows, columnToSearch, value) => {
    return rows.filter(row => row[columnToSearch] == value)
}

const filterRowsWithValues = (rows, columnToSearch, successValues) => {
    return rows.filter(row => {
        const relevantValueInRow = row[columnToSearch]
        return successValues.includes(relevantValueInRow)
    })
}


const findDictionaryDistrict = ({
    district, data, districtColumn
}) => {
    const synonyms = synonym(district)
    return filterRowsWithValues(data, districtColumn, synonyms)
}

const findClosestMatchDistrict = ({
    district, data, districtColumn
}) => {
    const WORST_CASE_CONSTANT = "WORST_CASE_DISTRICT_SPECIAL"
    const WORST_CASE = {distance: 10, district: WORST_CASE_CONSTANT}
    const reducer = (bestDistrict, districtRow) => {
        const dataDistrict = districtRow[districtColumn]
        const distance = levenshtein(district, dataDistrict).steps
        districtRow.distance = distance
        if (distance < bestDistrict.distance) return districtRow
        return bestDistrict
    }
    const dataRow = data.reduce(reducer, WORST_CASE)
    if (dataRow.district === WORST_CASE_CONSTANT) return []
    return [dataRow]
}


const findDistrictDataInCSV = ({
    state, district, altDistrict, csvData, csvStateColumn, csvDistrictColumn
}) => {
    const sameStateRows = filterExactMatchOrValues(csvData, csvStateColumn, state, synonym(state))
    if (sameStateRows.length === 0) {
        if (config.debug) {
            const districtRow = findDistrictRowsInTable({
                district, altDistrict, data: csvData, districtColumn: csvDistrictColumn
            })
            console.log(`Found ${districtRow.length} districts for ${district} by searching without state filter`)
            return districtRow
        }
        else {
            throw `State: ${state} has no entry in the csv. Kindly check`
        }
    }
    
    if (Object.keys(blocklist).includes(district)) {
        console.warn(`${district} of ${state} excluded. (${blocklist[district]})`)
        return []
    }
    const directlyMatchedDistricts = findDistrictRowsInTable({
        district, altDistrict, data: sameStateRows, districtColumn: csvDistrictColumn
    })
    if (directlyMatchedDistricts.length > 0) {
        return directlyMatchedDistricts
    }

    const matchedWithoutStateFilter = findDistrictRowsInTable({
        district, altDistrict, data: csvData, districtColumn: csvDistrictColumn
    })
    if (matchedWithoutStateFilter.length > 0) {
        console.warn(`${district} of ${state} matched to a different state to ${matchedWithoutStateFilter[0].district} of ${matchedWithoutStateFilter[0].state}`)
        return matchedWithoutStateFilter
    }

    const matchedThroughDictionary = findDictionaryDistrict({
        district, altDistrict, data: csvData, districtColumn: csvDistrictColumn
    })
    if (matchedThroughDictionary.length > 0) {
        console.info(`${district} of ${state} matched through dictionary to ${matchedThroughDictionary[0].district} of ${matchedThroughDictionary[0].state}`)
        return matchedThroughDictionary
    }

    const matchedThroughSimilarity = findClosestMatchDistrict({
        district, altDistrict, data: csvData, districtColumn: csvDistrictColumn
    })
    if (matchedThroughSimilarity.length > 0) {
        console.info(`${district} of ${state} matched through levenshtein to ${matchedThroughSimilarity[0].district} of ${matchedThroughSimilarity[0].state}`)
        return matchedThroughSimilarity
    }
    console.log(`Could not match ${district}`)

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
                state: featureState?.toLowerCase(),
                district: featureDistrict?.toLowerCase(),
                altDistrict: featureDistrictAlt?.toLowerCase() || featureDistrict?.toLowerCase(),
                csvData: localData,
                csvStateColumn: "state",
                csvDistrictColumn: "district"
            })
            return districtData
        }
}

const getGradientColor = (gradientValue) => `rgb(255, ${255 - (gradientValue * 0.5)}, ${255 - gradientValue})`

export {
    getGradientColor,
    getRelevantDistrictData
}
