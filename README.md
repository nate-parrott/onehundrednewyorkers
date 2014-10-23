## One Hundred New Yorkers

[onehundrednewyorkers.appspot.com](http://onehundrednewyorkers.appspot.com)

A simple data visualization that randomly selects one hundred New Yorkers' responses to the American Community Survey (2012) and visualizes them as icons on the page. You can toggle on and off visual indicators of things like age, occupation, citizenship or (soon) educational attainment. You can also arrange people on the X and Y axis by these factors — for example, you could group people by age on one axis, income on another, and shows icons next to each person to indicate whether they have health insurance or not.

Raw CSV data for the ACS comes from the Census Bureau's American Factfinder tool, and shapefiles of the PUMA districts (which the respondents are divided by geographically, and roughly correspond to NYC Community Districts) come from [NHGIS](https://www.nhgis.org/). All this data is pre-processed and eventually converted to JSON using the various Python scripts included in the repository. Sorry for the lack of _real_ documentation.
