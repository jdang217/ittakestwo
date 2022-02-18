import React from 'react';
import Square from './square';
import { useState } from 'react';

const TicTacToe = () => {

    const [board, setBoard] = useState(Array(9).fill(null));
    const [xIsNext, setXisNext] = useState(true);
    const winner = calculateWinner(board);

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
                return squares[a];
            }
        }
        return null;
    }

    const handleClick = (i) => {
        console.log(i)
        const boardCopy = [...board];
        // If user click an occupied square or if game is won, return
        if (winner || boardCopy[i]) return;
        // Put an X or an O in the clicked square
        boardCopy[i] = xIsNext ? "X" : "O";
        setBoard(boardCopy);
        setXisNext(!xIsNext);
    };

    const style = {
        border: "4px solid darkblue",
        borderRadius: "10px",
        width: "250px",
        height: "250px",
        margin: "0 auto",
        display: "grid",
        gridTemplate: "repeat(3, 1fr) / repeat(3, 1fr)",
    };

    const style1 = {
        width: "200px",
        margin: '20px auto',
    }
    
    return (
        <div className='window'>
            <h1 className='title'>Tic Tac Toe</h1>

            <div style={style}>
                {board.map((square, i) => (
                <Square key={i} value={square} onClick={() => handleClick(i)} />
            ))}
            </div>

            <div>
                <p>
                    {/* please remove this ternary with something readable*/}
                    {winner ? "Winner: " + winner : "Next Player: " + (xIsNext ? "X" : "O")}
                </p>
            </div>
        </div>
    );
};

export default TicTacToe;
