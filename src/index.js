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
    forecast["location"] = VCforecast.resolvedAddress;
    forecast["currentTime"] = VCforecast.currentConditions.datetime;
    forecast["currentConditions"] = VCforecast.currentConditions.conditions;
    forecast["currentTemperature"] = VCforecast.currentConditions.temp;
    forecast["currentHumidity"] = VCforecast.currentConditions.humidity;
    const days = [];
    for (let i=0; i<15; i++){
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

//parte grafica

//prima di tutto serve una funzione che ripulisce lo schermo 
//da sviluppare dando come input la zona da ripulire se possibile
//poi un'altra che riordina la parte superiore
//sviluppare una funzione di attesa mentre si aspetta risposta dal server
//poi bisogna andare a comporre l'area principale dove le previsioni sono organizzate per giorno
//poi un'area inferiore dove ci sono le previsioni orarie
//poi cliccando sul giorno cambiano le informazioni sulle previsioni messe in evidenza, ovviamente

function remove (e) { //function that removes DOM single elements
    const element = document.getElementById(e);
    element.remove();
}

let first = 0; //0 never researched, 1 DOM already changed the first time

function refresh  () { //refreshes the DOM
    if (first === 0){
        switchHeadDOM();
        first++;
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