import "./styles.css";

const forecast = {};  //this array of Obj will containt the informations needed from VC forecast

async function getLocation () {  //gets the location to search from user and gets the forecast
    const location = document.getElementById("location").value;
    console.log(location);
    for (let member in forecast) delete forecast[member]; //empty the obj in case of multiple searches in the same session
    await getForecast(location);
    console.log(forecast);
}

document.getElementById("search").onclick = getLocation;

document.getElementById("location").addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("search").click();
    }
});  //this one clicks the search button if the user presses Enter in the input box

async function getForecast (address) { //gets the forecast
    try {
        const response = await fetch("https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/" + address + "?key=DAWA9WNY3RQR747DRG7MDFEFK");
        const VCforecast = await response.json();
        console.log(VCforecast);
        extractForecast(VCforecast);
        return;
    } catch (error) {
      console.error("fetch error");
    }
}

//list of information to display from JSON file:
//general forecast for current day + 14
//hourly forecast for current day + 14
//namely forecast.days[n].conditions/.description/.tempmax/.tempmin/.humidity
// then the same for every hour forecast.days[n].hours[i].conditions/

function extractForecast (VCforecast) { //builds up the forecast OBJ with only needed information taken from VC forecast
    forecast["currentTime"] = VCforecast.currentConditions.datetime;
    forecast["currentConditions"] = VCforecast.currentConditions.conditions;
    forecast["currentTemperature"] = VCforecast.currentConditions.temp;
    forecast["currentHumidity"] = VCforecast.currentConditions.humidity;
    //etc...
} 
