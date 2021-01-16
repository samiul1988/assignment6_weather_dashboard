// const and global variables
const OWM_API_KEY = "ce455bd02a51e6ea3ab658a42367d8f2";
const LOCAL_STORAGE_CITY_LIST = "cityList";

// Initialize Data Variables
let currentWeatherObj = {
    cityName: "",
    date: "",
    temperature: 90.9,
    humidity: 0.0,
    windSpeed: 0.0,
    uvIndex: 0.0,
    weatherIcon: ""
}; // stores current weather conditions
let futureForecastList = []; // stores 5-day forecasts
let cityList = []; // stores list of cities that have been searched
let cityItem = {}; // stores individual entry for the cityList array

// helper function to determine uv condition
let checkUvIndexSeverity = function(uvIndex) {
    let uvStatus;
    if ( uvIndex <= 2 ) {
        uvStatus = "uv-low";
    } else if ( uvIndex > 2 && uvIndex <= 5 ) {
        uvStatus = "uv-medium";
    } if ( uvIndex > 5 && uvIndex <= 7 ) {
        uvStatus = "uv-high";
    } if ( uvIndex > 7 && uvIndex <= 10 ) {
        uvStatus = "uv-very-high";
    } if ( uvIndex >= 11 ) {
        uvStatus = "uv-extreme";
    }
    return uvStatus;
}

// helper function to format unix timestamp
let getDateFromTimeStamp = function(timeStamp) {
    return moment.unix(timeStamp).format("MM/DD/YYYY");
}

// helper function to find if an array contains a value
let isElementInArray = function(arr, element) {
    return arr.findIndex((item => item.name.toLowerCase() === element.name.toLowerCase())) < 0 ? false : true;
}

// helper function to prepend an item to an array
let prependArray = function(arr, item) {
    let tempArr = [item];
    tempArr.push(arr);
    return tempArr.flat();
}

// this function clears search input
let clearFormInput = function() {
    $("input#search-city").val('');
}

// this function renders current weather condition card to the page
let generateCurrentWeatherEl = function(data) {
    // heading element with weather icon (including tooltip)
    let headerEl = $("<h4>")
        .addClass("card-title mb-4")
        .html(`
            ${data.cityName} (${data.date})
            <div class="d-inline-block" >
                <img 
                    src="http://openweathermap.org/img/wn/${data.weatherIcon}.png" 
                    alt=${data.weatherDescription}
                    data-toggle="tooltip" 
                    data-placement="right" 
                    title=${data.weatherDescription}
                >
                </img>
            </div>
            ` );
    // <p> element for temperature
    let temperatureEl = $("<p>")
        .addClass("card-text")
        .html(`Temperature: ${data.temperature} °F`);
    
    // <p> element for humidity
    let humidityEl = $("<p>")
        .addClass("card-text")
        .html(`Humidity: ${data.humidity} %`);
    
    // <p> element for wind speed
    let windSpeedEl = $("<p>")
        .addClass("card-text")
        .html(`Wind Speed: ${data.windSpeed} MPH`);
    
    // <p> element for uv index
    let uvIndexEl = $("<p>")
        .addClass("card-text")
        .html(`
            UV Index: 
            <span 
                class="badge p-2 ${checkUvIndexSeverity(data.uvIndex)}"
                data-toggle="tooltip" 
                data-placement="right" 
                title=${checkUvIndexSeverity(data.uvIndex).replace("uv-", "")}
            >${Number.parseFloat(data.uvIndex).toFixed(2)}
            </span>
            `);  // UV Index
    
    // Main card element
    let cardEl = $("<div>")
        .addClass("card-body")
        .append(headerEl, temperatureEl, humidityEl, windSpeedEl, uvIndexEl)

    // append the card element to current weather container
    $("#current-weather-container")
        .empty()
        .append(cardEl);
}

// this function generates individual future forecast card item
let generateFutureForecastCardEl = function(data) {
    // heading element for date
    let dateEl = $("<h5>")
        .addClass("mb-3")
        .text(`${data.date}`);
    
    // <p> element for weather icon with tooltip
    let weatherIconEl = $("<p>")
        .addClass("card-text")
        .html(`
            <div >
                <img 
                    src="http://openweathermap.org/img/wn/${data.weatherIcon}.png" 
                    alt=${data.weatherDescription}
                    data-toggle="tooltip" 
                    data-placement="right" 
                    title=${data.weatherDescription}
                >
                </img>
            </div>  
        `);

    // <p> element for temperature
    let temperatureEl = $("<p>")
        .addClass("card-text")
        .html(`Temp: ${data.temperature} °F`);
    
    // <p> element for humidity
    let humidityEl = $("<p>")
        .addClass("card-text")
        .html(`Humidity: ${data.humidity} %`);
    
    // <p> element for wind speed
    let windSpeedEl = $("<p>")
        .addClass("card-text")
        .html(`Wind Spd: ${data.wind_speed} MPH`);
    
    // <p> element for uv index with tooltip
    let uviEl = $("<p>")
        .addClass("card-text")
        .html(`
            UV Ind: 
            <span 
                data-toggle="tooltip" 
                data-placement="right" 
                title=${checkUvIndexSeverity(data.uvi).replace("uv-", "")}
            >${Number.parseFloat(data.uvi).toFixed(2)}
            </span>`);

    // card body element
    let cardBodyEl = $("<div>")
        .addClass("card-body p-2")
        .append(dateEl, weatherIconEl, temperatureEl, humidityEl, windSpeedEl, uviEl); 
    
    // return parent card element
    return $("<div>")
        .addClass("card shadow-lg rounded bg-primary text-light forecast mr-2")
        .append(cardBodyEl)
}

// this function renders future forecast section to the page
let generateFutureForecastEl = function(dataList) {
    // heading element
    let headerEl = $("<h4>")
        .text("5-Day Forecast:");
    
    // cards container
    let cardsContainerEl = $("<div>")
        .addClass("d-flex justify-content-between");
    
    // append childs to cards container
    dataList.map((dataItem, index) => {
        cardsContainerEl.append(generateFutureForecastCardEl(dataItem));
    });

    // append the container div to the future weather container
    $("#future-weather-container")
        .empty()
        .append(headerEl, cardsContainerEl);
}

// this function saves the updated cityList to localStorage item 
let saveCityList = function() {
    localStorage.setItem(LOCAL_STORAGE_CITY_LIST, JSON.stringify(cityList));
};

// this function loads city list from localStorage  
let loadCityList = function() {
    // load the cityList item from localStorage
    cityList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CITY_LIST)) || [];
}

// this function renders City List to the page
let renderCityList = function() {
    let headerEl = $("#recent-search-header");
    if(cityList.length > 0){ // if there stored city items, then show these to the page
        let ulEl = $("<ul>")
            .addClass("list-group list-group-flush")
            .attr("id", "history-list");  // <ul> element

        cityList.map((city, index) => {
            let listEl = $("<li>").addClass("list-group-item").text(city.name);
            ulEl.append(listEl); // append list item to the ul element
        });
        let divEl = $("#history-list"); // select container div

        if(!divEl.hasClass("card")) {
            divEl.addClass("card"); // add appropriate class (one time only)
        }
        divEl.empty().append(ulEl); // append list items
        
        // if there are stored city items, then show the header 
        if(headerEl.hasClass("d-none")) {
            headerEl.removeClass("d-none");
        }
    } else {
        // if there is no stored city items, then hide the header
        if(!headerEl.hasClass("d-none")) {
            headerEl.addClass("d-none");
        }
    }
}


// this function returns the latitude and longitude from a City name using openweathermap api
let getCityCoordinates = function(cityName) {
    // returns a promise
    return new Promise(function(resolve, reject) {
        let urlForCoordinates = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${OWM_API_KEY}`;
    
        // get request to url
        fetch(urlForCoordinates)
            .then((response) => {
                if (response.ok) {
                    return response.json(); // convert valid response to json format
                } else {
                    throw new Error(); // otherwise throw an error
                }
            }).then((data) => {
                if(!data){
                    throw new Error(); // if there is no valid data, then throw an error
                }

                // store city location and name information to the global variable
                cityItem = {
                    name: data.name,
                    lat: data.coord.lat,
                    lon: data.coord.lon
                };
                resolve(cityItem); // call promise resolve handler
            })
            .catch(function(error) {
                reject(error); // call promise reject handler
            });
    });
}

// this function obtains required weather information using openweathermap api
let getWeatherData = function(coords) {
    let urlForecast = `https://api.openweathermap.org/data/2.5/onecall?lat=${parseFloat(coords.lat)}&lon=${parseFloat(coords.lon)}&units=imperial&exclude=minutely,hourly,alerts&appid=${OWM_API_KEY}`;
    
    // get weather data
    fetch(urlForecast)
        .then((response) => {
            if (response.ok) {
                return response.json(); // convert valid response to json format
            } else {
                alert("Error: " + response.statusText);
                cityItem = {};
                return null; // return null for invalid response
            }
        })
        .then((fullData) => {
            if(!fullData){
                return; // return withour further execution if response data is invalid
            }
            // store valid current-weather data to the relevant object
            currentWeatherObj.cityName = coords.name;
            currentWeatherObj.date = getDateFromTimeStamp(fullData.current.dt);
            currentWeatherObj.temperature = fullData.current.temp;
            currentWeatherObj.humidity = fullData.current.humidity;
            currentWeatherObj.windSpeed = fullData.current.wind_speed;
            currentWeatherObj.uvIndex = fullData.current.uvi;
            currentWeatherObj.weatherIcon = fullData.current.weather[0].icon;
            currentWeatherObj.weatherDescription = fullData.current.weather[0].main;
            
            // store valid future-weather data to the relevant object
            futureForecastList = [];
            fullData.daily.map((item, index) => {
                if ( index > 0 && index < 6 ) {
                    let tempObj = {};
                    tempObj.date = getDateFromTimeStamp(item.dt);
                    tempObj.weatherIcon = item.weather[0].icon;
                    tempObj.weatherDescription = item.weather[0].main;
                    tempObj.temperature = item.temp.max;
                    tempObj.humidity = item.humidity;
                    tempObj.wind_speed = item.wind_speed;
                    tempObj.uvi = item.uvi;
                    futureForecastList.push(tempObj);
                }
            });

            // if a new city is searched, store it to the localStorage
            if(!$.isEmptyObject(cityItem)){
                if (!isElementInArray(cityList, cityItem)) {
                    // limit storage size to the latest 10 searches
                    if(cityList.length === 10){
                        cityList.pop();
                    }
                    cityList = prependArray(cityList, cityItem);
                    saveCityList(); // save updated city list to localStorage
                    renderCityList(); // render updated city list to the page
                }
            }
            generateCurrentWeatherEl(currentWeatherObj); // render current weather to the page
            generateFutureForecastEl(futureForecastList); // render future weather to the page
            clearFormInput(); // clear search input
            cityItem = {}; // reset variable
        })
        .catch(function(error) {
            // handle server related errors
            alert("Unable to connect to Open Weather Map");
            clearFormInput();
        });
}

// Render Initial View
let renderInitialView = function(){
    loadCityList(); // loads city list from localStorage
    renderCityList(); // renders city list
}

// delegated event handlers for city list items
$("#history-list").on("click", "li", function(){
    let cityObj = cityList.filter( city => city.name === $(this).text() ); // obtain city item
    
    // get weather data and render items
    getWeatherData({
        name: cityObj[0].name, 
        lat: cityObj[0].lat,
        lon: cityObj[0].lon
    });
});

// Search form 'submit' event handler
$("#form-search-city").submit(function(e){
    e.preventDefault(); // prevent default behaviour (i.e. page refresh)

    let cityName = $("input#search-city").val().trim(); // get city name
    if (!cityName) {
        alert("Please use a valid city name"); // validation check
        return;
    }
    
    getCityCoordinates(cityName) // get city coordinates (lat, lon) which are required for next api call
        .then((data) => {
            getWeatherData(data);   // get weather data         
        })
        .catch( (error) => {
            // handle error
            alert("Unable to get data from Open Weather Map");
            clearFormInput();
        });
});

// tooltip event handler
$('#current-weather-container, #future-weather-container').on("mouseenter", '[data-toggle="tooltip"]', function(){
    $(this).tooltip();
});

// renders initial view
renderInitialView();
