import "./styles.css";

async function getLocation () {  //gets the location to search from user and gets the forecast
    const location = document.getElementById("location").value;
    console.log(location);
    const forecast = await getForecast(location);
    console.log(forecast);
    showForecast(forecast);
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
      const forecast = await response.json();
      console.log(forecast);
      return forecast;
    } catch (error) {
      console.error("fetch error");
    }
}

//list of information to display from JSON file:
//general forecast for current day + 14
//hourly forecast for current day + 14
//namely forecast.days[n].conditions/.description/.tempmax/.tempmin/.humidity
// then the same for every hour forecast.days[n].hours[i].conditions/

function showForecast (forecast) { //for now prints the forecast on console, this will later manipulate DOM
    for (let i=0; i<15; i++){
        console.log("day"+i);
        showDay(forecast, i);
    }
}

function showDay (forecast, i) {
    console.log("conditions: " + forecast.days[i].conditions);
    console.log("description: " + forecast.days[i].description);
}