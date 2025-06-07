/**
 * File per le funzioni di utilità generali
 * Questo file contiene funzioni di supporto utilizzate in varie parti dell'applicazione
 */

/**
 * Estrae un numero specificato di carte casuali da un array di carte
 * @param {Array} cards - Array di carte da cui estrarre
 * @param {number} numCards - Numero di carte da estrarre
 * @returns {Array} Array di carte estratte casualmente
 * @example
 * const cards = [{id: 1}, {id: 2}, {id: 3}];
 * const extracted = generateRandomCards(cards, 2);
 * // Risultato possibile: [{id: 1}, {id: 3}]
 */
export function generateRandomCards(cards, numCards) {
    let extractedCards = [];

    for (let i = 0; i < numCards; i++) {
        const randomIndex = Math.floor(Math.random() * cards.length);
        extractedCards.push(cards[randomIndex]);
    }

    return extractedCards;
}