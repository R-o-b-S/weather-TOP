import "./styles.css";

//DAWA9WNY3RQR747DRG7MDFEFK

//https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/london?key=DAWA9WNY3RQR747DRG7MDFEFK

let location = "";

function getLocation () {
    location = document.getElementById("location").value;
    console.log(location);
}

document.getElementById("search").onclick = getLocation;

document.getElementById("location").addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("search").click();
    }
});