/**
 * File per la gestione dell'autenticazione e dei token JWT
 * Questo file gestisce la generazione, verifica e validazione dei token JWT
 * per l'autenticazione degli utenti
 */

import jsonwebtoken from 'jsonwebtoken';
import blacklistModel from '../models/blacklist.js';
import dotenv from 'dotenv';

// Caricamento delle variabili d'ambiente
dotenv.config();

// ==========================================
// VERIFICA CONFIGURAZIONE
// ==========================================

// Verifica che le variabili d'ambiente necessarie siano definite
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET non è definito nelle variabili d\'ambiente');
}

if (!process.env.JWT_EXPIRATION) {
  throw new Error('JWT_EXPIRATION non è definito nelle variabili d\'ambiente');
}

/**
 * Genera un nuovo token JWT per un utente
 * @param {Object} user - Oggetto utente contenente _id e username
 * @returns {string} Token JWT generato
 * @throws {Error} Se l'oggetto utente non è valido o la generazione del token fallisce
 */
export const generateToken = (user) => {
    // Verifica che l'oggetto utente contenga i campi necessari
    if (!user || !user._id || !user.username) {
        throw new Error('oggetto utente non valido per la generazione del token');
    }

    // Generazione del token JWT
    const token = jsonwebtoken.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
    );

    // Verifica che il token sia stato generato correttamente
    if (!token) {
        console.error("[-] Fallita generazione del token JWT:", user);
        throw new Error('Fallita generazione del token JWT');
    }

    console.log("[+] JWT token generato con successo:", token);
    return token;
};

/**
 * Verifica la validità di un token JWT
 * @param {string} token - Token JWT da verificare
 * @returns {Object|null} Payload del token se valido, null altrimenti
 */
export const verifyToken = (token) => {
  try {
    return jsonwebtoken.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error("[-] JWT token verifica fallita:", error);
  }
};

/**
 * Middleware per l'autenticazione delle richieste
 * Verifica la presenza e validità del token JWT nell'header Authorization
 * @param {Object} req - Oggetto request Express
 * @param {Object} res - Oggetto response Express
 * @param {Function} next - Funzione next Express
 */
export const authenticateUser = async (req, res, next) => {
    // Verifica la presenza del token nell'header Authorization
    if(!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
      return res.status(401).send({ message: "Accesso negato. Token non fornito." });
    }

    // Estrazione e verifica del token
    const token = req.headers.authorization.split(" ")[1]
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).send({ message: "Token non valido." });
    }

    // Verifica che il token non sia nella blacklist
    try{
      const result = await blacklistModel.findOne({ tokenId: token });
      if (result) {
          console.log("[-] Token trovato nella blacklist:", token);
          return res.status(401).send({ message: "Token non valido." });
      }
    } catch (err) {
      console.error("[-] Errore durante il controllo della blacklist:", err);
      return res.status(500).send({ message: "Errore interno del server." });
    }

    // Aggiunta delle informazioni dell'utente alla richiesta
    req.userId = decoded.id;
    req.token = token;
    next();
};