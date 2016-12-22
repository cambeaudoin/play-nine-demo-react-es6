import React, { Component } from 'react';
import './App.css';

class StarsFrame extends Component {
  render() {
  
    let stars = [];
    for (let i=0;i<this.props.numberOfStars; i++) {
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
}

class ButtonFrame extends Component {
  render() {
    var button, disabled;
    const correct = this.props.correct;

    switch(correct) {
      case true: 
        button = (
          <button className="btn btn-success btn-lg"
                  onClick={this.props.acceptAnswer.bind(null)}>
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
        disabled = (this.props.selectedNumbers.length === 0);
        button = (
          <button className="btn btn-primary btn-lg" disabled={disabled}
                  onClick={this.props.checkAnswer.bind(null)} >
            =
          </button>
        );
    }

    return (
      <div id="button-frame">
        {button}<br /><br />
        <button className="btn btn-warning btn-xs" onClick={this.props.redraw} disabled={this.props.redraws === 0}>
          <span className="glyphicon glyphicon-refresh" />
          &nbsp;{this.props.redraws}
        </button>
      </div>
    );
  }
}

class AnswerFrame extends Component {
  render() {
    const props = this.props;
    const keyboardUser = props.keyboardUser;
    const selectedNumbers = props.selectedNumbers.map(function(i) {
      return (
        <button
          onKeyUp={(e) => (keyboardUser(e) ? props.unselectNumber(i) : null)} 
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
}

class NumbersFrame extends Component {
  render() {
    let numbers = [];
    let className;
    let {selectNumber, selectedNumbers, usedNumbers, keyboardUser} = this.props;

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
}

class DoneFrame extends Component {
  render() {
    return(
      <div className="well text-center">
        <h2>{this.props.doneStatus}</h2>
        <button className="btn btn-default" onClick={this.props.resetGame} >Play again</button>
      </div>
    )
  }
}

const INITIAL_STATE = {
  selectedNumbers: [],
  numberOfStars: Math.floor(Math.random()*9) +1,
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
  }
  resetGame() {
    this.setState(INITIAL_STATE)
  }
  randomNumber() {
    return Math.floor(Math.random()*9) +1;
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
      numberOfStars: this.randomNumber(),
    }, () => {this.updateDoneStatus() })
  }
  redraw() {
    if (this.state.redraws >0) {
      this.setState({
        numberOfStars: this.randomNumber(),
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

    var possibleCombinationSum = function(arr, n) {
      if (arr.indexOf(n) >= 0) { return true; }
      if (arr[0] > n) { return false; }
      if (arr[arr.length - 1] > n) {
        arr.pop();
        return possibleCombinationSum(arr, n);
      }
      var listSize = arr.length, combinationsCount = (1 << listSize)
      for (var i = 1; i < combinationsCount ; i++ ) {
        var combinationSum = 0;
        for (var j=0 ; j < listSize ; j++) {
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
      numberOfStars, selectedNumbers, keyboardUser,
      correct, redraws, usedNumbers, doneStatus 
    } = this.state;

    let bottomFrame = null;

    if (doneStatus) {
      bottomFrame = <DoneFrame doneStatus={doneStatus}
                               resetGame={this.resetGame.bind(this)} />;
    } else {
      bottomFrame = (
        <NumbersFrame 
          selectedNumbers={selectedNumbers}
          selectNumber={this.selectNumber.bind(this)}
          usedNumbers={usedNumbers}
          keyboardUser={keyboardUser} />
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
                       keyboardUser={keyboardUser} />
        </div>

        
        {bottomFrame}

      </div>
    );
  }
}

export default Game;