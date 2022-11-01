import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import $ from 'jquery';


class City extends React.Component {

  render() {
    let cityTiles = this.props.cityTiles;
    const tilesHtml = cityTiles.map((item, index) => {

      return (
        // <div key={index} className="city-tile" onClick={() => this.props.handleClickCityTile(index)}>
        //   Tile {index} is {item!==null ? item.clue : "?"}
        // </div>
        <img  key={index} src={"images/" + item.image + ".png"} className="city-tile-image" alt="city tile" onClick={() => this.props.handleClickCityTile(index)} />
      );
    });

    return <div>{tilesHtml}</div>;
  }
}

var FillerAnimation = function(id, styles, animationSequence) {
  let self = this;

  self.animationSequence = animationSequence;
  self.id = id;  
  self.styles = styles;
  self.currentFrame = -1; // because the nextFrame is going to increment
  self.timeoutId = -1; // -1 means we haven't started yet, 0 means we've been cancelled

  self.cancel = function() {
    
    console.log("about to cancel filler animations with timeoutId of " + self.timeoutId)
    clearTimeout(self.timeoutId);
    self.timeoutId = 0; // probably don't need to do this
  }

  self.nextFrame = function() {
    console.log("in next frame")
    if(self.timeoutId == 0) {
      return;
    }
    self.currentFrame++;
    if(self.currentFrame === self.animationSequence.length) {
      self.currentFrame = 0;
    }
    $("#"+self.id).attr("src", self.animationSequence[self.currentFrame].image);
    self.timeoutId = setTimeout(self.nextFrame,self.animationSequence[self.currentFrame].pause)
  }
  
  self.currentImage = function() {
    return self.animationSequence[self.currentFrame].image;
  }

  self.nextFrame();
}

class Game extends React.Component {

  personImageIndex = 0; // tracks what person image index we're currently up to, so rather than randomly selecting an image we can iterate through them
  fillerAnimations = [];

  constructor(props) {
    
    /*
    Possible clue types
    - giant items (e.g. carrot)
    - town motto
    - famous building
    - close to X
    - just north/south/east/west of [thing/place]
    - famous person comes from here
    - rhymes with 
    - produces X
    - famous for
    */

    // all the possible locations along with the clues for each of them
    const locations = [
      {
        name : "Auckland",
        clues : [ "They said the Maori name of where they were going was Tāmaki Makaurau.", "I think they wanted to see the tallest building in New Zealand.", "They mentioned they were going to see the Hauraki Gulf and the Waitematā Harbour." ]
      },
      {
        name : "Arrowtown",
        clues : [ "They wanted to see all the buildings from the gold rush days", "I heard them say something about checking out the Arrow river.","I think Queenstown was nearby." ]
      },
      {
        name : "Ashurst",
        clues : [ "I heard it was at one end of the Manawatu Gorge.", "They said something about getting a good view of a wind farm.","I think it was super close to Palmerston North." ]
      },
      {
        name : "Balclutha",
        clues : [ "I heard they were heading too the largest town in South Otago.", "They said something about going halfway between Dunedin and Gore.","Apparently it's a Scottish name, the English translation is 'Town on the Clyde'." ]
      },
      {
        name : "Blenheim",
        clues : [ "Apparently where they're going has an airshow every couple of years with fighters from World War One.", "They said they were going to a region well know for its wine.", "I heard them mention they were hoping to see the salt works that makes 50% of New Zealand's salt." ]
      },
      {
        name : "Bluff",
        clues : [ "I heard they were heading to the southern most town of mainland NZ.", "They said the place they were going was a long time ago called Campbelltown.","They had wanted to see the paua house and were sad that it's no longer there." ]
      },
      {
        name : "Bulls",
        clues : [ "Sounds like the place they are going to likes to make puns with the name of the town.", "They said it was where state highway 1 and 3 meet.","I overheard them say there was an airforce base close by to where they were going." ]
      },
      {
        name : "Cambridge",
        clues : [ "Sounds like the place they're going to is well known for breeding horses.", "They said the place they're heading too is called 'The Town of Trees & Champions.", "I do know that where they're going is on the banks of the Waikato river." ]
      },
      {
        name : "Christchurch",
        clues : [ "They were heading to the second largest city in NZ.", "They said they wanted to check out the Avon river.","I think they mentioned visiting Cathedral Square." ]
      },
      {
        name : "Coromandel",
        clues : [ "Where they're heading use to be a big port for the gold mining and Kauri industry.", "They said they the name of the town is the same as the name of the district, and the peninsula it is on.","I heard them say something about visiting a mussel farm." ]
      },
      {
        name : "Dunedin",
        clues : [ "They said that during the gold rush this was the biggest urban area in NZ.", "The place they're heading too has a nickname of 'Edinburgh of the South'.","They mentioned they were keen to see Larnach Castle.", "I heard them say they wanted to visit the Octagon." ]
      },
      {
        name : "Gisborne",
        clues : [ "They said something about wishing they could go to the Rhythm & Vines music festival.", "They said they're going to visit Kati beach where James Cook made his first landing in New Zealand.","They said that where they're heading is sometimes called the City of Rivers." ]
      },
      {
        name : "Greymouth",
        clues : [ "They mentioned they were heading to the largest town in the West Coast region.", "They were hoping the weather was clear so they would get a view of Aoraki (Mount Cook).", "Apparently where they were heading is at the mouth of the Grey river." ]
      },
      {
        name : "Hamilton",
        clues : [ "They wanted to visit the longest river in New Zealand.", "They said something about the place being the largest city in the Waikato.", "Apparently the Maori name of where they're going is Kirikirioa.", "They said they were going to 'The Tron', which must be a nick name?" ]
      },
      {
        name : "Hastings",
        clues : [ "They said they were heading to one of the Bay Cities.", "Apparently where they're going is sometimes called the fruit bowl of New Zealand.", "I think they were heading to an inland place." ]
      },
      {
        name : "Hokitika",
        clues : [ "They wanted to visit a big wheelbarrow - made no sense.", "I think they were visiting the largest town in Westland." ]
      },
      {
        name : "Huntly",
        clues : [ "They mentioned they were going to visit an old DEKA sign.", "I know they were heading somewhere you can see an old power station with two giant chimneys.", "Apparently the area they're going to has a long history of coal mining." ]
      },
      {
        name : "Invercargill",
        clues : [ "They said they're heading to the westernmost and southernmost city in New Zealand.", "Many of the street names where they're going are named after rivers in Scotland.", "I heard the place they're heading to has been called The City of Water and Light." ]
      },
      {
        name : "Kaikōura",
        clues : [ "They said they wanted to get a photo with a big crayfish.", "They hoped to see some whales.", "I over heard them say they were going to be on State Highway 1." ]
      },
      {
        name : "Kawakawa",
        clues : [ "They said the place they're going was named after a shrub.", "They said they're heading to a place where trains can go down the main street and it's known as Train Town.", "They said there is a famout public toilet where they're going, designed by a famous Austrian artist." ]
      },
      {
        name : "Kerikeri",
        clues : [ "They mentioned they were going to the largest town in Northland.", "Where they're going has sometimes been called the Cradle of the Nation because it was where the first mission station was built.", "The local slogan for where they're going is 'It's So Nice They Named It Twice'" ]
      },
      {
        name : "Lower Hutt",
        clues : [ "The place they were going to is in a valley with another city with a really similar name.", "They told me name of the place they're going to is similar to the name of a star wars character.", "Apparently the boundaries of where they're going includes Matiu / Somes Island in the harbor." ]
      },
      {
        name : "Masterton",
        clues : [ "They mentioned they were going to see Queen Elizabeth park and maybe ride on the miniture railway.", "They said they hoped to one day see the Golden Shears sheep shearing competition.", "I heard they were heading to the largest town in the Wairapa region." ]
      },
      {
        name : "Mosgiel",
        clues : [ "They wanted a selfy by the big letters that spell out the name of the town.", "They said they were going to 'The pearl of the plain'.", "They were thinking of also visiting Dunedin, which is close by." ]
      },
      {
        name : "Napier",
        clues : [ "They said that where they're going is sometimes called 'Nice of the Pacific'.", "Apparently where they're going is known as one of the Bay Cities, along with it's close neighbour." , "They said they were going to see the National Aquarium of New Zealand." ]
      },
      {
        name : "Nelson",
        clues : [ "They said they were heading to the oldest city in the South Island.", "They said they're going to where the World of Wearable Arts started.", "I heard them say they were hading to a place know as the 'Top of the South'." ]
      },
      {
        name : "New Plymouth",
        clues : [ "They said the were heading to where TSB Bank is based.", "They mentioned they wanted to see a chimney? Apparently it's the second tallest man-made structure in New Zealand.", "They said they would like to see WOMAD or the Festival of Lights one day." ]
      },
      {
        name : "Ohakune",
        clues : [ "They mentioned going to visit a big carrot?", "I heard them say something about popping in to visit Mount Ruapehu." ]
      },
      {
        name : "Palmerston North",
        clues : [ "They said they were heading to where Massey University was based.", "I heard them say they were going to an inland place, near the banks of the Manawatu River.", "Apparently the edges of where they're going extends right up to the Manawatu Gorge." ]
      },
      {
        name : "Paeroa",
        clues : [ "They giggled a lot about getting a photo of a big softdrink, it was weird.", "Pretty sure they were heading to the Hauraki District." ]
      },
      {
        name : "Queenstown",
        clues : [ "I heard them say the place they're going has great skiing, snowboarding and even some jet boating.", "Apparently the place they're going is on the edge of a lake.", "Where they're going is considered a resort town with a lot of adventure tourism activites." ]
      },
      {
        name : "Rotorua",
        clues : [ "They were heading to the second largest city in the Bay of Plenty region.", "They joked that they were heading to vegas.. but in New Zealand?!", "I heard them say something about looking at some hot mud?" ]
      },
      {
        name : "Taihape",
        clues : [ "They made a joke about wearing a big gumboot. I didn't get it", "I know they were travelling on State Highway 1." ]
      },
      {
        name : "Taupō",
        clues : [ "They told me they were going to pop in and visit Tongariro National Park to the south.", "They were heading to the biggest lake in New Zealand.","I heard them say they wanted to see the Huka Falls." ]
      },
      {
        name : "Tauranga",
        clues : [ "They said that the port where they're going exports the most tonnage in New Zealand.", "They mentioned they were hoping to climb Mount Maunganui.", "I heard them say they were heading to the fastest growning city in New Zealand." ]
      },
      {
        name : "Timaru",
        clues : [ "Where they're going was originally used as a whaling station, then was two towns called Government Town and Rhodestorn before they were merged.", "I heard them say the place has a junction for state highway 8 which heads to Mount Cook/Aoraki and Queenstown", "They mentioned she was heading to South Canterbury." ]
      },
      {
        name : "Upper Hutt",
        clues : [ "The place they were going to is in the north of a valley that also has another city with a really similar name.", "They told me name of the place they're going to is similar to the name of a star wars character.", "Apparently the place they are heading too includes some of the Remutaka ranges and almost reaches the Kapiti Coast." ]
      },
      {
        name : "Waitomo",
        clues : [ "They said they were going to see glow worms in some big caves.", "I heard them talking about visiting a really big apple. Sounded tasty." ]
      },
      {
        name : "Wellington",
        clues : [ "They said they were hoping to see Te Papa.", "I heard them say the Maori name of where they are going is Pōneke.", "Apparently they are heading to the place often considered the windiest city in the world!" ]
      },
      {
        name : "Whanganui",
        clues : [ "They said where they're going can be spelt two different ways; sometimes with an 'h' in it and sometimes without.", "They said the place they're going is named the same as the river it is next too.", "I heard them say on a fine day you can see both Mount Ruapehu and Mount Taranaki from Durie Hill." ]
      },
      {
        name : "Whangarei",
        clues : [ "They said they were heading to the northernmost city in New Zealand.", "Apparently the place they're heading is named the same as the harbour it is in.", "They mentioned the place they were heading to was sometimes called 'The Rei'" ]
      }
    ];

    // possible non-clue responses that shop keepers or citizens can make
    const possibleResponses = {
      shop : [
        "This isn't a library .. that answers questions! Buy something!", 
        "We have a great sale on toilet paper at the moment!",
        "I don't know, but would you like an ice cream?",
        "Sorry, but the privacy of my potential customers is of the utmost concern.",
        "Sorry, my shift has just started, I don't know what's going on.",
        "K-bars are back, only $1!",
        "Does this look like an 'ask questions dairy' or a 'buy things dairy'?",
        "I've got my eye on you.",
        "When I was growing up I wanted to be an actor.",
        "I don't even like capitalism.",
        "Not sure, but I'll sell you 4 loo rolls for the price of 3!",
        "Just put some pies into the warmer, fresh from freezer if you're interested?",
        "Hello discerning customer, can I interest you in a pie?",
      ],
      citizen : [
        "You look like a cop. I don't talk to cops.", 
        "This seems like a 'stranger danger' situation",
        "Is this for Fair Go or something?",
        "You look like my buddy Clive, are you related?",
        "Livin' the dream eh?",
        "I don't know you!",
        "G'day!",
        "You seen a small black and white dog around here anywhere?",
        "No. Do you want to talk about rugby instead?",
        "Check with Mikey in the dairy, he knows everything around here.",
        "Not my business mate.",
        "Sorry mate, do I look a police surveillance van to you?"
      ] 
    }

    const possibleFillerAnimations = [
      {
        name : "lamppost",
        sequence : [
          { image : "images\\lamp-unlit.png", pause : "5000" },
          { image : "images\\lamp-lit.png", pause : "150" },
          { image : "images\\lamp-unlit.png", pause : "150" },
          { image : "images\\lamp-lit.png", pause : "150" },
          { image : "images\\lamp-unlit.png", pause : "150" },
          { image : "images\\lamp-lit.png", pause : "150" },
          { image : "images\\lamp-unlit.png", pause : "150" },
          { image : "images\\lamp-lit.png", pause : "10000" },
        ],
        possiblePositions : [
          { left :"24%", top: "5%" },
          { left: "57%", top: "5%" },
          { left :"24%", top: "38%" },
          { left: "57%", top: "38%" },
          { left :"24%", top: "72%" },
          { left: "57%", top: "72%" },
        ]
      },
      {
        name : "catCircle",
        sequence : [
          { image : "images\\cat circle 1.png", pause : "5000" },
          { image : "images\\cat circle 2.png", pause : "100" },
          { image : "images\\cat circle 3.png", pause : "100" },
          { image : "images\\cat circle 4.png", pause : "100" },
          { image : "images\\cat circle 5.png", pause : "100" },
          { image : "images\\cat circle 6.png", pause : "100" },
          { image : "images\\cat circle 1.png", pause : "10000" }
        ],
        possiblePositions : [
          { left :"24%", top: "5%" },
          { left: "57%", top: "5%" },
          { left :"24%", top: "38%" },
          { left: "57%", top: "38%" },
          { left :"24%", top: "72%" },
          { left: "57%", top: "72%" },
        ]
      },
      {
        name : "birdCircle",
        sequence : [
          { image : "images\\bird circle 1.png", pause : "5000" },
          { image : "images\\bird circle 2.png", pause : "150" },
          { image : "images\\bird circle 3.png", pause : "150" },
          { image : "images\\bird circle 4.png", pause : "150" },
          { image : "images\\bird circle 5.png", pause : "150" },
          { image : "images\\bird circle 6.png", pause : "150" },
          { image : "images\\bird circle 7.png", pause : "150" },
          { image : "images\\bird circle 8.png", pause : "150" },
          { image : "images\\bird circle 1.png", pause : "1000" }
        ],
        possiblePositions : [
          { left :"24%", top: "5%" },
          { left: "57%", top: "5%" },
          { left :"24%", top: "38%" },
          { left: "57%", top: "38%" },
          { left :"24%", top: "72%" },
          { left: "57%", top: "72%" },
        ]
      }
    ]

    super(props);

    // how many different images of each type do we have? this is used to pick random images
    let imageCounts = {
      shop : 5,
      citizen : 5
    };



    // an object to track how the player is doing
    let stats = {
      totalRightCount : 0,
      totalWrongCount : 0,
      currentRightStreak : 0,
      currentLevel : 1                      // track what level they're on; makes it easier/harder
    }

    this.state = {
      locations : locations,                // all the potential locations that can be travelled too
      stats: stats,                         // records the players progression
      possibleResponses: possibleResponses, // all the potential non-clue responses that can be made
      possibleFillerAnimations: possibleFillerAnimations,
      currentLocation : null,               // where the user currently is located
      lastSeenLocation : null,              // where we last saw some clues
      nextLocation : null,                  // the location the user is tring to find
      possibleChoices : [],                 // a collection of locations that can currently be travelled to; changes every turn
      cityTiles : [ Array(9).fill(null) ],  // a collection of objects that describe the current city details - always 9 of them
      displayCityTile : null,               // the city tile that the user has clicked on, wanting to get a clue
      displayClue : false,                  // a flag indicating if the dialog is open showing a clue
      displayedClue : "",                   // the text of the clue to display
      imageCounts : imageCounts,            // an object that tells us how many items there are in each type of image/city tile
      locationHistory : [],                 // tracks where we've been so that we can go back
      showIntroduction : true,              // flag controlling whether the intro screen is shown
      showCompletion : false,               // flag controlling whether the completion screen is shown
    }
    
  }

  componentDidMount() {
    // setup the image index for our people - this indicates where we will start getting
    // our citizen images from the array
    let imageCount = this.state.imageCounts["citizen"];
    this.personImageIndex = randomIntFromInterval(1, imageCount);

    let locations = this.state.locations;

    var currentLocation = this.getRandomLocation(locations);
    var nextLocation = this.getNextLocation(currentLocation, locations);
    let possibleChoiceCount = this.decideHowManyPossibleChoicesToShow(1);

    var possibleChoices = this.getPossibleChoices(currentLocation, nextLocation, locations, possibleChoiceCount-1);

    this.setState( 
      { 
        cityTiles : this.createCityTiles(nextLocation),
        currentLocation : currentLocation,
        lastSeenLocation : currentLocation,
        nextLocation : nextLocation,
        possibleChoices : possibleChoices
      });
      this.createHistoryFromCurrent(currentLocation, currentLocation, nextLocation, possibleChoices);

  }

  // method ot check if the game has been completed
  checkForCompletion(currentLevel) {
    // if you get to a certain level then you're a winner
    if(currentLevel == 5) {
      this.setState({ showCompletion : true });
    }
  }

  // method to see if we need to go up a level
  checkForLevelUp(currentRightStreak) {
    console.log("checking for level up, currentRightStreak is "+ currentRightStreak)
    // see if they've just got 3 (or a multiple of 3) right in a row
    if(currentRightStreak % 3 == 0) {
      // increase the level by one
      let stats = this.state.stats;
      stats.currentLevel++
      this.setState({ stats : stats });
      // see if the game is over
      this.checkForCompletion(stats.currentLevel)
      return stats.currentLevel;
    }
    return this.state.stats.currentLevel;
  }

  // this determines how many buttons of possible locations to travel to should be shown
  // the better the player is doing the more buttons show / which makes it harder
  decideHowManyPossibleChoicesToShow(currentLevel) {
    console.log("currentLevel is " + currentLevel)
    // if level 1 then show 3 options
    // level 2 show 4 options
    // level 3 show 5 options
    // etc

    return currentLevel + 2;

  }

  createHistoryFromCurrent(currentLocation, lastSeenLocation, nextLocation, possibleChoices) {

    let whereImAt = {
      currentLocation : currentLocation, 
      lastSeenLocation : lastSeenLocation,
      nextLocation : nextLocation,    
      possibleChoices : possibleChoices,   
    };
    let currentHistory = this.state.locationHistory;
    currentHistory.push(whereImAt);
    this.setState(
      {
        locationHistory : currentHistory
      }
    )
  }

  backtrackToLocation() {

    let locationHistory = this.state.locationHistory;
    locationHistory.pop(); // this is our currently location, throw it away!
    // now get our last location, but keep it in the history array
    let lastLocationHistory = locationHistory[locationHistory.length-1]; 

    this.setState({
      currentLocation : lastLocationHistory.currentLocation,
      lastSeenLocation : lastLocationHistory.currentLocation,
      nextLocation : lastLocationHistory.nextLocation,
      possibleChoices : lastLocationHistory.possibleChoices,
      cityTiles : this.createCityTiles(lastLocationHistory.nextLocation),
      locationHistory : locationHistory
    });
    return;
  }

  travelToLocation(travelToLocation) {

    let locations = this.state.locations;
    if(travelToLocation.name === this.state.nextLocation.name) {
      // they are moving to the correct place :)
      
      let currentRight = this.state.stats.currentRightStreak+1;

      let currentLevel = this.checkForLevelUp(currentRight);

      let possibleChoiceCount = this.decideHowManyPossibleChoicesToShow(currentLevel);

      var currentLocation = travelToLocation;
      var nextLocation = this.getNextLocation(currentLocation, locations);
      var possibleChoices = this.getPossibleChoices(currentLocation, nextLocation, locations, possibleChoiceCount - 1);

      this.setState({
        currentLocation : currentLocation,
        lastSeenLocation : currentLocation,
        nextLocation : nextLocation,
        possibleChoices : possibleChoices,
        cityTiles : this.createCityTiles(nextLocation),
        stats : { 
          currentRightStreak : currentRight, 
          totalRightCount : this.state.stats.totalRightCount+1,
          totalWrongCount : this.state.stats.totalWrongCount,
          currentLevel : this.state.stats.currentLevel
         }
      });

      this.createHistoryFromCurrent(currentLocation, currentLocation, nextLocation, possibleChoices);


    } else {

      // they are not moving to the correct place ...
      var currentLocation = travelToLocation;
      // however, they might have moved to the last known place, in which case we want to setup the clues again and
      // ensure that the location they are meant to go to is one of the possible choices
      let nextLocation = this.state.nextLocation;
      var possibleChoices = [];
      let possibleChoiceCount = this.decideHowManyPossibleChoicesToShow(1);
      let lastSeenLocation = this.state.lastSeenLocation;
      if(currentLocation.name === this.state.lastSeenLocation.name) {
        // next location has to be in the possible choices
        possibleChoices = this.getPossibleChoices(currentLocation, nextLocation, locations, possibleChoiceCount-1);
      } else {
        // pass null for the next location so we end up with 3 random possible locations - there is a chance
        // it will have the next location in it, but probably not
        possibleChoices = this.getPossibleChoices(currentLocation, null, locations, possibleChoiceCount);
      }

      let level = this.state.stats.currentLevel;
      if(level != 1) {
        level--;
      }

      this.setState({
        currentLocation : currentLocation,
        //lastSeenLocation : currentLocation, // this doesn't change, they're still in the same last seen location
        //nextLocation : nextLocation, // this doesn't change, they're still in a location we haven't gone too
        possibleChoices : possibleChoices,
        cityTiles : this.createCityTiles(nextLocation),
        stats : { 
          currentRightStreak : 0, 
          totalRightCount : this.state.stats.totalRightCount,
          totalWrongCount : this.state.stats.totalWrongCount + 1,
          currentLevel : level
        }
      });
      this.createHistoryFromCurrent(currentLocation, lastSeenLocation, nextLocation, possibleChoices);
    }
  }

  assignPersonDetails(personType) {

    if(!personType) {
      // make it 50/50 between shop keepers or citizens
      personType = randomIntFromInterval(0, 1) === 0 ? "shop" : "citizen";
    }

    let imageIndex = null;
    if(personType === 'citizen') {
      // for a person we're going to iterate through them rather than just getting a random one
      imageIndex = this.personImageIndex;
      
      imageIndex++;
      if(imageIndex > this.state.imageCounts[personType]) {
        imageIndex = 1;
      }
      this.personImageIndex = imageIndex;
    } else {
      // for shops just get a random image
      let imageCount = this.state.imageCounts[personType];
      imageIndex = randomIntFromInterval(1, imageCount); 
    }
 
    let helpfulPerson = {
      talkingTo: personType === "shop" ? "Shop keeper" : "Random citizen",
      image: personType + imageIndex
    }
    return helpfulPerson;
  }

  cancelAllFillerAnimations() {
    console.log("about to cancel all filler animations")
    // cancel any timeouts currently in action
    for(let i = 0; i < this.fillerAnimations.length; i++) {
      this.fillerAnimations[i].cancel();
    }
    // clear the array of filler animations so we can fill it again later
    this.fillerAnimations = [];
  }

  createCityTiles(nextLocation) {

    this.cancelAllFillerAnimations();

    // do we want multiple animations? do we want them just sometimes?
    // I don't know, lets just always put in one and see how it goes
    let randomAnimationIndex = randomIntFromInterval(0, this.state.possibleFillerAnimations.length - 1);
    let animation = this.state.possibleFillerAnimations[randomAnimationIndex];
    // animations can show in different positions, lets randomly pick one
    let positionIndex = randomIntFromInterval(0, animation.possiblePositions.length - 1);
    let position = animation.possiblePositions[positionIndex];

    let filterAnimation = new FillerAnimation("filler1", position, animation.sequence);
    this.fillerAnimations.push(filterAnimation);


    let cityTiles = Array(9).fill(null);
    // for each of our clues put them into a city tile
    if(nextLocation) {
      // it's possible that we will be somewhere that doesn't have access to the next location
      for(let i = 0; i < nextLocation.clues.length; i++) {
        var clueSet = false;
        while(!clueSet) {
          var cityIndex = randomIntFromInterval(0, 8);
          if(null === cityTiles[cityIndex]) {

            let person = this.assignPersonDetails();
            cityTiles[cityIndex] = {
              talkingTo: person.talkingTo,
              clue: nextLocation.clues[i],
              image: person.image
            };
            clueSet = true;
          }
        }
      }
    }
    // for our other, non-clue tiles, populate them with something
    for(let i =0; i < cityTiles.length; i++) {
      if(!cityTiles[i]) {
        // only do this if there is currently no data for this city tile
        var talkingTo = "Poop";
        var clue = "[stink]";
        var image = "poop";
        var rand = randomIntFromInterval(1, 100);
        if (rand < 2) {
          talkingTo = "Dog";
          clue = "Woof woof woof. Woof.";
          image = "dog"
        } else if (rand < 4) {
          talkingTo = "Tree";
          clue = "Rustle rustle.";
          image = "tree"
        } else if (rand < 6) {
          talkingTo = "Cow";
          clue = "Mooooooooooo .. Moo!";
          image = "cow"
        } else if (rand < 50) {
          let person = this.assignPersonDetails("shop");
          talkingTo = person.talkingTo;
          clue = this.getNonHelpfulResponse("shop");
          image = person.image
        } else if (rand < 90) {
          let person = this.assignPersonDetails("citizen");
          talkingTo = person.talkingTo;
          clue = this.getNonHelpfulResponse("citizen");
          image = person.image
        } else  {
          talkingTo = "You";
          clue = "[there's nothing here]";
          image = "nothing"
        }

        cityTiles[i] = {
          talkingTo: talkingTo,
          clue: clue,
          image: image
        };
      }
    }
    return cityTiles;
  }

  // get a random response that isn't a clue
  getNonHelpfulResponse(type) {
    let response = "";
    var rand = randomIntFromInterval(0, this.state.possibleResponses[type].length-1);
    response = this.state.possibleResponses[type][rand];
    return response;
  }

  // get a random location - used to get a starting location
  getRandomLocation(locations) {
    var rand = randomIntFromInterval(0, locations.length-1);
    return locations[rand];
  }

  // get a location by name from a collection of locations
  getLocationByName(name, locations) {
    for(let i = 0; i < locations.length; i++) {
      if(locations[i].name === name) {
        return locations[i];
      }
    }
  }

  // get the next location we want to find, it can't be the current location
  getNextLocation(currentLocation, locations) {
    // console.log("in getNextLocation")
    // console.log(locations)
    var nextLocationIndex = randomIntFromInterval(0, locations.length-1);
    var nextLocation = locations[nextLocationIndex];
    if(currentLocation.name === nextLocation.name) {
      nextLocation = this.getNextLocation(currentLocation, locations);
    }
    return nextLocation;
  }

  /* get a collection of possible next locations to travel too. They can't be the current location (you don't travel
    from a place to the same place). The next location has to be included in the list.
    currentLocation : where we currently are - cannot be in the returned list
    nextLocation    : where we should be going to next - needs to be in the returned list
    locations       : the collection of possible locations
    choiceCount     : how many possible locations we need to return - if you want 3 locations total then this should be two (because the nextLocation + 2 would be 3)
  */
  getPossibleChoices(currentLocation, nextLocation, locations, choiceCount) {
    var possibleChoices = [];
    while(possibleChoices.length < choiceCount) {
      var possibleChoice = null;
      var nextChoiceIndex = randomIntFromInterval(0, locations.length-1);
      possibleChoice = locations[nextChoiceIndex];
      if(possibleChoice.name !== currentLocation.name && (nextLocation===null || possibleChoice.name !== nextLocation.name)) {
        var duplicate = false;
        for(let i = 0; i <possibleChoices.length; i++) {
          if(possibleChoices[i].name === possibleChoice.name) {
            duplicate = true;
            break;
          }
        }
        if(!duplicate) {
          possibleChoices.push(possibleChoice);
        }
      }
    }
    if(nextLocation) {
      var insertIndex = randomIntFromInterval(0, 2);
      possibleChoices.splice(insertIndex,0,nextLocation);
    }
    return possibleChoices;
  }

  // just look at his name. glorious.
  handleClickCloseCloseDisplay() {
    // can't close a dialog until it has finshed being displayed
    //if(this.state.clueDisplayComplete) {
      this.setState({ displayClue : false });
    //}
  }

  handleClickCloseIntro() {
    this.setState({ showIntroduction : false });
  }

  handleClickBacktrack() {
    // don't allow if the clue is still open
    if(this.state.displayClue) return;


    this.backtrackToLocation();
    return;

    let history = this.state.history;
    //let lastPlace = history.splice(-1);
    let lastPlace = history.splice(history.length-1);
    this.travelToLocation(lastPlace[0], true);
  }

  handleClickTravelTo(name) {
    // if the intro is open then cancel this
    if(this.state.showIntroduction) return;
    // if the clue is open then close it
    if(this.state.displayClue) {
      this.setState({ displayClue : false });
    };

    let travelToThisLocation = this.getLocationByName(name, this.state.locations);
    this.travelToLocation(travelToThisLocation);
  }

  handleClickCityTile(index) {
    // don't allow if intro still open
    if(this.state.showIntroduction) return;
    // can't click a tile if the dialog is already open. We're not animals. We live in a society. There are rules.
    // close the currently opened clue
    if(this.state.displayClue) {
      this.handleClickCloseCloseDisplay(); // this function just has the best name. I can't beat this.
      return;
    }
    let clickedCityTileData = this.state.cityTiles[index];
    if(clickedCityTileData!==null) {
      this.setState({
        displayedClue : "",
        displayCityTile : clickedCityTileData,
        displayClue : true,
        clueDisplayComplete : false
      })
      this.doClueTyping(clickedCityTileData.clue, "", ".clue-text");
    } else {
      console.log("I DON'T THINK THIS SHOULD HAPPEN????!?!??!?!?!?!?!?!?!??!?!")
      this.setState({
        displayCityTile : clickedCityTileData,
        displayClue : true
      })
    }
  }

  // frankly, async state is bullshit, so we're not going to use it
  doClueTyping(clueToDisplay, doneSoFar, target) {
    if(doneSoFar.length > 1) {
      // the state is never updated on the first run through, so we only do this check after the first time
      // if the clue dialog has been closed then we want to stop doing this typing
      if(!this.state.displayClue) {
        return;
      }
    }
    let nextCharIndex = doneSoFar.length;
    if(nextCharIndex == clueToDisplay.length) {
      this.setState({ clueDisplayComplete : true })
      return;
    }
    let nextChar = clueToDisplay.charAt(nextCharIndex);
    doneSoFar = doneSoFar + nextChar;
    $(".clue-text").html( doneSoFar );
    // if the char is a fullstop then we're going to pause for a little bit
    let timeDelay = nextChar == "." ? "500" : "30";
    setTimeout(() => { this.doClueTyping(clueToDisplay, doneSoFar, target); }, timeDelay);
  }

  outputFinish() {
    if(!this.state.showCompletion) {
      return null;
    }

    return (
      <div className="completed">
        <span className="completed-text">
          <span className="completed-title">Nice job, you found Charlie Singh!</span>
          Wow you did it, go you!
          <br/><br/>
          This is how you did:<br/>
          Total right: <span className="stats-value">{this.state.stats.totalRightCount}</span><br/>
          Total wrong: <span className="stats-value">{this.state.stats.totalWrongCount}</span><br/>
          <br/><br/>
          Refresh the page to play again :)
        </span>
      </div>
    );
  }

  outputIntro() {
    if(!this.state.showIntroduction) {
      return null;
    }
    var introClose = <div className="close-intro" onClick={() => this.handleClickCloseIntro()}>X</div>

    return (
      <div className="introduction">
        <span className="introduction-text">
          <span className="intro-title">Where in NZ is Charlie Singh?</span>
          Your friend Charlie is somewhere in New Zealand and it's your job to find them. 
          <br/><br/>
          Explore where you are by clicking a shop or person to find clues to where Charlie has gone. 
          Some people might give you useful information, others ... not so much. 
          Once you think you know where they've gone, click the buttons at the bottom to travel to the new location. 
          If you get it wrong you can always click the button right at the bottom to travel back to your last location.
          <br/><br/>
          You'll have to get a few right in a row to catch up to Charlie, good luck!
          <br/><br/>
          When you're ready click the X in the top corner to close this introduction.
        </span>
        {introClose}
      </div>
    );
  }

  render() {

    var locationHistory = this.state.locationHistory;
    var lastLocationName = locationHistory.length > 1 ? locationHistory[locationHistory.length - 2].currentLocation.name : "";
    const locationHistoryHtml = locationHistory.map((item, index) => {
      return (
        <div key={index}>
          <div>current location: {item.currentLocation.name}</div>
        </div>
      );
    });

    var possibleChoices = this.state.possibleChoices;
    const possibleChoicesHtml = possibleChoices.map((choice, index) => {

      return (
        <div className="possible-choice" key={index} onClick={ () => this.handleClickTravelTo(choice.name) }>{choice.name}</div>
      );
    });

    const backtrackHtml = locationHistory.length > 1 ? <div className="back-track-info" onClick={() => this.handleClickBacktrack() }><span className="back-help-text">or go back to where you were previously ... </span><span className="back-track-button">{lastLocationName}</span></div> : "";

    var clueClose = this.state.clueDisplayComplete || true ? <div className="close-clue-display" onClick={() => this.handleClickCloseCloseDisplay()}>X</div> : ""
    var clueDisplay = <div className="clue-display"><span className="clue-talker">{this.state.displayCityTile ? this.state.displayCityTile.talkingTo + ": " : ""}</span><span className="clue-text"></span>{clueClose}</div>;

    // add in any filler animations
    const fillerHtml = this.fillerAnimations.map((fillerAnimation, index) => {
      return (
        <img className="filler filler1" style={fillerAnimation.styles} key={index} id={fillerAnimation.id} src={fillerAnimation.currentImage()} alt="filler image" />
      );
    });

    // can we preload the images used in the animations? I don't know! let's try!
    const allPreLoadImages = this.state.possibleFillerAnimations.map((animation, index) => {
      let fillerImages = animation.sequence.map((sequence, index) => {
        return <link rel="preload" as="image" href={sequence.image}></link>
      })
      return fillerImages;
    }); 

    return (
      <div className="game">
        {allPreLoadImages}
        {this.outputIntro()}
        {this.outputFinish()}
        <div className="location-info">
          <div className="game-title">Where in New Zealnd is Charlie Singh?</div>
          <div className="location"><span className="location-title">You are currently in </span><div className="current-location">{ this.state.currentLocation ? this.state.currentLocation.name + "!" : "unknown" }</div></div>
          {/* <div className="location">Last Seen:    { this.state.lastSeenLocation ? this.state.lastSeenLocation.name + "!" : "unknown" }</div>
          <div className="location">Next:    { this.state.nextLocation ? this.state.nextLocation.name + "!" : "unknown" }</div>
           */}
        </div>
        <div className="game-board" key="sdf112sdf">
           {fillerHtml}
          <City cityTiles={this.state.cityTiles} handleClickCityTile={(index) => this.handleClickCityTile(index)}/>
          {this.state.displayClue ? clueDisplay : ""}
        </div>
        <div><div className="possible-choices-heading">Where do you want to go?</div> <div className="possible-choice-container">{possibleChoicesHtml} </div></div>
        {backtrackHtml}
        {/* <div>current level: { this.state.stats.currentLevel }</div>
        <div>so far got this many in a row: { this.state.stats.currentRightStreak }</div>
        <div>totalRightCount: { this.state.stats.totalRightCount }</div>
        <div>totalWrongCount: { this.state.stats.totalWrongCount }</div>
        <div>
          {locationHistoryHtml}
        </div> */}
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);


function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}