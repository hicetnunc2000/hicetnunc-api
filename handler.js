const express = require('express')
const serverless = require('serverless-http')
const cors = require('cors')
const axios = require('axios')
const fetch = require('node-fetch')
require('dotenv').config()

const dev = 'https://api.better-call.dev/v1/contract/mainnet/KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton/tokens'

const app = express()
app.use(express.json())
app.use(cors({ origin: '*' }))

const sortByTokenId = (a, b) => {
  return b.id - a.id
}

const query_collection = `
  query collectorGallery($address: String!) {
    hic_et_nunc_token(where: {trades: {buyer: {address: {_eq: $address}}}}) {
      id
      artifact_uri
      thumbnail_uri
      timestamp
      mime
      title
      description
      supply
      token_tags {
        tag {
          tag
        }
      }
    }
  }
`;

async function fetchCollectionGraphQL(operationsDoc, operationName, variables) {
  const result = await fetch(
    "https://api.hicdex.com/v1/graphql",
    {
      method: "POST",
      body: JSON.stringify({
        query: operationsDoc,
        variables: variables,
        operationName: operationName
      })
    }
  );

  return await result.json();
}

async function fetchCollection(tz) {
  const { errors, data } = await fetchCollectionGraphQL(query_collection, "collectorGallery", { "address": tz });
  if (errors) {
    console.error(errors);
  }
  const result = data.hic_et_nunc_token
  console.log({ result })
  return result
}


const query_creations = `
query creatorGallery($address: String!) {
  hic_et_nunc_token(where: {creator: {address: {_eq: $address}}, _not: {token_holders: {holder: {address: {_eq: "tz1burnburnburnburnburnburnburjAYjjX"}}}}}) {
    id
    artifact_uri
    thumbnail_uri
    timestamp
    mime
    title
    description
    supply
    token_tags {
      tag {
        tag
      }
    }
  }
}
`

async function fetchCreationsGraphQL(operationsDoc, operationName, variables) {
  const result = await fetch(
    "https://api.hicdex.com/v1/graphql",
    {
      method: "POST",
      body: JSON.stringify({
        query: operationsDoc,
        variables: variables,
        operationName: operationName
      })
    }
  );
  return await result.json()
}

async function fetchCreations(tz) {
  const { errors, data } = await fetchCreationsGraphQL(query_creations, "creatorGallery", { "address": tz });
  if (errors) {
    console.error(errors);
  }
  const result = data.hic_et_nunc_token
  /* console.log({ result }) */
  return result
}

/*
async function fetchTagsGraphQL(operationsDoc, operationName, variables) {
  const result = await fetch(
    "https://api.hicdex.com/v1/graphql",
    {
      method: "POST",
      body: JSON.stringify({
        query: operationsDoc,
        variables: variables,
        operationName: operationName
      })
    }
  );
  return await result.json()
}

async function fetchTags(tz) {
  const { errors, data } = await fetchTagsGraphQL(query_creations, "tags", { "address": tz });
  if (errors) {
    console.error(errors);
  }
  const result = data.hic_et_nunc_token
  console.log(result)
  return result
}
*/

const getRestrictedAddresses = async () => {

  return await axios.get('https://raw.githubusercontent.com/hicetnunc2000/hicetnunc/main/filters/w.json').then(res => res.data)

}

app.post('/creations', async (req, res) => {

  let list = await getRestrictedAddresses()

  list.includes(req.body.tz)
    ?
    res.json({})
    :
    res.json(await fetchCreations(req.body.tz))

})

app.post('/collection', async (req, res) => {

  let list = await getRestrictedAddresses()

  list.includes(req.body.tz)
    ?
    res.json({})
    :
    res.json(await fetchCollection(req.body.tz))

})

app.get('/tag', async (req, res) => {
  await getTag(req, res)
})


app.listen(3002)
//module.exports.v3 = serverless(app)
