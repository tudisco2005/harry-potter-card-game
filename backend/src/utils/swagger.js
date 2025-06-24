/**
 * File per la configurazione della documentazione Swagger
 * Questo file definisce la configurazione per la generazione automatica
 * della documentazione API utilizzando Swagger/OpenAPI
 */

import swaggerJSDoc from "swagger-jsdoc";
import dotenv from "dotenv";

// Caricamento delle variabili d'ambiente
dotenv.config();

/**
 * Definizione della configurazione Swagger
 * Contiene tutte le informazioni necessarie per generare la documentazione API
 */
const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "API Gioco Carte Marvel",
        version: "1.0.0",
        description: `
            # Documentazione API Gioco Carte Hogwars

            Questa API permette agli utenti di collezionare, scambiare e gestire carte digitali dei personaggi del mondo di Harry potter.

            ## Funzionalità Principali
            - Gestione utenti (registrazione, autenticazione, profilo)
            - Sistema crediti per acquisto pacchetti
            - Collezione e gestione carte
            - Sistema di scambio tra utenti
            - Integrazione con API Harry Potter per dettagli aggiuntivi delle carte

            ## Autenticazione
            La maggior parte degli endpoint richiede autenticazione JWT tramite token Bearer nell'header Authorization.

            ## URL Base
            Tutti gli endpoint sono prefissati con /api/
        `,
        contact: {
            name: "Supporto API",
            email: "supporto@marvelcardgame.com"
        },
        license: {
            name: "MIT",
            url: "https://opensource.org/licenses/MIT"
        }
    },
    // Configurazione dei server disponibili
    servers: [
        {
            url: `http://localhost:${process.env.SERVER_PORT}`,
            description: "Server di sviluppo"
        }
    ],
    // Definizione dei componenti di sicurezza
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "Bearer",
                bearerFormat: "JWT"
            }
        }
    },
    // Definizione dei tag per organizzare gli endpoint
    tags: [
        { name: "Utente", description: "Operazioni gestione utenti" },
        { name: "Crediti", description: "Operazioni sistema crediti" },
        { name: "Carte", description: "Operazioni gestione carte" },
        { name: "Scambi", description: "Operazioni sistema scambi" },
        { name: "Pacchetti", description: "Operazioni pacchetti carte" }
    ]
};

/**
 * Opzioni per la generazione della documentazione Swagger
 */
const options = {
    swaggerDefinition,
    apis: ["./src/controllers/*.js"], // Percorso dei file contenenti le annotazioni Swagger
};

// Generazione della specifica Swagger
const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;