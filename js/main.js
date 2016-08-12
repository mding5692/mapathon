
/** NOTE THAT VANILLA/PURE JAVASCRIPT IS USED HERE INSTEAD OF JQUERY TO MAKE SURE THE MAP CAN BE USED PRETTY MUCH EVERYWHERE THAT ALLOWS JAVASCRIPT **/
    
    /*** Global variables ***/
    var bounds = new google.maps.LatLngBounds(); // defines the bounds of the map
    var geocoder = new google.maps.Geocoder(); // Used to point out locations on google maps with a physical address
    var map; // To reference the map
    var markers = new Array(); // to refer to the array of markers
    var infowindows = new Array(); // to refer to the infowindows attached to the markers
    var openedInfoWindow = ""; // to refer to the infowindow that is open right now
    var detailsForEachHackathon = new Array(); // to contain the objects needed for each hackathon, remove this and geocoding creates a bug
    var x = 0; // for geocoding purposes as they need a global variable to refer to the index of the array
    var markerIcon = "https://cloud.githubusercontent.com/assets/9067177/8510467/e281c302-22b3-11e5-8ea4-08b55c12845a.png"; // The standard icon for the marker
    var numOfAlertsAbout2014 = 0; // recording this to not annoy user
   
    /*** Functions ***/
    
                    /******* UI and Animation functions *******/

    /**
     * Pops out opening screen with instructions on how to use it
     * Takes in the div to be used to store openingScreen and the map its for
     **/ 
    function InstructionScreen(openScreenDiv,map) {
      // creates a div HTML element to hold the UI
      var openScreenUI = document.createElement("div");
      openScreenUI.style.marginLeft = "2em";
      openScreenUI.style.backgroundColor = '#8e44ad';
      openScreenUI.style.border = '2px solid #333';
      openScreenUI.style.borderRadius = '5px';
      openScreenUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
      openScreenUI.style.marginBottom = '10em';
      openScreenUI.style.textAlign = 'center';
      openScreenUI.style.width = '100%';
      openScreenDiv.appendChild(openScreenUI);

      // creates another div inside to hold text
      var openingScreenText = document.createElement('div');
      openingScreenText.style.color = '#fff';
      openingScreenText.style.fontSize = '14px';
      openingScreenText.style.lineHeight = '20px';
      openingScreenText.style.paddingLeft = '10em';
      openingScreenText.style.paddingRight = '10em';
      openingScreenText.innerHTML = " <b> Instructions : </b> Choose the year and the month at the bottom and get a display of the hackathons around the world at that time.";
      openScreenUI.appendChild(openingScreenText);

    }
    /**
     * For fading in animation on the buttons
     **/
    function fadeIn(element) {
      var op = 0.1;  // initial opacity
      element.style.display = 'block';
      var timer = setInterval(function () {
        if (op >= 1){
            clearInterval(timer);
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op += op * 0.05;
    }, 10);
  }

    /**
     * For fading out animation on the buttons
     **/
    function fadeOut(element) {
      var op = 1;  // initial opacity
      var timer = setInterval(function () {
          if (op <= 0.1){
              clearInterval(timer);
              element.style.display = 'none';
          }
          element.style.opacity = op;
          element.style.filter = 'alpha(opacity=' + op * 100 + ")";
          op -= op * 0.1;
    }, 50);
  }
                        
                    /****** Data and Map functions ******/

    /**
     * Returns the year chosen by user with the select html element 
     **/
    function getYear() {
        var yearSelect = document.getElementById('yearSelect');
        var chosenYear = yearSelect.options[yearSelect.selectedIndex].value;      
        return chosenYear;
    }
        
    /**
     * Returns the year chosen by user with the select html element 
     **/
    function getMonth() {
        var monthSelect = document.getElementById('monthSelect');
        var chosenMonth = monthSelect.options[monthSelect.selectedIndex].value;      
        return chosenMonth;
    }
        
    /**
     * Take a month in integer format and converts it to string
     **/
    function convertIntToMonth(monthToConvert) {
        var monthAsInt = parseInt(monthToConvert) - 1;
        var month = new Array();
        month[0] = "January";
        month[1] = "February";
        month[2] = "March";
        month[3] = "April";
        month[4] = "May";
        month[5] = "June";
        month[6] = "July";
        month[7] = "August";
        month[8] = "September";
        month[9] = "October";
        month[10] = "November";
        month[11] = "December";
        var convertedMonth = month[monthAsInt];
        return convertedMonth;
    }
        
    /**
     * Gets the year and month chosen and outputs marker on the map
     * Creates an error if there is no year or month
     **/
    function getMarkerFromChosenTime() {
        var url = "";
        var chosenYear = getYear();
        var chosenMonth = getMonth();
        if (chosenYear && chosenMonth) {
             url = createURLWhenTimeIsSpecifiedForHackalistAPI(chosenYear,chosenMonth);
             var JSONAboutHackathon = grabJSONFromHackalist(url);
             storeJSONInDetailsAboutHackathonArray(JSONAboutHackathon, chosenMonth);
             createMarkersFromHackathonDetails();
        } else {
            alert("Year and Month hasn't been selected properly, try again!");
        }
    }

    /**
     * Creates url depending on which month is pressed
     * Takes in the year and month specified
     * Returns the URL
     **/
    function createURLWhenTimeIsSpecifiedForHackalistAPI(year,month) {
      yearStr = year.toString();
      monthStr = month.toString();
      var URL = "http://www.hackalist.org/api/1.0/" + yearStr + "/" + monthStr + ".json";
      return URL;
    }
    
    /**
     * Gets the JSON data from Hackalist API
     * Returns as JSON
     **/
    function grabJSONFromHackalist(hackalistURL) {
      var JSONrequest = new XMLHttpRequest();
      JSONrequest.open("GET", hackalistURL, false);
      JSONrequest.send();
      JSONresponse = JSONrequest.responseText;
      var JSONToBeReturned = JSON.parse(JSONresponse);
      return JSONToBeReturned;
    }

    /**
     * Stores JSON object containing information about each hackathon that is loaded and then pushes it to the
     * detailsForEachHackathon array
     * @param  {JSON} JSONInput The JSON to be used to grab data from
     * @param  {int} month     The month this JSON is for
     */
    function storeJSONInDetailsAboutHackathonArray(JSONInput, month) {
      var givenMonth = convertIntToMonth(month);
      var numOfHackathonsInThatMonth = JSONInput[givenMonth].length;
      for (var i = 0; i < numOfHackathonsInThatMonth; i++) {
          // grabs the data from Hackalist API and assigns them to variables
          var cityName = JSONInput[givenMonth][i].city;
          var hackathonName = JSONInput[givenMonth][i].title;
          var hackathonHost = JSONInput[givenMonth][i].host;
          var hackathonUrl = JSONInput[givenMonth][i].url;
          var startDate = JSONInput[givenMonth][i].startDate;
          var endDate = JSONInput[givenMonth][i].endDate;
          // creates an object to store the details of the hackathon as geocoder screws things up
          var hackathonDetails = {
            city: cityName,
            eventName: hackathonName,
            organizers:hackathonHost,
            url:hackathonUrl,
            begin:startDate,
            end:endDate
          };
      detailsForEachHackathon.push(hackathonDetails);
    }
  } 
    /**
     * Creates markers on the map using an array of hackathon information 
     */
    function createMarkersFromHackathonDetails() {
      var bounds = new google.maps.LatLngBounds();
      for (var i = 0; i < detailsForEachHackathon.length; i++) {
        addDetailsToMarkers(detailsForEachHackathon[i]);
      }
    }
    /**
     * [Grabs the info about a hackathon from a JS object and then geocodes it, prints an error if geocoding fails]
     * @param {JSON object} hackathonProperties [Carries information about a specific hackathon]
     */
    function addDetailsToMarkers(hackathonProperties) {
      var cityName = (hackathonProperties['city']);
      var givenAddress = JSON.stringify(cityName);
      var hackathonName = (hackathonProperties['eventName']);
      var host = (hackathonProperties['organizers']);
      var url = (hackathonProperties['url']);
      var start = (hackathonProperties['begin']);
      var end = (hackathonProperties['end']);

      geocoder.geocode( { 'address': givenAddress}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          var marker = new google.maps.Marker({
                map: map,
                icon: markerIcon,
                position: results[0].geometry.location,
                clickable: true
              });
          bounds.extend(marker.getPosition());
          var contentString = "<div class='infowindow'> <b> Name: </b> " + hackathonName + "<br> <b> Host </b>: " + host + "<br> <b>Address: </b>" + cityName + "<br> <b> Website: </b><a href=" + url + ">" + url +"</a>" + "<br> <b> Starting date : </b>" + start + "<br> <b> Ending date : </b>" + end + "</div>";
          openInfoWindow(marker,contentString);
          markers.push(marker);
          map.fitBounds(bounds);
        } else {
            console.error("geocode failed: " + status);
        }
    });
  }
    /**
     * Creates an infowindow for each marker and then sets the content to that infowindow
     * @param  {google maps marker} marker The marker to attach the infowindow to
     * @param  {HTML string} infoWindowContent The content to be used as the infowindow's content
     */
    function openInfoWindow(marker, infoWindowContent) {
      var infowindow = new google.maps.InfoWindow({
        content: '<div class="infowindow">' + infoWindowContent + '</div>'
      });
      infowindows.push(infowindow);
      google.maps.event.addListener(marker, 'click', function () {

        if (openedInfoWindow != "") {
            openedInfoWindow.close();
        }
        infowindow.open(map, marker);
        openedInfoWindow = infowindow;
      });
    }
    /**
     * Clear previously selected markers and infowindows if there are any
     **/
    function clearAllMarkersAndInfo() {
      geocoder = new google.maps.Geocoder();
      detailsForEachHackathon = new Array();
    	for (var j = 0; j < markers.length; j++) {
			markers[j].setMap(null);
			if (infowindows[j]) {
				infowindows[j].close();
				infowindows.pop();
			}
		}
  }

    /**
     * Creates the map; see this as the main function for the UI
     **/
    function initialize() {
     // below is configurable content for the map
      var mapOptions = {
        zoom: 4,
        minZoom: 3,
        center: {lat: -34.397, lng: 150.644},
        styles: [{"featureType":"all","elementType":"all","stylers":[{"invert_lightness":true},{"saturation":10},{"lightness":30},{"gamma":0.5},{"hue":"#435158"}]}],
        disableDefaultUI: true
      }; 
      map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
      
      /** Sets up the UI and instructions **/

      // creates the instructions for user to read
      var instructionScreenDiv = document.createElement('div');
      var instructionScreen = new InstructionScreen(instructionScreenDiv, map);
      instructionScreenDiv.index = 1;
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(instructionScreenDiv);

      // closes the instructions after submit button is pressed and loads selections
      var btn = document.getElementById("btn");
      google.maps.event.addDomListener(btn, 'click', function() {
        fadeOut(instructionScreenDiv);
      });  
    }
      google.maps.event.addDomListener(window, 'load', initialize);
