## Assignment 6: Weather Dashboard
---
### Topic
Server Side API

### User Story (Obtained from the assignment description)

```
AS A traveler
I WANT to see the weather outlook for multiple cities
SO THAT I can plan a trip accordingly
```

### Acceptance Criteria (Obtained from the assignment description)

```
GIVEN a weather dashboard with form inputs
WHEN I search for a city
THEN I am presented with current and future conditions for that city and that city is added to the search history
WHEN I view current weather conditions for that city
THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, the wind speed, and the UV index
WHEN I view the UV index
THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
WHEN I view future weather conditions for that city
THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, and the humidity
WHEN I click on a city in the search history
THEN I am again presented with current and future conditions for that city
```

### Expected Final Outcome (Obtained from assignment instruction)
![weather dashboard demo](./assets/images/06-server-side-apis-homework-demo.png)

## My Actions and Notes

* Created the project from scratch.
* Basic considerations were as follows:
    * Used regular javascript, jquery, bootstrap, fontawesome icon and momentjs
    * **Search Criteria**: When a city name is searched for the first time, it gets added to the top of the search list. I decided to store 10 recent searches in localStorage.  
    * **Storage Consideration**: The storage contains city name and location (latitude, longitude) information of 10 recent searches. If the storage contains 10 items, and a different city name is searched, then the oldest item is removed.
    * **API Considerations**: With free subscription, a limited API options are available in OpenWeatherMap ([See here](https://openweathermap.org/api)). The One Call API has the data required for the app, however, the current API format only accepts latitude and longitude as inputs (not city name). As such, I have used two APIs, one to get (lat, lon) information from a city name, and the second one is the one call API.
        * Since the (latitude, longitude) information are stored locally for a city which is already searched, only one API is called for subsequent searches for that city.
    * **Tooltips**: Tooltips are included for the weather icons and uv index numbers to describe the statuses with text.
    * **UV Index**: I have used 5 classes to categorize UV Indices. The classes are obtained from [Government of Canada UV Index Classification Source](https://www.canada.ca/en/environment-climate-change/services/weather-health/uv-index-sun-safety.html). The classes are:
        * Low [UV Index: 0 - 2]
        * Moderate [UV Index: 3 - 5]
        * High [UV Index: 6 - 7]
        * Very High [UV Index: 8 - 10]
        * Extreme [UV Index: 11+]

### Repository URL
[Click here to see the final outcome](https://samiul1988.github.io/assignment6_weather_dashboard/)