import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import $ from 'jquery';

function Square(props) {

  let className = "square";
  if(props.isWinningSquare) {
    className += " winningSquare";
  }

  return (
    <button 
        className={className} 
        onClick={props.onClick}>
      {props.value}
    </button>
  );
}

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

class Board extends React.Component {

  renderSquare(i) {
    return <Square key={i}
        isWinningSquare={this.props.winningSquares && this.props.winningSquares.includes(i)}
        value={this.props.squares[i]} 
        onClick={() => this.props.onClick(i)}
      />;
  }

  render() {
    let theBoard = [];
    let index = 0;
    for(var row = 0; row < 3; row ++) {
      var theRow = [];
      for(var col = 0; col < 3; col ++) {
        theRow.push(<span key={index}>{this.renderSquare(index)}</span>);
        index++;
      }
      theBoard.push(<div key={row} className="board-row">{theRow}</div>);
    }
    return (<div>{theBoard}</div>);

    // return (

    //   <div>
    //     <div className="board-row">
    //       {this.renderSquare(0)}
    //       {this.renderSquare(1)}
    //       {this.renderSquare(2)}
    //     </div>
    //     <div className="board-row">
    //       {this.renderSquare(3)}
    //       {this.renderSquare(4)}
    //       {this.renderSquare(5)}
    //     </div>
    //     <div className="board-row">
    //       {this.renderSquare(6)}
    //       {this.renderSquare(7)}
    //       {this.renderSquare(8)}
    //     </div>
    //   </div>
    // );
  }
}

class Game extends React.Component {

  personImageIndex = 0;

  constructor(props) {
    
    const locations = [
      {
        name : "New Zealand",
        arrivalCity : "Auckland",
        clues : [ "They wanted to change their money to dollars", "Keen to visit middle earth", "Something about seeing friends in Wellington" ]
      },
      {
        name : "Australia",
        arrivalCity : "Sydney",
        clues : [ "They wanted to change their money to dollars", "Keen to visit the Opera House", "Something about seeing friends in Perth" ]
      },
      {
        name : "England",
        arrivalCity : "London",
        clues : [ "They wanted to change their money to pounds", "Keen to visit Big Ben", "Something about seeing friends in York" ]
      },
      {
        name : "Scotland",
        arrivalCity : "Edinburgh",
        clues : [ "They wanted to change their money to pounds", "Keen to visit the Loch Ness monster", "Something about seeing friends in Glasgow" ]
      },
      {
        name : "Egypt",
        arrivalCity : "Cairo",
        clues : [ "They wanted to change their money to pounds", "Keen to visit the Nile", "Something about seeing friends in Luxor" ]
      },
    ];

    super(props);

    // how many different images of each type do we have?
    let imageCounts = {
      shop : 4,
      citizen : 7
    };

    this.state = {
      history : [ { squares: Array(9).fill(null), col: null, row: null} ],
      xIsNext : true,
      stepNumber : 0,
      sortOrderAsc : true,
      locations : locations,
      currentLocation : null,
      lastSeenLocation : null,
      nextLocation : null,
      possibleChoices : [],
      cityTiles : [ Array(9).fill(null) ],
      displayCityTile : null,               // the city tile that the user has clicked on, wanting to get a clue
      displayClue : false,                  // a flag indicating if the dialog is open showing a clue
      displayedClue : "",                   // the text of the clue to display
      imageCounts : imageCounts,            // an object that tells us how many items there are in each type of image/city tile
    }


    // todo this should be in componentDidMount?
    var currentLocation = this.getLocationByName("Scotland", locations);
    var nextLocation = this.getNextLocation(currentLocation, locations);
    var possibleChoices = this.getPossibleChoices(currentLocation, nextLocation, locations);
    this.state.currentLocation = currentLocation;
    this.state.lastSeenLocation = currentLocation;
    this.state.nextLocation = nextLocation;
    this.state.possibleChoices = possibleChoices;
    
  }

  componentDidMount() {
    // setup the image index for our people - this pics where we will randomly start getting
    // our citizen images from the array
    let imageCount = this.state.imageCounts["citizen"];
    this.personImageIndex = randomIntFromInterval(1, imageCount);

    var nextLocation = this.state.nextLocation;
    this.setState( { cityTiles : this.createCityTiles(nextLocation) });
  }

  travelToLocation(travelToLocation) {
    let locations = this.state.locations;
    if(travelToLocation.name === this.state.nextLocation.name) {
      // they are moving to the correct place :)
      var currentLocation = travelToLocation;
      var nextLocation = this.getNextLocation(currentLocation, locations);
      var possibleChoices = this.getPossibleChoices(currentLocation, nextLocation, locations);
      this.setState({
        currentLocation : currentLocation,
        lastSeenLocation : currentLocation,
        nextLocation : nextLocation,
        possibleChoices : possibleChoices,
        cityTiles : this.createCityTiles(nextLocation)
      })

    } else {
      // they are not moving to the correct place ...

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

  createCityTiles(nextLocation) {
    let cityTiles = Array(9).fill(null);
    // for each of our clues put them into a city tile
    for(let i = 0; i < nextLocation.clues.length; i++) {
      var clueSet = false;
      while(!clueSet) {
        var cityIndex = randomIntFromInterval(0, 8);
        if(null === cityTiles[cityIndex]) {

          let person = this.assignPersonDetails();

          // console.log("setting clue " + i + " to tile " + nextLocation.clues[i])
          // console.log(person)
          cityTiles[cityIndex] = {
            talkingTo: person.talkingTo,
            clue: nextLocation.clues[i],
            image: person.image
          };
          clueSet = true;
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

  // get a response that isn't a clue
  getNonHelpfulResponse(type) {
    let response = "";
    let possibleResponses = {
      shop : ["This isn't a library .. that answers questions! Buy something!", "We have a great sale on toilet paper at the moment!"],
      citizen : ["You look like a cop. I don't talk to cops.", "This seems like a 'stranger danger' situation"] 
    }
    var rand = randomIntFromInterval(0, possibleResponses[type].length-1);
    response = possibleResponses[type][rand];
    return response;
  }

  // get a location by name from a collection of locations
  getLocationByName(name, locations) {
    for(let i = 0; i < locations.length; i++) {
      console.log(locations[i])
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

  getPossibleChoices(currentLocation, nextLocation, locations) {
    var possibleChoices = [];
    while(possibleChoices.length < 2) {
      var possibleChoice = null;
      var nextChoiceIndex = randomIntFromInterval(0, locations.length-1);
      possibleChoice = locations[nextChoiceIndex];
      if(possibleChoice.name !== currentLocation.name && possibleChoice.name !== nextLocation.name) {
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
    var insertIndex = randomIntFromInterval(0, 2);
    possibleChoices.splice(insertIndex,0,nextLocation);
    return possibleChoices;
  }

  // just look at his name. glorious.
  handleClickCloseCloseDisplay() {
    // can't close a dialog until it has finshed being displayed
    if(this.state.clueDisplayComplete) {
      this.setState({ displayClue : false });
    }
  }

  handleClickTravelTo(name) {
    let travelToThisLocation = this.getLocationByName(name, this.state.locations);
    this.travelToLocation(travelToThisLocation);
  }

  handleClickCityTile(index) {
    // can't click a tile if the dialog is already open. We're not animals. We live in a society. There are rules.
    if(this.state.displayClue) {
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
    console.log("clicked on " + index)
  }

  // frankly, async state is bullshit, so we're not going to use it
  doClueTyping(clueToDisplay, doneSoFar, target) {
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


  render() {

    var possibleChoices = this.state.possibleChoices;
    const possibleChoicesHtml = possibleChoices.map((choice, index) => {

      return (
        <div className="possible-choice" onClick={ () => this.handleClickTravelTo(choice.name) }>{choice.name}</div>
        /* <li key={index}>
          <button className="possible-choice" onClick={ () => this.handleClickTravelTo(choice.name) }>{choice.name}</button>
        </li> */
      );
    });

    var clueClose = this.state.clueDisplayComplete ? <div className="close-clue-display" onClick={() => this.handleClickCloseCloseDisplay()}>X</div> : ""
    var clueDisplay = <div className="clue-display"><span className="clue-talker">{this.state.displayCityTile ? this.state.displayCityTile.talkingTo + ": " : ""}</span><span className="clue-text"></span>{clueClose}</div>;


    return (
      <div className="game">
        <div className="location-info">
          <div className="location">Welcome to <div className="current-location">{ this.state.currentLocation ? this.state.currentLocation.name + "!" : "unknown" }</div></div>
          <div className="location">Last Seen:    { this.state.lastSeenLocation ? this.state.lastSeenLocation.name + "!" : "unknown" }</div>
          <div className="location">Next:    { this.state.nextLocation ? this.state.nextLocation.name + "!" : "unknown" }</div>
          
        </div>
        <br/>
        <div className="game-board">
          <City cityTiles={this.state.cityTiles} handleClickCityTile={(index) => this.handleClickCityTile(index)}/>
          {this.state.displayClue ? clueDisplay : ""}
        </div>
        <div><div className="possible-choices-heading">Where do you want to go?</div> {possibleChoicesHtml}</div>
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