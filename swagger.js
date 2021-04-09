const swaggerAutogen = require('swagger-autogen')()

const doc = {
  info: {
      title: "Hic et Nunc API",
      description: "This API is used as the backend for https://hicetnunc.xyz. It consumes information from a number of Tezos blockchain information providers, including https://cryptonomic.github.io/ConseilJS/ and https://better-call.dev/docs, along with objkt metadata sourced from IPFS"
  },
  host: "localhost:3001",
  schemes: ['https','http'],
  definitions: {
    objkt: {
      "objectId": "24043",
      "ipfsHash": "QmXx8hY7nh41bFzEfXW1iiiKcEBJgsdkjvtMvP2Xj3o2Z7",
      "minter": "tz1eT35U51k1FxduLgFFTqrcYV4b6LRtTvUr",
      "swaps": [{ $ref: "#/definitions/swap" }],
      "token_info": { $ref: "#/definitions/token_info"},
      "token_id": "24043"
    },
    swap: {
      "swap_id": "24043",
      "objkt_id": "20987",
      "amount": "14",
      "xtz_per_objkt": "1000000"
    },
    token_info: {
      "name": "Neonland II",
      "description": "Circle",
      "tags": [
          "neon",
          "circle"
      ],
      "symbol": "OBJKT",
      "artifactUri": "ipfs://QmewqUfDNPf8ZV51Awwhs62nkEVHk6fBcivtEVZvpLn5Vi",
      "displayUri": "",
      "creators": [
          "tz1eT35U51k1FxduLgFFTqrcYV4b6LRtTvUr"
      ],
      "formats": [
          {
              "uri": "ipfs://QmewqUfDNPf8ZV51Awwhs62nkEVHk6fBcivtEVZvpLn5Vi",
              "mimeType": "image/png"
          }
      ],
      "thumbnailUri": "ipfs://QmNrhZHUaEqxhyLfqoq1mtHSipkWHeT31LNHb1QEbDHgnc",
      "decimals": 0,
      "isBooleanAmount": false,
      "shouldPreferSymbol": false
    }
  }
}

const outputFile = './swagger-output.json'
const endpointsFiles = ['./index.js']

/* NOTE: if you use the express Router, you must pass in the 
   'endpointsFiles' only the root file where the route starts,
   such as: index.js, app.js, routes.js, ... */

swaggerAutogen(outputFile, endpointsFiles, doc)