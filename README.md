# Maps for malnutrition analysis

This is the code used for producing maps in the paper "Does cereal, protein and micronutrient availability hold the key to the malnutrition conundrum? An exploratory analysis of cereal cultivation and wasting patterns of India" by Rama Krishna Sanjeev, Bindu Krishnan, Yogish Channa Basappa et al

## Dependencies

The data used for analysis in the study is published with explanation of variables on figshare: [Dataset used to assess relationship between millet cultivation and malnutrition patterns in India at district level](https://figshare.com/articles/Dataset_used_to_assess_relationship_between_millet_cultivation_and_malnutrition_patterns_in_India_at_district_level/12236789)

The same has been converted to CSV with extra computed columns and put in `data.csv` which is what is used for plotting maps.

Geographic Information on districts of India is present as a geojson file in districts.geojson. This file is derived from the export from GADM after incorporating changes related to Jammu & Kashmir's approved Indian map.


### Map credits:

Initial version of this project used maps by the following people:

* [Sajjad Anwar](https://github.com/geohacker/india/)
* [Hamad Khawaja](https://github.com/hamadkh/GeoJson4Kashmir/)

For revision 4 onwards, we used map by:

* [Debarghya Das](https://github.com/deedy/india-nfhs4)

### Libraries used:
* [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) - for mapping
* [Papaparse](https://www.papaparse.com/) - for parsing CSV
* [damerau-levenshtein](https://github.com/tad-lispy/node-damerau-levenshtein/) - for matching spellings

## How to use

* Download this code
* Serve the folder over a webserver (Eg: install http-server with `npm install -g http-server` and run `http-server`). See [here](https://gist.github.com/willurd/5720255) for single line servers in many languages.
* Open the server address in your browser. Maps have been generated at the resolution 2000 x 2000 which can be reached on any screen by going into [responsive design mode](https://developer.mozilla.org/en-US/docs/Tools/Responsive_Design_Mode).
* Use [Screenshot](https://developer.mozilla.org/en-US/docs/Tools/Taking_screenshots) within the browser for capturing high quality image.
* Choose the variables to plot as gradients and patterns by uncommenting the respective lines in `main.js` (see lines 4 - 26)

### What does this software do

* Loads the malnutrition and crop data and geographic data
* Merges the tabular data into map data by using a combination of manual match (first preference), exact match, and then closest match. (See `districts.js`)
* Plots the gradient variable as a base layer with a linear interpolator as defined in `styles.js`
* Adds the pattern variable as patterns based on the thresholds passed in.


# License

The software is released in MIT license. See `LICENSE` for details.