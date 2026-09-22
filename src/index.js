import "./styles.css";

const forecast = {};  //this array of Obj will containt the informations needed from VC forecast

async function getLocation () {  //gets the location to search from user and gets the forecast
    const location = document.getElementById("location").value;
    console.log(location);
    for (let member in forecast) delete forecast[member]; //empty the obj in case of multiple searches in the same session
    await getForecast(location);
    console.log(forecast);
    refresh ();
}

document.getElementById("location").addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        getLocation();
    }
});  //this one start the search on Enter press

async function getForecast (address) { //gets the forecast
    try {
        const response = await fetch("https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/" + address + "?key=DAWA9WNY3RQR747DRG7MDFEFK");
        const VCforecast = await response.json();
        console.log(VCforecast);
        extractForecast(VCforecast);
        return;
    } catch (error) {
      console.error("error");
    }
}

function extractForecast (VCforecast) { //builds up the forecast OBJ with only needed information taken from VC forecast
    forecast["location"] = upperCase (VCforecast.resolvedAddress);
    forecast["currentTime"] = VCforecast.currentConditions.datetime;
    forecast["currentConditions"] = VCforecast.currentConditions.conditions;
//    forecast["currentTemperature"] = VCforecast.currentConditions.temp;
//    forecast["currentHumidity"] = VCforecast.currentConditions.humidity;
    const days = [];
    for (let i=0; i<14; i++){
        const date = VCforecast.days[i].datetime;
        const condition = VCforecast.days[i].conditions;
        const tempMax = VCforecast.days[i].tempmax;
        const tempMin = VCforecast.days[i].tempmin;
        const humidity = VCforecast.days[i].humidity;
        const hours = [];
        for (let e=0; e<24; e++){ 
            const conditionH = VCforecast.days[i].hours[e].conditions;
            const tempH = VCforecast.days[i].hours[e].temp;
            const hour = new Hour (conditionH, tempH);
            hours.push(hour);
        }
        const day = new Day(date, condition, tempMax, tempMin, humidity, hours);
        days.push(day);
    }
    forecast["days"] = days;
} 


function Day (date, condition, tempMax, tempMin, humidity, hours) {
    this.date = date;
    this.condition = condition;
    this.tempMax = tempMax;
    this.tempMin = tempMin;
    this.humidity = humidity;
    this.hours = hours;
}

function Hour (conditionH, tempH) {
    this.condition = conditionH;
    this.temp = tempH;
}

function upperCase (city) { //converts the first letter of a string to upper case
    return String(city).charAt(0).toUpperCase() + String(city).slice(1);
}

//parte grafica

//prima di tutto serve una funzione che ripulisce lo schermo 
//da sviluppare dando come input la zona da ripulire se possibile
//sviluppare una funzione di attesa mentre si aspetta risposta dal server
//poi bisogna andare a comporre l'area principale dove le previsioni sono organizzate per giorno
//poi un'area inferiore dove ci sono le previsioni orarie
//poi cliccando sul giorno cambiano le informazioni sulle previsioni messe in evidenza, ovviamente

function remove (e) { //function that removes DOM single elements
    const element = document.getElementById(e);
    element.remove();
}

let first = 1; //0 never researched, 1 DOM already changed the first time
let week = 0; //0 stands for the first 7 days of the forecast, 7 for the second week of the forecast (just for DOM manipulation)
//will need later for a button that sets week from 0 to 7 and then calls refresh (and back)
let daySelected = 0; //variable to identify the day currently selected by the user

function refresh  () { //refreshes the DOM
    if (first === 0){
        switchHeadDOM();
        first++;
        buildSummary();
    } else if (first === 1){
        console.log("work in progress");
    }
}

function switchHeadDOM () { //switch head id CSS style
    const element = document.getElementById("header");
    element.id = "header2";
}

function buildMainDOM () { //builds main id DOM
    console.log("work in progress");
}

function buildSummary () { //builds the summary ID in "main"
    const newDiv = document.createElement("div");
    newDiv.classList = "container";
    newDiv.id = "summary";
    document.getElementById("main").appendChild(newDiv);

    const newDiv2 = document.createElement("div");
    newDiv2.id = "container_S";
    document.getElementById("summary").appendChild(newDiv2);

    const newDiv3 = document.createElement("div");
    newDiv3.id = "city";
    let txt = forecast.location;
    newDiv3.textContent = txt;
    document.getElementById("container_S").appendChild(newDiv3);

    const newDiv4 = document.createElement("div");
    newDiv4.id = "condition";
    txt = "Now: " + forecast.currentCondition;
    newDiv4.textContent = txt;
    document.getElementById("container_S").appendChild(newDiv4);

    const newDiv5 = document.createElement("div");
    newDiv5.classList = "container";
    newDiv5.id = "unit";
    document.getElementById("summary").appendChild(newDiv5);

    const newDiv6 = document.createElement("div");
    newDiv6.id = "unitSelection";
    txt = "Show in °C";
    document.getElementById("unit").appendChild(newDiv6);
}

function buildForecast () { //builds the second main section: forecast
    const newDiv = document.createElement("div");
    newDiv.classList = "container";
    newDiv.id = "forecast";
    document.getElementById("main").appendChild(newDiv);

    buildDaySlide ();
}

function getDayNumber (date) { //takes only the day number from a given date
    const dayN = new Date(date).getDate();
    return dayN;
}

function getDayName (date) { //takes day name from a given date
    const dayN = new Date(date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayString = days[dayN.getDay()];
    return dayString;
}

function buildDaySlide () { //builds the daily slides in the forecast div
    for (let i=week; i<week+7; i++) {
        const newDiv = document.createElement("div");
        if (i === daySelected) {
            newDiv.classList = "daySlide selected"; 
        } else {
            newDiv.classList = "daySlide";
        }
        newDiv.id = "day"+i;
        document.getElementById("forecast").appendChild(newDiv);

        const newDiv2 = document.createElement("div");
        newDiv2.classList = "cdateContainer";
        newDiv2.id = "dc"+i;
        document.getElementById("day"+i).appendChild(newDiv2);

        const newDiv3 = document.createElement("div");
        newDiv3.classList = "dayNumber";
        let txt = getDayNumber(forecast.days[i].date);
        newDiv3.textContent = txt;
        document.getElementById("dc"+i).appendChild(newDiv3);

        const newDiv4 = document.createElement("div");
        newDiv4.classList = "dayName";
        txt = getDayName(forecast.days[i].date);
        newDiv4.textContent = txt;
        document.getElementById("dc"+i).appendChild(newDiv4);
    }
}


