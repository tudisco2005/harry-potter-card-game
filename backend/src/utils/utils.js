export function generateRandomCards(cards, numCards) {
    let extractedCards = [];

    for (let i = 0; i < numCards; i++) {
        const randomIndex = Math.floor(Math.random() * cards.length);
        extractedCards.push(cards[randomIndex]);
    }

    return extractedCards;
}