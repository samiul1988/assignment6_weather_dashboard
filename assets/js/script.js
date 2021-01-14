// const and global variables
const OWM_API_KEY = "ce455bd02a51e6ea3ab658a42367d8f2";
const LOCAL_STORAGE_CITY_LIST = "cityList";

// Ini tialize Data Variables
let currentWeatherObj = {
    cityName: "",
    date: "",
    temperature: 90.9,
    humidity: 0.0,
    windSpeed: 0.0,
    uvIndex: 0.0,
    weatherIcon: ""
};
let futureForecastList = [];

let cityList = [];
let cityItem = {};

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

let generateCurrentWeatherEl = function(data) {
    let headerEl = $("<h4>")
        .addClass("card-title mb-4")
        .html(`
            ${data.cityName} (${data.date}) 
            <img src="http://openweathermap.org/img/wn/${data.weatherIcon}.png"></img>
            ` );
    let temperatureEl = $("<p>")
        .addClass("card-text")
        .html(`Temperature: ${data.temperature}`);
    let humidityEl = $("<p>")
        .addClass("card-text")
        .html(`Humidity: ${data.humidity}`);
    let windSpeedEl = $("<p>")
        .addClass("card-text")
        .html(`Wind Speed: ${data.windSpeed}`);
    let uvIndexEl = $("<p>")
        .addClass("card-text")
        .html(`UV Index: <span class="badge p-2 ${checkUvIndexSeverity(data.uvIndex)}">${data.uvIndex}</span>`);  // UV Index

    let cardEl = $("<div>")
        .addClass("card-body")
        .append(headerEl, temperatureEl, humidityEl, windSpeedEl, uvIndexEl)

    // append the div to the time block container
    $("#current-weather-container")
        .empty()
        .append(cardEl);
}

let generateFutureForecastCardEl = function(data) {
    let dateEl = $("<h5>")
        .addClass("mb-3")
        .text(`${data.date}`);
    let weatherIconEl = $("<p>")
        .addClass("card-text")
        .html(`
            <img src="http://openweathermap.org/img/wn/${data.weatherIcon}.png"></img>  
        `);
    let temperatureEl = $("<p>")
        .addClass("card-text")
        .html(`Temp: ${data.temperature}`);
    let humidityEl = $("<p>")
        .addClass("card-text")
        .html(`Humidity: ${data.humidity}`);

    let cardBodyEl = $("<div>")
        .addClass("card-body p-2")
        .append(dateEl, weatherIconEl, temperatureEl, humidityEl); 
    
    return $("<div>")
        .addClass("card bg-primary text-light forecast mr-2")
        .append(cardBodyEl)
}

let generateFutureForecastEl = function(dataList) {
    let headerEl = $("<h4>")
        .text("5-Day Forecast:");
    let cardsContainerEl = $("<div>")
        .addClass("d-flex justify-content-between");
    
    dataList.map((dataItem, index) => {
        cardsContainerEl.append(generateFutureForecastCardEl(dataItem));
    });

    // append the div to the time block container
    $("#future-weather-container")
        .empty()
        .append(headerEl, cardsContainerEl);
}

let getCityCoordinates = function(cityName) {
    return new Promise(function(resolve, reject) {
        let urlForCoordinates = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${OWM_API_KEY}`;
    
        // make a get request to url
        fetch(urlForCoordinates)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error();
                // alert("Error: " + response.statusText);
                // reject(null);
                }
            }).then((data) => {
                if(!data){
                    reject(null);
                }

                cityItem = {
                    name: data.name,
                    lat: data.coord.lat,
                    lon: data.coord.lon
                };
                resolve({
                    name: data.name,
                    lat: data.coord.lat,
                    lon: data.coord.lon
                });
            })
            .catch(function(error) {
                reject(error);
                // alert("Unable to connect to OWP");
            });
    });
}

let getWeatherData = function(coords) {
    let urlForecast = `https://api.openweathermap.org/data/2.5/onecall?lat=${parseFloat(coords.lat)}&lon=${parseFloat(coords.lon)}&exclude=minutely,hourly,alerts&appid=${OWM_API_KEY}`;
    fetch(urlForecast)
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                alert("Error: " + response.statusText);
                cityItem = {};
                return null;
            }
        })
        .then((fullData) => {
            if(!fullData){
                return;
            }
            console.log(fullData);
            currentWeatherObj.cityName = coords.name;
            currentWeatherObj.date = getDateFromTimeStamp(fullData.current.dt);
            currentWeatherObj.temperature = fullData.current.temp;
            currentWeatherObj.humidity = fullData.current.humidity;
            currentWeatherObj.windSpeed = fullData.current.wind_speed;
            currentWeatherObj.uvIndex = fullData.current.uvi;
            currentWeatherObj.weatherIcon = fullData.current.weather[0].icon;
            futureForecastList = [];
            fullData.daily.map((item, index) => {
                console.log(index);
                if ( index > 0 && index < 6 ) {
                    let tempObj = {};
                    tempObj.date = getDateFromTimeStamp(item.dt);
                    tempObj.weatherIcon = item.weather[0].icon;
                    tempObj.temperature = item.temp.max;
                    tempObj.humidity = item.humidity;
                    futureForecastList.push(tempObj);
                }
            });
            if(!$.isEmptyObject(cityItem)){
                cityList.push(cityItem);
                saveCityList();
                renderCityList();
            }
            generateCurrentWeatherEl(currentWeatherObj);
            generateFutureForecastEl(futureForecastList);
            clearFormInput();
            cityItem = {};
        })
        .catch(function(error) {
            alert("Unable to connect to Open Weather Map");
            clearFormInput();
        });
}


// let getWeatherDataWithCoordinates = function(cityName) { 
//     let urlForCoordinates = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${OWM_API_KEY}`;
//     console.log(urlForCoordinates);
//     // make a get request to url
//     fetch(urlForCoordinates)
//       .then((response) => {
//         if (response.ok) {
//             return response.json();
//         } else {
//           alert("Error: " + response.statusText);
//           return null;
//         }
//       }).then((data) => {
//           if(!data){
//               return;
//           }
//           currentWeatherObj = {};
//           currentWeatherObj.cityName = data.name;
//           cityItem = {
//             name: data.name,
//             lat: data.coord.lat,
//             lon: data.coord.lon
//           };

//           let urlForecast = `https://api.openweathermap.org/data/2.5/onecall?lat=${parseFloat(data.coord.lat)}&lon=${parseFloat(data.coord.lon)}&exclude=minutely,hourly,alerts&appid=${OWM_API_KEY}`
//           fetch(urlForecast)
//             .then((response) => {
//                 if (response.ok) {
//                     return response.json();
//                 } else {
//                   alert("Error: " + response.statusText);
//                   cityItem = {};
//                   return null;
//                 }
//             })
//             .then((fullData) => {
//                 if(!fullData){
//                     return;
//                 }
//                 console.log(fullData);
//                 currentWeatherObj.date = getDateFromTimeStamp(fullData.current.dt);
//                 currentWeatherObj.temperature = fullData.current.temp;
//                 currentWeatherObj.humidity = fullData.current.humidity;
//                 currentWeatherObj.windSpeed = fullData.current.wind_speed;
//                 currentWeatherObj.uvIndex = fullData.current.uvi;
//                 currentWeatherObj.weatherIcon = fullData.current.weather[0].icon;
//                 futureForecastList = [];
//                 fullData.daily.map((item, index) => {
//                     console.log(index);
//                     if ( index > 0 && index < 6 ) {
//                         let tempObj = {};
//                         tempObj.date = getDateFromTimeStamp(item.dt);
//                         tempObj.weatherIcon = item.weather[0].icon;
//                         tempObj.temperature = item.temp.max;
//                         tempObj.humidity = item.humidity;
//                         futureForecastList.push(tempObj);
//                     }
//                 });
//                 cityList.push(cityItem);
//                 saveCityList();
//                 renderCityList();
//                 generateCurrentWeatherEl(currentWeatherObj);
//                 generateFutureForecastEl(futureForecastList);
//             })
//       })
//       .catch(function(error) {
//         alert("Unable to connect to OWP");
//       });
//   };
  
// this function saves the updated cityList to localStorage item 
let saveCityList = function() {
    localStorage.setItem(LOCAL_STORAGE_CITY_LIST, JSON.stringify(cityList));
};

// this function loads city list from localStorage  
let loadCityList = function() {
    // load the cityList item from localStorage
    cityList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CITY_LIST)) || [];
}

// Renders City List
let renderCityList = function() {
    if(cityList.length > 0){
        let ulEl = $("<ul>")
            .addClass("list-group list-group-flush")
            .attr("id", "history-list");  // <ul> element

        cityList.map((city, index) => {
            let listEl = $("<li>").addClass("list-group-item").text(city.name);
            ulEl.append(listEl);
        });
        let divEl = $("#history-list"); 

        if(!divEl.hasClass("card")) {
            divEl.addClass("card");
        }
        divEl.empty().append(ulEl);
    }
}

// Render Initial View
let renderInitialView = function(){
    loadCityList();
    renderCityList();
}

let clearFormInput = function() {
    $("input#search-city").val('');
}

$("#history-list").on("click", "li", function(){
    // console.log("click");
    let cityObj = cityList.filter( city => city.name === $(this).text() ); 
    getWeatherData({
        name: cityObj[0].name, 
        lat: cityObj[0].lat,
        lon: cityObj[0].lon
    });
});

// Search form submit event handler
$("#form-search-city").submit(function(e){
    e.preventDefault(); // prevent default behaviour (i.e. page refresh)

    let cityName = $("input#search-city").val().trim();
    if (!cityName) {
        alert("Please use a valid city name");
        return;
    }
    
    getCityCoordinates(cityName)
        .then((data) => {
            getWeatherData(data);            
        })
        .catch( (error) => {
            // console.log("error");
            alert("Unable to get data from Open Weather Map");
            clearFormInput();
        });
    // getWeatherData(cityName);

});

renderInitialView();

