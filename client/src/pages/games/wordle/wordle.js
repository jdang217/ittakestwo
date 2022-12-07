import React, {useEffect, useRef, useState} from 'react';
import words from './words.txt'
import Square from './square';
import moment from 'moment';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';


const Wordle = () => {
    
    const MAX_WORDS = 5757
    const A_KEYCODE = 65
    const Z_KEYCODE = 90

    const [word, setWord] = useState()
    const [wordList, setWordList] = useState()
    const [board, setBoard] = useState(Array(30).fill(null))
    const [currentSquare, setCurrentSquare] = useState(0)
    const [numGuesses, setNumGuesses] = useState(0)
    const [gameover, setGameOver] = useState(false)

    const [openGameoverModal, setOpenGameoverModal] = useState();
    const handleGameoverModalOpen = () => setOpenGameoverModal(true);
    const handleGameoverModalClose = () => setOpenGameoverModal(false);

    const boardRef = useRef();
    const currentSquareRef = useRef();
    const numGuessesRef = useRef();
    const wordRef = useRef();
    const wordListRef = useRef();
    const gameoverRef = useRef();

    function todaysPosition() {
        var firstDay = moment([2022, 11, 6])
        var currentDay = moment()
        var dayDifference = currentDay.diff(firstDay, "days")

        if (dayDifference >= MAX_WORDS) {
            dayDifference -= MAX_WORDS
        }

        return dayDifference
    }

    function checkValidWord() {
        var enteredWord = ""
        for (var i = 0; i < 5; i++) {
            enteredWord += boardRef.current[(numGuessesRef.current * 5) + i]
        }
        return wordListRef.current.includes(enteredWord.toLowerCase())
    }

    function checkForCorrectness() {
        var enteredWord = ""
        var wordCopy = wordRef.current
        var checked = []
        for (var i = 0; i < 5; i++) {
            enteredWord += boardRef.current[(numGuessesRef.current * 5) + i]
        }

        for (var i = 0; i < 5; i ++) {
            var currentLetter = enteredWord.charAt(i)
            if (currentLetter.toLowerCase() == wordCopy.charAt(i)) {
                checked.push(i)
                document.getElementById("wordlesquare" + ((numGuessesRef.current * 5) + i)).style.backgroundColor = "green"
            }
        }
        if (checked.length == 5) {
            setGameOver(true)
        }

        for (var i = 0; i < checked.length; i++) {
            wordCopy = wordCopy.slice(0, checked[i]) + wordCopy.slice(checked[i] + 1);
        }

        for (var i = 0; i < 5; i++) {
            var currentLetter = enteredWord.charAt(i)
            if (checked.includes(i)) {
                continue
            }
            if (wordCopy.includes(currentLetter.toLowerCase())) {
                wordCopy = wordCopy.replace(currentLetter.toLowerCase(), "")
                document.getElementById("wordlesquare" + ((numGuessesRef.current * 5) + i)).style.backgroundColor = "#b59f3b"
            }
            else {
                document.getElementById("wordlesquare" + ((numGuessesRef.current * 5) + i)).style.backgroundColor = "grey"
            }
        }

    }

    const handleKeyDown = (e) => {
        const keyCode = e.keyCode
        if (gameoverRef.current) {
            return
        }

        //letter input
        if (keyCode >= A_KEYCODE && keyCode <= Z_KEYCODE) {
            //checks if current square is last square
            const boardCopy = [...boardRef.current];
            if (boardCopy[currentSquareRef.current] == null && currentSquareRef.current < (numGuessesRef.current + 1) * 5) {
                boardCopy[currentSquareRef.current] = String.fromCharCode(keyCode)
                setBoard(boardCopy)
                setCurrentSquare(currentSquareRef.current + 1)
            }
        }
        //backspace
        else if (keyCode == 8) {
            const boardCopy = [...boardRef.current];
            if (currentSquareRef.current > (numGuessesRef.current * 5)) {
                boardCopy[currentSquareRef.current - 1] = null
                setBoard(boardCopy)
                setCurrentSquare(currentSquareRef.current - 1)
            }
        }
        //enter
        else if (keyCode == 13) {
            if (currentSquareRef.current == (numGuessesRef.current + 1) * 5 && currentSquareRef.current != 30) {
                if (checkValidWord()) {
                    checkForCorrectness()
                    setNumGuesses(numGuessesRef.current + 1)
                }
            }
        }

    }

    useEffect(() => {
        fetch(words)
        .then(r => r.text())
        .then(text => {
            text = text.split("\n")
            setWord(text[todaysPosition()])
            setWordList(text.sort())
        });
        document.addEventListener("keydown", handleKeyDown, false);
    }, [])

    useEffect(() => {
        wordRef.current = word
    }, [word])

    useEffect(() => {
        wordListRef.current = wordList
    }, [wordList])

    useEffect(() => {
        boardRef.current = board
    }, [board])

    useEffect(() => {
        currentSquareRef.current = currentSquare
    }, [currentSquare])

    useEffect(() => {
        numGuessesRef.current = numGuesses
    }, [numGuesses])

    useEffect(() => {
        gameoverRef.current = gameover
        if (gameover) {
            setOpenGameoverModal(true);
        }
    }, [gameover])

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
      };

    const GameoverModal = () => (
        <Modal
            open={openGameoverModal}
            onClose={handleGameoverModalClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                Wordle Statistics
                </Typography>
                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                Number of Guesses: {numGuesses}
                </Typography>
            </Box>
        </Modal>
    )

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'Right',
                height: '100vh'
            }}
        >
            <GameoverModal/>
            {/*<h1>{word}</h1>*/}
            <div className='wordleboard'>
                {board.map((square, i) => (
                <Square id={`wordlesquare${i}`} key={i} value={square} />
            ))}
            </div>
        </div>
    );
};

export default Wordle;
