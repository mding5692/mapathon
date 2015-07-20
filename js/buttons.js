/** For the javascript on the buttons **/
    
    /**
     * [Checks to see if 2014 is chosen, if it is then take out all the monthes before August as its not available]
     */
      function hideIf2014IsChosen() {
        var checkIf2014IsChosen = getYear();
        var arrayOfMonthesBeforeAugust2014 = document.getElementsByClassName("hideIf2014");
        if (checkIf2014IsChosen === '2014') {
          // just to not annoy the user with way too many alerts
          if (numOfAlertsAbout2014 === 0) {
          alert("Hackalist API doesn't have hackathons listed before August 2014, so they've been removed");
          }
          // removes those options from selection
          for (var i = 0; i < arrayOfMonthesBeforeAugust2014.length; i++) {
            arrayOfMonthesBeforeAugust2014[i].style.display = "none";
          }
          numOfAlertsAbout2014++;
        } else {
          // ensures for 2015 that they can choose monthes before August
          for (var i = 0; i < arrayOfMonthesBeforeAugust2014.length; i++) {
            arrayOfMonthesBeforeAugust2014[i].style.display = "inline-block";
          }
        } 
      }
