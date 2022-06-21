import React from "react";
import "./poker.css"

const Hearts = require('./images/heart.png')
const Diamonds = require('./images/diamond.png')
const Spades = require('./images/spade.png')
const Clubs = require('./images/club.png')

function getSuitImage(suit) {
    if (suit === "Hearts") {
        return Hearts;
    }
    else if (suit === "Diamonds") {
        return Diamonds;
    }
    else if (suit === "Spades") {
        return Spades;
    }
    else if (suit === "Clubs") {
        return Clubs;
    }
}

const Card = ({ value, suit }) => (
	<div className="card">
		<span className="value">{value}</span>
        <span className="value2">{value}</span>
        <img className='suit' src={getSuitImage(suit)}/>
        <img className='smallsuit1' src={getSuitImage(suit)}/>
        <img className='smallsuit2' src={getSuitImage(suit)}/>
	</div>
);

export default Card;