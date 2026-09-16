import "./styles.css";

//DAWA9WNY3RQR747DRG7MDFEFK

//https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/london?key=DAWA9WNY3RQR747DRG7MDFEFK


function getLocation () {
    const location = document.getElementById("location").value;
    console.log(location);
    getForecast(location);
}

document.getElementById("search").onclick = getLocation;

document.getElementById("location").addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("search").click();
    }
});

async function getForecast (address) {
    try {
      const response = await fetch("https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/" + address + "?key=DAWA9WNY3RQR747DRG7MDFEFK");
      const forecast = await response.json();
      console.log(forecast);
    } catch (error) {
      console.error(error);
    }
}