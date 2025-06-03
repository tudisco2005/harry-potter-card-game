import jsonwebtoken from 'jsonwebtoken';
import blacklistSchema from '../controllers/blacklist.js';
import dotenv from 'dotenv';

dotenv.config();

// check if config field are not null
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET non è definito nelle variabili d\'ambiente');
}

if (!process.env.JWT_EXPIRATION) {
  throw new Error('JWT_EXPIRATION non è definito nelle variabili d\'ambiente');
}

export const generateToken = (user) => {
    if (!user || !user._id || !user.username) {
        throw new Error('oggetto utente non valido per la generazione del token');
    }
    const token = jsonwebtoken.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
    );

    if (!token) {
        console.error("[-] Fallita generazione del token JWT:", user);
        throw new Error('Fallita generazione del token JWT');
    }

    console.log("[+] JWT token generato con successo:", token);
    return token;
};

export const verifyToken = (token) => {
  try {
    return jsonwebtoken.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error("[-] JWT token verifica fallita:", error);
  }
};

export const authenticateUser = async (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1]
    if (!token) {
        return res.status(401).send({ message: "Accesso negato. Nessun token fornito." });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).send({ message: "Token non valido." });
    }

    // check if the token is in blacklist
    try{
      const result = await blacklistSchema.findOne({ tokenId: token });
      if (result) {
          // Token trovato nella blacklist
          console.log("[-] Token trovato nella blacklist:", token);

          return res.status(401).send({ message: "Token non valido." });
      }
    } catch (err) {
      console.error("[-] Errore durante il controllo della blacklist:", err);
      return res.status(500).send({ message: "Errore interno del server." });
    }

    req.user = decoded;
    next();
};