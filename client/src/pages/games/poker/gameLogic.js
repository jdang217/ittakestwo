
const createDeck = function() {
    var deck = []
    const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const suits = ["Hearts", "Diamonds", "Spades", "Clubs"]

    suits.forEach(suit => {
        values.forEach(value => {
            const card = {
                value: value,
                suit: suit,
            }
            deck.push(card)
        })
    })

    return deck;
}

const shuffleDeck = function(deck) {
    var newDeck = [];
    var removeDeck = deck;
    for (var i = 0; i < 52; i++) {
        const randomCardPlace = (Math.floor(Math.random() * (removeDeck.length - 0 + 1) + 0) )- 1
        const removedCard = removeDeck.splice(randomCardPlace, 1)[0]
        newDeck.push(removedCard)
    }
    return newDeck;
}

const dealCards = function(deck, playerList) {
    var dealtCards = []
    for (var i = 0; i < 2; i++) {
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

const performflop = function(deck) {
    //discard one card
    deck.pop();

    var flop = []
    for (var i = 0; i < 3; i++) {
        flop.push(deck.pop())
    }
    //put next card into play
    return flop;
}

const burnAndTurn = function(deck) {
    //discard one card
    deck.pop();

    //put next card into play
    return deck.pop();
}

export {createDeck, shuffleDeck, dealCards, burnAndTurn, performflop};