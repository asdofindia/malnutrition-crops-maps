const title_case_dictionary = {
    "Andaman and Nicobar": ["Andaman and Nicobar Islands"],
    "Orissa": ["Odisha"],
    "Uttaranchal": ["Uttarakhand"],
    "NCT of Delhi": ["Delhi"],
    "Cuddapah": ["Y.S.R."],
    "Nellore": ["Sri Potti Sriramulu Nellore"],
    "Upper Dibang Valley": ["Dibang Valley"],
    "North Cachar Hills": ["Dima Hasao"],
    "Bhabua": ["Kaimur (Bhabua)", "Kaimur"],
    "Kaimur": ["Kaimur (Bhabua)"],
    "Dantewada": ["Dakshin Bastar Dantewada"],
    "Kanker": ["Uttar Bastar Kanker"],
    "Kawardha": ["Kabirdham"],
    "Koriya": ["Korea (Koriya)"],
    "Delhi": ["New Delhi"],
    "Anantnag (Kashmir South)": ["Anantnag"],
    "Baramula (Kashmir North)": ["Baramula"],
    "Kupwara (Muzaffarabad)": ["Kupwara"],
    "Ladakh (Leh)": ["Leh"],
    "Leh (Ladakh)": ["Leh"],
    "Bangalore Urban": ["Bangalore"],
    "Kavaratti": ["Lakshadweep"],
    "East Nimar": ["Khandwa (East Nimar)"],
    "West Nimar": ["Khargone (West Nimar)"],
    "Greater Bombay": ["Mumbai Suburban"],
    "East Imphal": ["Imphal East"],
    "West Imphal": ["Imphal West"],
    "Senapati": ["Senapati (Excluding 3 Sub-Divisions)"],
    "Nawan Shehar": ["Shahid Bhagat Singh Nagar"],
    "North Sikkim": ["North  District"],
    "East Sikkim": ["East District"],
    "Nilgiris": ["The Nilgiris"],
    "Hathras": ["Mahamaya Nagar"],
    "Sant Ravi Das Nagar": ["Sant Ravidas Nagar (Bhadohi)"],
    "Amroha" :["Jyotiba Phule Nagar"],
    "Kasganj": ["Kanshiram Nagar"],
    "North 24 Parganas": ["North Twenty Four Parganas"],
    "South 24 Parganas": ["South Twenty Four Parganas"]
}

const lowercase = (dict) => {
    const result = {}
    for (const key in dict) {
        result[key.toLowerCase()] = dict[key].map(synonym => synonym.toLowerCase())
    }
    return result;
}

const dictionary = lowercase(title_case_dictionary)

const keys = Object.keys(dictionary)

const lookup = (word) => {
    for (const key in keys) {
        if (dictionary[key].includes(word)) return key
    }
}

const synonym = (word) => {
    const synonyms = dictionary[word]
    if (synonyms) return synonyms
    return []
}

export {
    lookup,
    synonym
}
