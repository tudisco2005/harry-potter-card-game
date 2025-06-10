// Questo script inizializza il database MongoDB
// Crea un utente non-root con permessi di lettura/scrittura
// Viene eseguito automaticamente quando il container MongoDB si avvia

db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE);

// Crea un utente per il database dell'applicazione
db.createUser({
  user: process.env.MONGO_APP_NOROOT_USERNAME,
  pwd: process.env.MONGO_APP_NOROOT_PASSWORD,
  roles: [
    {
      role: 'readWrite',
      db: process.env.MONGO_INITDB_DATABASE
    }
  ]
});

print(`Database inizializzato con successo: ${process.env.MONGO_APP_NOROOT_USERNAME}, ${process.env.MONGO_APP_NOROOT_PASSWORD}`);