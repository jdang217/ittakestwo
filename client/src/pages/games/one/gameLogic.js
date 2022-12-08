import { color } from "@mui/system"


function createDeck() {
    var deck = []
    const values = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "skip", "reverse", "draw"]
    const colors = ["Red", "Yellow", "Green", "Blue"]

    //push 2 copies of 1-9, skip, reverse, and draw cards for each color
    for (var i = 0; i < 2; i++) {
        colors.forEach(color => {
            values.forEach(value => {
                const card = {
                    value: value,
                    color: color
                }
                deck.push(card)
            })
        })
    }

    //push one copy of 0, wild, and wild +4 for each color
    colors.forEach(color => {
        const card = {
            value: "0",
            color: color
        }
        deck.push(card)

        const wild = {
            value: "wild",
            color: "wild"
        }
        deck.push(wild)

        const plus4 = {
            value: "draw4",
            color: "wild"
        }
        deck.push(plus4)
    })

    return deck
}   

function shuffleDeck(deck) {
    var newDeck = [];
    var removeDeck = deck;
    for (var i = 0; i < removeDeck.length; i++) {
        const randomCardPlace = (Math.floor(Math.random() * (removeDeck.length - 0 + 1) + 0) )- 1
        const removedCard = removeDeck.splice(randomCardPlace, 1)[0]
        newDeck.push(removedCard)
    }
    return newDeck;
}

function dealCards(deck, playerList) {
    var dealtCards = []
    for (var i = 0; i < 7; i++) {
        playerList.forEach(player => {
            const cardDealt = {
                player: player.channel,
                card: deck.pop(),
            }
            dealtCards.push(cardDealt)
        })
    }
    return dealtCards
}

export {createDeck, shuffleDeck}
