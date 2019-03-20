// TMArtistObject contains information about one performing artist

// Array of Artists 
var TMEvents = [];

// jQuery(document).ready(function () {
////////////////////////////////////////////////////////////////////////////////////////////
// IMPORTANT!!! set "var debug = true" when debugging, else set it to false           //////
////////////////////////////////////////////////////////////////////////////////////////////
var debug = false;

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//  createEvents(param events) - parses the Ticket Master response into an array of TMArtistObjects    //
//             contained in the TMEVents array                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function createEvents(events) {

    // called to create eevents so create a new TMEvents object

    //var newArtist = TMArtistObject;

    // iterate through objects grabbing information we need
    for (var i = 0; i < events.page.totalElements; i++) {

        //We found events so populate it.
        // TODO: One more loop needed to recurse through warm up bands
        var TMArtistObject = {
            eventName: "",
            artistName: "",
            allArtists: [],
            spanMultipleDays: "",
            eventDate: "",
            eventTime: "",
            eventID: "",
            onSaleStatus: "",
            venueName: "",
            venueStreetAddress1: "",
            venueCity: "",
            venueState: "",
            venueZipCode: "",
            artistURL: [],
            genre: "",
        };

        // grab warm up bands
        var newArtist = TMArtistObject;
        var arrayLength
        TMEvents.push(newArtist);

        // if (events._embedded.events[i]._embedded.attractions.length)
        //     arrayLength = events._embedded.events[i]._embedded.attractions.length;
        // else
        //     arrayLength = o;

        // //console.log(events._embedded.events[i]._embedded.attractions[0].name);
        // if (arrayLength) {
        //     for (var x = 0; x < arrayLength; x++) {
        //         var attractions = events._embedded.events[i]._embedded.attractions[x].name;
        //         console.log(attractions);
        //         TMEvents[i].allArtists.push(attractions[x].name);
        //     }
        // }
        // else {
        //     TMEvents[i].allArtists.push(events._embedded.events[i].name);
        // }

        TMEvents[i].eventName = events._embedded.events[i].name;
        TMEvents[i].artistName = events._embedded.events[i].name;
        TMEvents[i].spanMultipleDays = events._embedded.events[i].dates.spanMultipleDays;
        TMEvents[i].eventDate = events._embedded.events[i].dates.start.localDate;
        TMEvents[i].eventTime = events._embedded.events[i].dates.start.localTime;
        TMEvents[i].onSaleStatus = events._embedded.events[i].dates.status.code;
        TMEvents[i].eventID = events._embedded.events[i].id;
        TMEvents[i].venueName = events._embedded.events[i]._embedded.venues[0].name;
        TMEvents[i].venueStreetAddress1 = events._embedded.events[i]._embedded.venues[0].address.line1;
        TMEvents[i].venueCity = events._embedded.events[i]._embedded.venues[0].city;
        TMEvents[i].venueState = events._embedded.events[i]._embedded.venues[0].state.stateCode;
        TMEvents[i].venueZipCode = events._embedded.events[i]._embedded.venues[0].postalCode;
        TMEvents[i].genre = events._embedded.events[i].classifications[0].genre.name;
        for (let n = 0; n < events._embedded.events[i].images.length; n++) {
            TMEvents[i].artistURL.push(events._embedded.events[i].images[n].url);
        }
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// renderTMEvents() - primary API into TM Events API
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function renderTMEvents(startDate, startTime, endDate, endTime, city, state, postalCode, countryCode, radius, maxEvents) {

    // We are expecting a valid date and city or else stop....TODO: return a valid error code
    if ((!startDate) || (!endDate) || (!city)) {
        alert("Fatal Error - no date  or city passed into renderTMEvents");
    }

    // Initialize time to 24 hours if not passed in
    if (!startTime) {
        startTime = "00:00:00";
    }

    if (!endTime) {
        endTime = "23:59:59";
    }

    if (!radius) {
        radius = 150;

    }

    // maximum number of events we want returned from Ticket Master event query
    if (!maxEvents) {
        maxEvents = "30";
    }

    // construct the TM localStartDateTime needed for the search event TM API
    var localStartDateTime = "&localStartDateTime=" + startDate + "T" + startTime + "," + endDate + "T" + endTime;
    //var endDateTime = "&localStartEndDateTime=" + endDate + "T" + endTime + "Z";

    // always looking for music events for this app.
    var classificationId = "&classificationId=KZFzniwnSyZfZ7v7nJ";

    //URL into TM API'
    var url = "https://app.ticketmaster.com/discovery/v2/events.json?size=" + maxEvents + "&apikey=uFdFU8rGqFvKCkO5Jurt2VUNq9H1Wcsx";
    var queryString = url + localStartDateTime + classificationId + countryCode;

    // construct the appropriate parameters needed for TM
    if (city) {
        queryString = queryString + "&city=" + city;
    }
    if (radius) {
        queryString = queryString + "&radius=" + radius;
    }
    if (postalCode) {
        queryString = queryString + "&postalCode=" + postalCode;
    }
    if (state) {
        queryString = queryString + "&state=" + state;
    }

    // console log the queryString
    console.log(queryString);

    // make the AJAX call into TM
    $.ajax({
        type: "GET",
        url: queryString,
        async: true,
        dataType: "json",
        success: function (response) {
            // we are here if the AJAX call is successful
            console.log(response);
            createEvents(response);
            console.log(TMEvents);
        },
        error: function (xhr, status, err) {
            // This time, we do not end up here!
            // TODO: return an error code for now just setTMEvent to empty
            TMEvents = "";
        }
    });

    // return the array of performing artists to the calling applicaition
    return TMEvents;
};

if (debug) {
    // SET "debug = false" when running this API in production. Used only to debug the function
    // renderTMEvents() by setting up appropriate calling params and then calling the renderTMEvent
    // Test the API
    var startDate = "2019-03-20"
    var startTime = "00:00:00";

    var endDate = "2019-03-20"
    var endTime = "23:59:59";

    var postalCode = "";
    var city = "Seattle";
    var radius = 150;
    var state = "";
    var countryCode = "&countryCode=US";
    var maxEvents = 20;

    //TODO: moment.js is available to grab todays date if not passed in...
    renderTMEvents(startDate, startTime, endDate, endTime, city, state, postalCode, countryCode, radius, maxEvents);
};
