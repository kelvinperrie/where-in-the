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
    super(props);
    this.state = {
      history : [ { squares: Array(9).fill(null), col: null, row: null} ],
      xIsNext : true,
      stepNumber : 0,
      sortOrderAsc : true
    }
  }

  jumpTo(step) {
    this.setState({ stepNumber : step, xIsNext: (step % 2) === 0 })
  }

  handleSwitcharooClick() {
    this.setState({
      sortOrderAsc : !this.state.sortOrderAsc
    })
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }

    const row = Math.floor(i / 3) +1;
    const col = i % 3 + 1

    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares, col : col, row: row
      }]),
      xIsNext: !this.state.xIsNext,
      stepNumber : history.length
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winningInfo = calculateWinner(current.squares);
    const blankSqaureCount = countBlankSquares(current.squares);
    const winner = winningInfo.winner;
    const winningSquares = winningInfo.winningSquares;

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move + " col:" + step.col + ", row:" + step.row :
        'Go to game start';
      let stepStyle = "";
      if(move === this.state.stepNumber) {
        stepStyle = "active-step";
      }
      return (
        <li key={move}>
          <button className={stepStyle} onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else if(blankSqaureCount === 0) {
      status = "Awww, looks like it's a crappy ol' draw";      
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board squares={current.squares} onClick={(i) => this.handleClick(i)} winningSquares={winningSquares} />
        </div>
        <div className="game-info">
          <div>{ status }</div>
          <ol>{ this.state.sortOrderAsc ? moves : moves.reverse() }</ol>
          <button onClick={() => this.handleSwitcharooClick()}>
            Do A Switcharoo
          </button>
        </div>
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