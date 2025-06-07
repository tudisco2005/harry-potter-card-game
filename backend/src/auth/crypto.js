/**
 * File per la gestione della crittografia delle password
 * Questo file fornisce funzioni per l'hashing e la verifica delle password
 * utilizzando la libreria Argon2, un algoritmo di hashing moderno e sicuro
 */

import argon2 from 'argon2';

/**
 * Genera un hash della password utilizzando Argon2
 * @param {string} password - Password in chiaro da hashare
 * @returns {Promise<string>} Hash della password
 */
async function hashPassword(password) {
    return await argon2.hash(password);
}

/**
 * Verifica se una password corrisponde al suo hash
 * @param {string} password - Password in chiaro da verificare
 * @param {string} hash - Hash della password da confrontare
 * @returns {Promise<boolean>} True se la password corrisponde all'hash, false altrimenti
 */
async function verifyPassword(password, hash) {
    return await argon2.verify(hash, password);
}

export { hashPassword, verifyPassword };