import React, { Component } from 'react';
import './App.css';

const StarsFrame = (props) => {
  let stars = [];
    for (let i = 0; i < props.numberOfStars; i++) {
      stars.push(
        <span className="glyphicon glyphicon-cog" key={"clicker" + i}></span>
      );
    }
  
    return (
      <div id="stars-frame">
        <div className="well">
          {stars}
        </div>
      </div>
    );
}

const ButtonFrame = (props) => {
  let button, disabled;

  switch(props.correct) {
    case true: 
      button = (
        <button className="btn btn-success btn-lg"
                onClick={props.acceptAnswer.bind(null)}>
          <span className="glyphicon glyphicon-ok" />
        </button>
      );
      break;
    case false: 
      button = (
        <button className="btn btn-danger btn-lg">
          <span className="glyphicon glyphicon-remove" />
        </button>
      );
      break;
    default:
      disabled = (props.selectedNumbers.length === 0);
      button = (
        <button className="btn btn-primary btn-lg" disabled={disabled}
                onClick={props.checkAnswer.bind(null)} >
          =
        </button>
      );
  }

  return (
    <div id="button-frame">
      {button}<br /><br />
      <button className="btn btn-warning btn-xs" onClick={props.redraw} disabled={props.redraws === 0}>
        <span className="glyphicon glyphicon-refresh" />
        &nbsp;{props.redraws}
      </button>
    </div>
  );
}

const AnswerFrame = (props) => {
  const selectedNumbers = props.selectedNumbers.map((i) => {
    return (
      <button
        onKeyUp={(e) => (props.keyboardUser(e) ? props.unselectNumber(i) : null)} 
        onClick={props.unselectNumber.bind(null, i)} key={"number"+i}>
        {i}
      </button>
    )
  })
  return (
    <div id="answer-frame">
      <div className="well">
        {selectedNumbers}
      </div>
    </div>
  );
}

const NumbersFrame = (props) => {
  let className;
  const numbers = [];
  const {selectNumber, selectedNumbers, usedNumbers, keyboardUser} = props;

  for (let i = 1; i <=9; i++) {
    className="number selected-" + (selectedNumbers.indexOf(i)>=0);
    className+=" used-" + (usedNumbers.indexOf(i)>=0);
    numbers.push(
      <button 
        className={className} 
        onKeyUp={(e) => (keyboardUser(e) ? selectNumber(i) : null)} 
        onClick={selectNumber.bind(null, i)} 
        key={"num" + i}
        >{i}</button>
    )
  }
  return (
    <div id="numbers-frame">
      <div className="well">
        {numbers}
      </div>
    </div>
  );
}

const DoneFrame = (props) => {
  return(
    <div className="well text-center">
      <h2>{props.doneStatus}</h2>
      <button className="btn btn-default" onClick={props.resetGame} >Play again</button>
    </div>
  )
}

const randomNumber = () => (Math.floor(Math.random()*9) +1);
const INITIAL_STATE = {
  selectedNumbers: [],
  numberOfStars: randomNumber(),
  usedNumbers: [],
  redraws: 5,
  correct: null, 
  doneStatus: null
}


class Game extends Component {
  constructor() {
    super();
    this.state = INITIAL_STATE;
    // this.randomNumber = this.randomNumber.bind(this)
    this.resetGame = this.resetGame.bind(this);
  }
  resetGame() {
    this.setState(INITIAL_STATE)
  }
  keyboardUser(e) {
    if (e.keyCode === 32 || e.keyCode === 13) { //Space and Enter
      return true;
    }
  }
  selectNumber(clickedNumber) {
    if(this.state.selectedNumbers.indexOf(clickedNumber)<0) {
      this.setState({
        selectedNumbers: this.state.selectedNumbers.concat(clickedNumber),
        correct: null
      })
    }
  }
  unselectNumber(clickedNumber) {
    let selectedNumbers = this.state.selectedNumbers;
    let indexOfNumber = selectedNumbers.indexOf(clickedNumber);

    selectedNumbers.splice(indexOfNumber, 1);

    this.setState({ selectedNumbers: selectedNumbers, correct: null})
  }
  sumOfSelectedNumbers() {
    return this.state.selectedNumbers.reduce((p,n) => p+n, 0)
  }
  checkAnswer() {
    let correct = (this.state.numberOfStars === this.sumOfSelectedNumbers());
    this.setState({ correct: correct });
  }
  acceptAnswer() {
    var usedNumbers = this.state.usedNumbers.concat(this.state.selectedNumbers);
    this.setState({
      selectedNumbers: [],
      usedNumbers:usedNumbers,
      correct: null,
      numberOfStars: randomNumber(),
    }, () => {this.updateDoneStatus() })
  }
  redraw() {
    if (this.state.redraws >0) {
      this.setState({
        numberOfStars: randomNumber(),
        correct: null,
        selectedNumbers: [],
        redraws: this.state.redraws - 1,
      }, () => {this.updateDoneStatus() })

    }
  }
  possibleSolution() {
    let {numberOfStars, usedNumbers} = this.state;
    let possibleNumbers = [];

    for (var i=1;i<=9;i++) {
      if(usedNumbers.indexOf(i) < 0) {
        possibleNumbers.push(i);
      }
    }

    const possibleCombinationSum = (arr, n) => {
      if (arr.indexOf(n) >= 0) { return true; }
      if (arr[0] > n) { return false; }
      if (arr[arr.length - 1] > n) {
        arr.pop();
        return possibleCombinationSum(arr, n);
      }
      const listSize = arr.length, combinationsCount = (1 << listSize)
      for (let i = 1; i < combinationsCount ; i++ ) {
        let combinationSum = 0;
        for (let j=0 ; j < listSize ; j++) {
          if (i & (1 << j)) { combinationSum += arr[j]; }
        }
        if (n === combinationSum) { return true; }
      }
      return false;
    };

    return possibleCombinationSum(possibleNumbers, numberOfStars);
  }
  
  updateDoneStatus() {
    if (this.state.usedNumbers.length === 9) {
      this.setState({ doneStatus: "Woo Hoo! You won"})
      return;
    }
    if (this.state.redraws === 0 && !this.possibleSolution()) {
      this.setState({ doneStatus: "Game Over. You lose."})
    }
  }
  render() {
    let { 
      numberOfStars, selectedNumbers,
      correct, redraws, usedNumbers, doneStatus 
    } = this.state;

    let bottomFrame = null;

    if (doneStatus) {
      bottomFrame = <DoneFrame doneStatus={doneStatus}
                               resetGame={this.resetGame} />;
    } else {
      bottomFrame = (
        <NumbersFrame 
          selectedNumbers={selectedNumbers}
          selectNumber={this.selectNumber}
          usedNumbers={usedNumbers}
          keyboardUser={this.keyboardUser.bind(this)} />
      );
    }
    return (
      <div id="game">
        <h2>Play Nine</h2>
        <hr />
        <div className="clearfix">
          <StarsFrame numberOfStars={numberOfStars}/>
          <ButtonFrame selectedNumbers={selectedNumbers} 
                       correct={correct}
                       redraws={redraws}
                       checkAnswer={this.checkAnswer.bind(this)}
                       acceptAnswer={this.acceptAnswer.bind(this)}
                       redraw={this.redraw.bind(this)} />
          <AnswerFrame selectedNumbers={selectedNumbers}
                       unselectNumber={this.unselectNumber.bind(this)} 
                       keyboardUser={this.keyboardUser.bind(this)} />
        </div>

        
        {bottomFrame}

      </div>
    );
  }
}

export default Game;