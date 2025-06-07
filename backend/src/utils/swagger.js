import swaggerJSDoc from "swagger-jsdoc";
import dotenv from "dotenv";

dotenv.config();

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
    servers: [
        {
            url: `http://localhost:${process.env.SERVER_PORT}`,
            description: "Server di sviluppo"
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        }
    },
    tags: [
        { name: "Utente", description: "Operazioni gestione utenti" },
        { name: "Crediti", description: "Operazioni sistema crediti" },
        { name: "Carte", description: "Operazioni gestione carte" },
        { name: "Scambi", description: "Operazioni sistema scambi" },
        { name: "Pacchetti", description: "Operazioni pacchetti carte" }
    ]
};

const options = {
    swaggerDefinition,
    apis: ["./src/controllers/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;