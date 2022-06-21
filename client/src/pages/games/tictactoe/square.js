import React from "react";
import "./tictactoe.css"

const Square = ({ value, onClick }) => (
	<button className="square" onClick={onClick}>
		{value}
	</button>
);

export default Square;