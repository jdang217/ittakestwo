import React from "react";
import "./wordle.css"

const Square = ({ value, id }) => (
	<button id={id} className="wordlesquare">
		{value}
	</button>
);

export default Square;