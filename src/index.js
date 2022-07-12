import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

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
        <img  key={index} src={"images/" + item.image + ".png"} alt="city tile" onClick={() => this.props.handleClickCityTile(index)} />
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
      displayCityTile : null,
      //clueToDisplay : null,
      displayClue : false
    }

    var currentLocation = this.getLocationByName("Scotland", locations);
    var nextLocation = this.getNextLocation(currentLocation, locations);
    var possibleChoices = this.getPossibleChoices(currentLocation, nextLocation, locations);
    this.state.currentLocation = currentLocation;
    this.state.lastSeenLocation = currentLocation;
    this.state.nextLocation = nextLocation;
    this.state.possibleChoices = possibleChoices;
    this.state.cityTiles = this.createCityTiles(nextLocation);
    // this.setState({ 
    //   currentLocation : currentLocation,
    //   nextLocation : nextLocation
    // })
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

  createCityTiles(nextLocation) {
    let cityTiles = Array(9).fill(null);
    console.log("we have this many clues")
    console.log(nextLocation.clues.length)
    // for each of our clues put them into a city tile
    for(let i = 0; i < nextLocation.clues.length; i++) {
      var clueSet = false;
      while(!clueSet) {
        var cityIndex = randomIntFromInterval(0, 8);
        console.log(cityTiles[cityIndex])
        if(null === cityTiles[cityIndex]) {
          console.log("setting clue " + i + " to tile " + nextLocation.clues[i])
          cityTiles[cityIndex] = {
            talkingTo: "shop keeper",
            clue: nextLocation.clues[i],
            image: "shop"
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
          clue = "Mooooooooooooooooooooooooooooooo ... Moo!";
          image = "cow"
        } else if (rand < 30) {
          talkingTo = "Shop keeper";
          clue = this.getNonHelpfulResponse();
          image = "shop"
        } else if (rand < 50) {
          talkingTo = "Random citizen";
          clue = this.getNonHelpfulResponse();
          image = "citizen"
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

  getNonHelpfulResponse() {
    let response = "";
    let possibleResponses = ["You look like a cop. I don't talk to cops.", "Who are you?"];
    var rand = randomIntFromInterval(0, possibleResponses.length-1);
    response = possibleResponses[rand];
    return response;
  }

  getLocationByName(name, locations) {
    for(let i = 0; i < locations.length; i++) {
      console.log(locations[i])
      if(locations[i].name === name) {
        return locations[i];
      }
    }
  }

  getNextLocation(currentLocation, locations) {
    console.log("in getNextLocation")
    console.log(locations)
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

  handleClickCloseCloseDisplay() {
    this.setState({ displayClue : false });
  }

  handleClickTravelTo(name) {
    let travelToThisLocation = this.getLocationByName(name, this.state.locations);
    this.travelToLocation(travelToThisLocation);
  }

  handleClickCityTile(index) {
    var clickedCityTileData = this.state.cityTiles[index];
    if(clickedCityTileData!==null) {
      console.log("data is " + clickedCityTileData);
      this.setState({
        //clueToDisplay : clickedCityTileData.clue,
        displayCityTile : clickedCityTileData,
        displayClue : true
      })
    } else {
      this.setState({
        //clueToDisplay : "you look like a cop, I don't talk to cops",
        displayCityTile : clickedCityTileData,
        displayClue : true
      })
    }
    console.log("clicked on " + index)
  }

  // handleClick(i) {
  //   const history = this.state.history.slice(0, this.state.stepNumber + 1);
  //   const current = history[history.length - 1];
  //   const squares = current.squares.slice();
  //   if (calculateWinner(squares).winner || squares[i]) {
  //     return;
  //   }

  //   const row = Math.floor(i / 3) +1;
  //   const col = i % 3 + 1

  //   squares[i] = this.state.xIsNext ? 'X' : 'O';
  //   this.setState({
  //     history: history.concat([{
  //       squares: squares, col : col, row: row
  //     }]),
  //     xIsNext: !this.state.xIsNext,
  //     stepNumber : history.length
  //   });
  // }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winningInfo = calculateWinner(current.squares);
    const blankSqaureCount = countBlankSquares(current.squares);
    const winner = winningInfo.winner;
    const winningSquares = winningInfo.winningSquares;

    // const moves = history.map((step, move) => {
    //   const desc = move ?
    //     'Go to move #' + move + " col:" + step.col + ", row:" + step.row :
    //     'Go to game start';
    //   let stepStyle = "";
    //   if(move === this.state.stepNumber) {
    //     stepStyle = "active-step";
    //   }
    //   return (
    //     <li key={move}>
    //       <button className={stepStyle} onClick={() => this.jumpTo(move)}>{desc}</button>
    //     </li>
    //   );
    // });

    var possibleChoices = this.state.possibleChoices;
    const possibleChoicesHtml = possibleChoices.map((choice, index) => {

      return (
        <li key={index}>
          <button className="possible-choice" onClick={ () => this.handleClickTravelTo(choice.name) }>{choice.name}</button>
        </li>
      );
    });

    var clueDisplay = <div className="clue-display">{this.state.displayCityTile ? this.state.displayCityTile.talkingTo + ": " + this.state.displayCityTile.clue : ""}<div className="close-clue-display" onClick={() => this.handleClickCloseCloseDisplay()}>X</div></div>;

    // let status;
    // if (winner) {
    //   status = 'Winner: ' + winner;
    // } else if(blankSqaureCount === 0) {
    //   status = "Awww, looks like it's a crappy ol' draw";      
    // } else {
    //   status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    // }

    return (
      <div className="game">
        <div className="location-info">
          <div className="location">Welcome to <div className="current-location">{ this.state.currentLocation ? this.state.currentLocation.name + "!" : "unknown" }</div></div>
          <div className="location">Last Seen:    { this.state.lastSeenLocation ? this.state.lastSeenLocation.name + "!" : "unknown" }</div>
          <div className="location">Next:    { this.state.nextLocation ? this.state.nextLocation.name + "!" : "unknown" }</div>
          
        </div>
        <br/>
        <div className="game-board">
          {/* <Board squares={current.squares} onClick={(i) => this.handleClick(i)} winningSquares={winningSquares} /> */}
          <City cityTiles={this.state.cityTiles} handleClickCityTile={(index) => this.handleClickCityTile(index)}/>
          {this.state.displayClue ? clueDisplay : ""}
        </div>
        <div>Where do you want to go? {possibleChoicesHtml}</div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function countBlankSquares(squares) {
  var emptyCount = 0;
  for (let i = 0; i < squares.length; i++) {
    if(squares[i] === null) emptyCount++;
  }
  return emptyCount;
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      //console.log(a + " " + b + " " + c)
      return { winner : squares[a], winningSquares : lines[i] }
    }
  }
  return {};
}


function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}