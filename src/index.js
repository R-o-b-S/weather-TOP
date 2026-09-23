import "./styles.css";

const forecast = {};  //this array of Obj will containt the informations needed from VC forecast

async function getLocation () {  //gets the location to search from user and gets the forecast
    loading();
    const location = document.getElementById("location").value;
    for (let member in forecast) delete forecast[member]; //empty the obj in case of multiple searches in the same session
    const chk = await getForecast(location);
    loadingEnd ();
    if (chk === false) { return; }; // stops the function in case of error during fetch
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
        extractForecast(VCforecast);
        return true;
    } catch (error) {
        alert("bad request, try again");
        return false;
    }
}

function extractForecast (VCforecast) { //builds up the forecast OBJ with only needed information taken from VC forecast
    forecast["location"] = upperCase (VCforecast.resolvedAddress);
    forecast["currentTime"] = VCforecast.currentConditions.datetime;
    forecast["currentConditions"] = VCforecast.currentConditions.conditions;
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
            const humidityH = VCforecast.days[i].hours[e].humidity;
            const hour = new Hour (conditionH, tempH, humidityH);
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

function Hour (conditionH, tempH, humidityH) {
    this.condition = conditionH;
    this.temp = tempH;
    this.humidity = humidityH;
}

function upperCase (city) { //converts the first letter of a string to upper case
    return String(city).charAt(0).toUpperCase() + String(city).slice(1);
}

//Dom manipulation

function remove (e) { //function that removes DOM single elements
    const element = document.getElementById(e);
    element.remove();
}

let first = 0; //0 never researched, 1 DOM already changed the first time
let week = 0; //0 stands for the first 7 days of the forecast, 7 for the second week of the forecast (just for DOM manipulation)
//will need later for a button that sets week from 0 to 7 and then calls refresh (and back)
let daySelected = 0; //variable to identify the day currently selected by the user

function refresh  () { //refreshes the DOM
    if (first === 0){
        switchHeadDOM();
        first++;
        buildMainDOM();
    } else if (first === 1){
        remove ("summary");
        remove ("forecast");
        remove ("infoByHour");
        buildMainDOM();
    }
}

function switchHeadDOM () { //switch head id CSS style
    const element = document.getElementById("header");
    element.id = "header2";
}

function buildMainDOM () { //builds main id DOM
    buildSummary();
    buildForecast();
    buildInfo();
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
    txt = "Now: " + forecast.currentConditions;
    newDiv4.textContent = txt;
    document.getElementById("container_S").appendChild(newDiv4);

    const newDiv5 = document.createElement("div");
    newDiv5.classList = "container";
    newDiv5.id = "unit";
    document.getElementById("summary").appendChild(newDiv5);

    const newDiv6 = document.createElement("button");
    newDiv6.id = "unitSelection";
    if (degreeInUse === 0){ txt = "Show in °C"; }
    else if (degreeInUse === 1) { txt = "Show in °F"; }
    newDiv6.textContent = txt;
    newDiv6.addEventListener("click", tempConverter);
    document.getElementById("unit").appendChild(newDiv6);
}

function buildForecast () { //builds the second main section: forecast
    const newDiv = document.createElement("div");
    newDiv.classList = "container";
    newDiv.id = "forecast";
    document.getElementById("main").appendChild(newDiv);

    if (week === 7) {addWeekButton()};
    buildDaySlide ();
    if (week === 0) {addWeekButton()};
}

function weekScroll () { //switch between weeks
    if (week === 0) {
        week = 7;
        daySelected = 7;
        refresh();
    } else if (week === 7) {
        week = 0;
        daySelected = 0;
        refresh();
    }
}

function addWeekButton () { //display the button to change week
    if (week === 0) {
        const newButton = document.createElement("button");
        newButton.id = "weekSelection";
        newButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" id="arrowIcon" viewBox="0 0 24 24"><title>menu-right</title><path d="M10,17L15,12L10,7V17Z" /></svg>'
        newButton.addEventListener("click", weekScroll);
        document.getElementById("forecast").appendChild(newButton);
    } else if (week === 7) {
        const newButton = document.createElement("button");
        newButton.id = "weekSelection";
        newButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" id="arrowIcon" viewBox="0 0 24 24"><title>menu-left</title><path d="M14,7L9,12L14,17V7Z" /></svg>'
        newButton.addEventListener("click", weekScroll);
        document.getElementById("forecast").appendChild(newButton);
    }
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
        newDiv.addEventListener("click", selectDay => {daySelected = i; refresh();}); //allows the user to selct a new day to see in dail in infoByHour
        document.getElementById("forecast").appendChild(newDiv);

        const newDiv2 = document.createElement("div");
        newDiv2.classList = "dateContainer";
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

        txt = assignSVG(forecast.days[i].condition); //add SVG to slide
        newDiv.innerHTML += txt;

        const newDiv5 = document.createElement("div");
        newDiv5.id = "condition";
        txt = forecast.days[i].condition;   
        newDiv5.textContent = txt;
        document.getElementById("day"+i).appendChild(newDiv5);

        const newDiv6 = document.createElement("div");
        newDiv6.classList = "container";
        newDiv6.id = "ht"+i;
        document.getElementById("day"+i).appendChild(newDiv6);

        const newDiv7 = document.createElement("div");
        newDiv7.classList = "data";
        txt = "High:";
        newDiv7.textContent = txt;
        document.getElementById("ht"+i).appendChild(newDiv7);

        const newDiv8 = document.createElement("div");
        newDiv8.classList = "data";
        if (degreeInUse === 0){ txt = forecast.days[i].tempMax + " °F"; }
        else if (degreeInUse === 1) { txt = forecast.days[i].tempMax + " °C"; }
        newDiv8.textContent = txt;
        document.getElementById("ht"+i).appendChild(newDiv8);

        const newDiv9 = document.createElement("div");
        newDiv9.classList = "container";
        newDiv9.id = "lt"+i;
        document.getElementById("day"+i).appendChild(newDiv9);

        const newDiv10 = document.createElement("div");
        newDiv10.classList = "data";
        txt = "Low:";
        newDiv10.textContent = txt;
        document.getElementById("lt"+i).appendChild(newDiv10);

        const newDiv11 = document.createElement("div");
        newDiv11.classList = "data";
        if (degreeInUse === 0){ txt = forecast.days[i].tempMin + " °F"; }
        else if (degreeInUse === 1) { txt = forecast.days[i].tempMin + " °C"; }
        newDiv11.textContent = txt;
        document.getElementById("lt"+i).appendChild(newDiv11);
    }
}

function assignSVG (condition) { //takes the day condition and returns the appropriate weather rappresentation SVG
    if(condition === "Blowing Or Drifting Snow" || condition === "Heavy Freezing Drizzle/Freezing Rain" ||
        condition === "Light Freezing Drizzle/Freezing Rain" || condition === "Freezing Fog" ||
        condition === "Heavy Freezing Rain" || condition === "Light Freezing Rain" ||
        condition === "Ice" || condition === "Heavy Rain And Snow" || condition === "Light Rain And Snow" || 
        condition === "Snow" || condition === "Snow And Rain Showers" || condition === "Snow Showers" || 
        condition === "Heavy Snow" || condition === "Light Snow" || 
        condition === "Freezing Drizzle/Freezing Rain") {
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4a859c"><title>weather-snowy-heavy</title><path d="M4,16.36C3.86,15.82 4.18,15.25 4.73,15.11L7,14.5L5.33,12.86C4.93,12.46 4.93,11.81 5.33,11.4C5.73,11 6.4,11 6.79,11.4L8.45,13.05L9.04,10.8C9.18,10.24 9.75,9.92 10.29,10.07C10.85,10.21 11.17,10.78 11,11.33L10.42,13.58L12.67,13C13.22,12.83 13.79,13.15 13.93,13.71C14.08,14.25 13.76,14.82 13.2,14.96L10.95,15.55L12.6,17.21C13,17.6 13,18.27 12.6,18.67C12.2,19.07 11.54,19.07 11.15,18.67L9.5,17L8.89,19.27C8.75,19.83 8.18,20.14 7.64,20C7.08,19.86 6.77,19.29 6.91,18.74L7.5,16.5L5.26,17.09C4.71,17.23 4.14,16.92 4,16.36M1,10A5,5 0 0,1 6,5C7,2.65 9.3,1 12,1C15.43,1 18.24,3.66 18.5,7.03L19,7A4,4 0 0,1 23,11A4,4 0 0,1 19,15A1,1 0 0,1 18,14A1,1 0 0,1 19,13A2,2 0 0,0 21,11A2,2 0 0,0 19,9H17V8A5,5 0 0,0 12,3C9.5,3 7.45,4.82 7.06,7.19C6.73,7.07 6.37,7 6,7A3,3 0 0,0 3,10C3,10.85 3.35,11.61 3.91,12.16C4.27,12.55 4.26,13.16 3.88,13.54C3.5,13.93 2.85,13.93 2.47,13.54C1.56,12.63 1,11.38 1,10M14.03,20.43C14.13,20.82 14.5,21.04 14.91,20.94L16.5,20.5L16.06,22.09C15.96,22.5 16.18,22.87 16.57,22.97C16.95,23.08 17.35,22.85 17.45,22.46L17.86,20.89L19.03,22.05C19.3,22.33 19.77,22.33 20.05,22.05C20.33,21.77 20.33,21.3 20.05,21.03L18.89,19.86L20.46,19.45C20.85,19.35 21.08,18.95 20.97,18.57C20.87,18.18 20.5,17.96 20.09,18.06L18.5,18.5L18.94,16.91C19.04,16.5 18.82,16.13 18.43,16.03C18.05,15.92 17.65,16.15 17.55,16.54L17.14,18.11L15.97,16.95C15.7,16.67 15.23,16.67 14.95,16.95C14.67,17.24 14.67,17.7 14.95,17.97L16.11,19.14L14.54,19.55C14.15,19.65 13.92,20.05 14.03,20.43Z" /></svg>';
        return svg;
    } else if (condition === "Funnel Cloud/Tornado" || condition === "Squalls") {
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9b877c"><title>weather-tornado</title><path d="M21,5H3A1,1 0 0,1 2,4A1,1 0 0,1 3,3H21A1,1 0 0,1 22,4A1,1 0 0,1 21,5M20,8A1,1 0 0,0 19,7H5A1,1 0 0,0 4,8A1,1 0 0,0 5,9H19A1,1 0 0,0 20,8M21,12A1,1 0 0,0 20,11H10A1,1 0 0,0 9,12A1,1 0 0,0 10,13H20A1,1 0 0,0 21,12M16,16A1,1 0 0,0 15,15H9A1,1 0 0,0 8,16A1,1 0 0,0 9,17H15A1,1 0 0,0 16,16M13,20A1,1 0 0,0 12,19H10A1,1 0 0,0 9,20A1,1 0 0,0 10,21H12A1,1 0 0,0 13,20Z" /></svg>';
        return svg;
    } else if (condition === "Hail Showers" || condition === "Hail") {
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4a859c"><title>weather-hail</title><path d="M6,14A1,1 0 0,1 7,15A1,1 0 0,1 6,16A5,5 0 0,1 1,11A5,5 0 0,1 6,6C7,3.65 9.3,2 12,2C15.43,2 18.24,4.66 18.5,8.03L19,8A4,4 0 0,1 23,12A4,4 0 0,1 19,16H18A1,1 0 0,1 17,15A1,1 0 0,1 18,14H19A2,2 0 0,0 21,12A2,2 0 0,0 19,10H17V9A5,5 0 0,0 12,4C9.5,4 7.45,5.82 7.06,8.19C6.73,8.07 6.37,8 6,8A3,3 0 0,0 3,11A3,3 0 0,0 6,14M10,18A2,2 0 0,1 12,20A2,2 0 0,1 10,22A2,2 0 0,1 8,20A2,2 0 0,1 10,18M14.5,16A1.5,1.5 0 0,1 16,17.5A1.5,1.5 0 0,1 14.5,19A1.5,1.5 0 0,1 13,17.5A1.5,1.5 0 0,1 14.5,16M10.5,12A1.5,1.5 0 0,1 12,13.5A1.5,1.5 0 0,1 10.5,15A1.5,1.5 0 0,1 9,13.5A1.5,1.5 0 0,1 10.5,12Z" /></svg>';
        return svg;
    } else if (condition === "Lightning Without Thunder" || condition === "Thunderstorm" || 
        condition === "Thunderstorm Without Precipitation") {
            const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4a859c"><title>weather-lightning</title><path d="M6,16A5,5 0 0,1 1,11A5,5 0 0,1 6,6C7,3.65 9.3,2 12,2C15.43,2 18.24,4.66 18.5,8.03L19,8A4,4 0 0,1 23,12A4,4 0 0,1 19,16H18A1,1 0 0,1 17,15A1,1 0 0,1 18,14H19A2,2 0 0,0 21,12A2,2 0 0,0 19,10H17V9A5,5 0 0,0 12,4C9.5,4 7.45,5.82 7.06,8.19C6.73,8.07 6.37,8 6,8A3,3 0 0,0 3,11A3,3 0 0,0 6,14H7A1,1 0 0,1 8,15A1,1 0 0,1 7,16H6M12,11H15L13,15H15L11.25,22L12,17H9.5L12,11Z" /></svg>';
            return svg;
    } else if (condition === "Mist" || condition === "Sky Coverage Decreasing" || 
        condition === "Sky Coverage Increasing" || condition === "Sky Unchanged" || 
        condition === "Smoke Or Haze" || condition === "Overcast" || condition === "Partially cloudy" || 
        condition === "Fog" || condition === "partly cloudy throughout the day") {
            const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#86949b"><title>weather-cloudy</title><path d="M6,19A5,5 0 0,1 1,14A5,5 0 0,1 6,9C7,6.65 9.3,5 12,5C15.43,5 18.24,7.66 18.5,11.03L19,11A4,4 0 0,1 23,15A4,4 0 0,1 19,19H6M19,13H17V12A5,5 0 0,0 12,7C9.5,7 7.45,8.82 7.06,11.19C6.73,11.07 6.37,11 6,11A3,3 0 0,0 3,14A3,3 0 0,0 6,17H19A2,2 0 0,0 21,15A2,2 0 0,0 19,13Z" /></svg>';
            return svg;
    } else if (condition === "Drizzle" || condition === "Precipitation In Vicinity" || condition === "Light Rain" || 
        condition === "Light Drizzle" || condition === "Light Drizzle/Rain") {
            const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#857c9b"><title>weather-rainy</title><path d="M6,14.03A1,1 0 0,1 7,15.03C7,15.58 6.55,16.03 6,16.03C3.24,16.03 1,13.79 1,11.03C1,8.27 3.24,6.03 6,6.03C7,3.68 9.3,2.03 12,2.03C15.43,2.03 18.24,4.69 18.5,8.06L19,8.03A4,4 0 0,1 23,12.03C23,14.23 21.21,16.03 19,16.03H18C17.45,16.03 17,15.58 17,15.03C17,14.47 17.45,14.03 18,14.03H19A2,2 0 0,0 21,12.03A2,2 0 0,0 19,10.03H17V9.03C17,6.27 14.76,4.03 12,4.03C9.5,4.03 7.45,5.84 7.06,8.21C6.73,8.09 6.37,8.03 6,8.03A3,3 0 0,0 3,11.03A3,3 0 0,0 6,14.03M12,14.15C12.18,14.39 12.37,14.66 12.56,14.94C13,15.56 14,17.03 14,18C14,19.11 13.1,20 12,20A2,2 0 0,1 10,18C10,17.03 11,15.56 11.44,14.94C11.63,14.66 11.82,14.4 12,14.15M12,11.03L11.5,11.59C11.5,11.59 10.65,12.55 9.79,13.81C8.93,15.06 8,16.56 8,18A4,4 0 0,0 12,22A4,4 0 0,0 16,18C16,16.56 15.07,15.06 14.21,13.81C13.35,12.55 12.5,11.59 12.5,11.59" /></svg>';
            return svg;
    } else if (condition === "Rain" || condition === "Rain Showers" || condition === "Heavy Rain" || 
        condition === "Heavy Drizzle" || condition === "Heavy Drizzle/Rain") {
            const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#857c9b"><title>weather-pouring</title><path d="M9,12C9.53,12.14 9.85,12.69 9.71,13.22L8.41,18.05C8.27,18.59 7.72,18.9 7.19,18.76C6.65,18.62 6.34,18.07 6.5,17.54L7.78,12.71C7.92,12.17 8.47,11.86 9,12M13,12C13.53,12.14 13.85,12.69 13.71,13.22L11.64,20.95C11.5,21.5 10.95,21.8 10.41,21.66C9.88,21.5 9.56,20.97 9.7,20.43L11.78,12.71C11.92,12.17 12.47,11.86 13,12M17,12C17.53,12.14 17.85,12.69 17.71,13.22L16.41,18.05C16.27,18.59 15.72,18.9 15.19,18.76C14.65,18.62 14.34,18.07 14.5,17.54L15.78,12.71C15.92,12.17 16.47,11.86 17,12M17,10V9A5,5 0 0,0 12,4C9.5,4 7.45,5.82 7.06,8.19C6.73,8.07 6.37,8 6,8A3,3 0 0,0 3,11C3,12.11 3.6,13.08 4.5,13.6V13.59C5,13.87 5.14,14.5 4.87,14.96C4.59,15.43 4,15.6 3.5,15.32V15.33C2,14.47 1,12.85 1,11A5,5 0 0,1 6,6C7,3.65 9.3,2 12,2C15.43,2 18.24,4.66 18.5,8.03L19,8A4,4 0 0,1 23,12C23,13.5 22.2,14.77 21,15.46V15.46C20.5,15.73 19.91,15.57 19.63,15.09C19.36,14.61 19.5,14 20,13.72V13.73C20.6,13.39 21,12.74 21,12A2,2 0 0,0 19,10H17Z" /></svg>';
            return svg;
    } else if (condition === "Diamond Dust" || condition === "Dust storm") {
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9b877c"><title>weather-dust</title><path d="M3 5C3 4.4 3.4 4 4 4H5C5.6 4 6 4.4 6 5S5.6 6 5 6H4C3.4 6 3 5.6 3 5M4 13C4 12.4 4.4 12 5 12H6C6.6 12 7 12.4 7 13S6.6 14 6 14H5C4.4 14 4 13.6 4 13M4 16C3.4 16 3 16.4 3 17S3.4 18 4 18H9C9.6 18 10 17.6 10 17S9.6 16 9 16H4M18 5C18 4.4 18.4 4 19 4H21C21.6 4 22 4.4 22 5S21.6 6 21 6H19C18.4 6 18 5.6 18 5M7 20C6.4 20 6 20.4 6 21S6.4 22 7 22H11C11.6 22 12 21.6 12 21S11.6 20 11 20H7M3 10C2.4 10 2 9.6 2 9S2.4 8 3 8H12C13.1 8 14 7.1 14 6S13.1 4 12 4C11.4 4 10.9 4.2 10.6 4.6C10.2 5 9.6 5 9.2 4.6C8.8 4.2 8.8 3.6 9.2 3.2C9.9 2.5 10.9 2 12 2C14.2 2 16 3.8 16 6S14.2 10 12 10H3M19 12C19.6 12 20 11.6 20 11S19.6 10 19 10C18.7 10 18.5 10.1 18.3 10.3C17.9 10.7 17.3 10.7 16.9 10.3C16.5 9.9 16.5 9.3 16.9 8.9C17.4 8.3 18.2 8 19 8C20.7 8 22 9.3 22 11S20.7 14 19 14H10C9.4 14 9 13.6 9 13S9.4 12 10 12H19M18 18H13C12.4 18 12 17.6 12 17S12.4 16 13 16H18C19.7 16 21 17.3 21 19S19.7 22 18 22C17.2 22 16.4 21.7 15.9 21.1C15.5 20.7 15.5 20.1 15.9 19.7C16.3 19.3 16.9 19.3 17.3 19.7C17.5 19.9 17.7 20 18 20C18.6 20 19 19.6 19 19S18.6 18 18 18Z" /></svg>';
        return svg;
    } else if (condition === "Clear") {
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#e2b22e"><title>weather-sunny</title><path d="M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M3.36,17L5.12,13.23C5.26,14 5.53,14.78 5.95,15.5C6.37,16.24 6.91,16.86 7.5,17.37L3.36,17M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65,7M20.64,17L16.5,17.36C17.09,16.85 17.62,16.22 18.04,15.5C18.46,14.77 18.73,14 18.87,13.21L20.64,17M12,22L9.59,18.56C10.33,18.83 11.14,19 12,19C12.82,19 13.63,18.83 14.37,18.56L12,22Z" /></svg>';
        return svg;
    } else {
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4a859c"><title>weather-fog</title><path d="M3,15H13A1,1 0 0,1 14,16A1,1 0 0,1 13,17H3A1,1 0 0,1 2,16A1,1 0 0,1 3,15M16,15H21A1,1 0 0,1 22,16A1,1 0 0,1 21,17H16A1,1 0 0,1 15,16A1,1 0 0,1 16,15M1,12A5,5 0 0,1 6,7C7,4.65 9.3,3 12,3C15.43,3 18.24,5.66 18.5,9.03L19,9C21.19,9 22.97,10.76 23,13H21A2,2 0 0,0 19,11H17V10A5,5 0 0,0 12,5C9.5,5 7.45,6.82 7.06,9.19C6.73,9.07 6.37,9 6,9A3,3 0 0,0 3,12C3,12.35 3.06,12.69 3.17,13H1.1L1,12M3,19H5A1,1 0 0,1 6,20A1,1 0 0,1 5,21H3A1,1 0 0,1 2,20A1,1 0 0,1 3,19M8,19H21A1,1 0 0,1 22,20A1,1 0 0,1 21,21H8A1,1 0 0,1 7,20A1,1 0 0,1 8,19Z" /></svg>';
        return svg;
    }
}

function isEven (n) { //function to determine if a given number is even or odd
    if (n % 2 == 0){
       return(true);
    }
    else{
       return(false);    
    }
}

function buildInfo () {  //build the InfoByHour section in the DOM
    const newDiv = document.createElement("div");
    newDiv.id = "infoByHour";
    document.getElementById("main").appendChild(newDiv);

    for (let i=0; i<24; i++) {
        const newDiv = document.createElement("div");
        if (isEven(i) === true) {
            newDiv.classList = "hour";
        } else if (isEven(i) === false) {
            newDiv.classList = "hour contrast";
        }
        newDiv.id = "h"+i;
        document.getElementById("infoByHour").appendChild(newDiv);

        const newDiv2 = document.createElement("div");
        newDiv2.classList = "container hourH";
        newDiv2.id = "cHa"+i;
        document.getElementById("h"+i).appendChild(newDiv2);

        const newDiv3 = document.createElement("div");
        newDiv3.classList = "dataH";
        let txt = "Hour:";
        newDiv3.textContent = txt;
        document.getElementById("cHa"+i).appendChild(newDiv3);

        const newDiv4 = document.createElement("div");
        newDiv4.classList = "data";
        if (i < 10) {
            txt = "0"+i;
        } else {txt = i;}
        newDiv4.textContent = txt;
        document.getElementById("cHa"+i).appendChild(newDiv4);

        const newDiv5 = document.createElement("div");
        newDiv5.classList = "container hourC";
        newDiv5.id = "cHb"+i;
        document.getElementById("h"+i).appendChild(newDiv5);

        const newDiv6 = document.createElement("div");
        newDiv6.classList = "dataH";
        txt = "Condition:";
        newDiv6.textContent = txt;
        document.getElementById("cHb"+i).appendChild(newDiv6);

        const newDiv7 = document.createElement("div");
        newDiv7.classList = "data";
        txt = forecast.days[daySelected].hours[i].condition;
        newDiv7.textContent = txt;
        document.getElementById("cHb"+i).appendChild(newDiv7);

        const newDiv8 = document.createElement("div");
        newDiv8.classList = "container hour";
        newDiv8.id = "cHc"+i;
        document.getElementById("h"+i).appendChild(newDiv8);

        const newDiv9 = document.createElement("div");
        newDiv9.classList = "dataH";
        txt = "Temperature:";
        newDiv9.textContent = txt;
        document.getElementById("cHc"+i).appendChild(newDiv9);

        const newDiv10 = document.createElement("div");
        newDiv10.classList = "data";
        if (degreeInUse === 0){ txt = forecast.days[daySelected].hours[i].temp + " °F"; }
        else if (degreeInUse === 1) { txt = forecast.days[daySelected].hours[i].temp + " °C"; }
        newDiv10.textContent = txt;
        document.getElementById("cHc"+i).appendChild(newDiv10);

        const newDiv11 = document.createElement("div");
        newDiv11.classList = "container hour";
        newDiv11.id = "cHd"+i;
        document.getElementById("h"+i).appendChild(newDiv11);

        const newDiv12 = document.createElement("div");
        newDiv12.classList = "dataH";
        txt = "Humidity:";
        newDiv12.textContent = txt;
        document.getElementById("cHd"+i).appendChild(newDiv12);

        const newDiv13 = document.createElement("div");
        newDiv13.classList = "data";
        txt = forecast.days[daySelected].hours[i].humidity;
        newDiv13.textContent = txt;
        document.getElementById("cHd"+i).appendChild(newDiv13);
    }
}

function loading () {  //function to start the loading animation
    const newDiv = document.createElement("div");
    newDiv.id = "loader";
    document.getElementById("main").appendChild(newDiv);

    const newDiv2 = document.createElement("div");
    newDiv2.id = "loadBackground";
    document.body.appendChild(newDiv2);

} //it has to be stopped calling loadingEnd();

function loadingEnd() { //stops loading animation
    remove ("loader");
    remove ("loadBackground");
}

let degreeInUse = 0; //0 for farenights and 1 for Celsius

function tempConverter () {  // converts F in C and back
    if (degreeInUse === 0) {
        for(let i=0; i<14; i++) {
            forecast.days[i].tempMax = fToC (forecast.days[i].tempMax);
            forecast.days[i].tempMin = fToC (forecast.days[i].tempMin);
            for (let e=0; e<24; e++){
                forecast.days[i].hours[e].temp = fToC (forecast.days[i].hours[e].temp);
            }
        }
        degreeInUse = 1;
        refresh();
    } else if (degreeInUse === 1) {
        for(let i=0; i<14; i++) {
            forecast.days[i].tempMax = cToF (forecast.days[i].tempMax);
            forecast.days[i].tempMin = cToF (forecast.days[i].tempMin);
            for (let e=0; e<24; e++){
                forecast.days[i].hours[e].temp = cToF (forecast.days[i].hours[e].temp);
            }
        }
        degreeInUse = 0;
        refresh();
    }  
}

function fToC (temp) { // converts Farenight in Celsius
    let converted = (temp-32)*5/9;
    converted = Math.trunc(converted * 10);
    converted /= 10;
    return converted; 
}

function cToF (temp) { // converts Celsius in Farenight
    let converted = (temp*9/5)+32;
    converted = Math.trunc(converted * 10);
    converted /= 10;
    return converted; 
}