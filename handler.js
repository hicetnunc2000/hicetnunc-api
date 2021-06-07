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

const query_feed = `
query LatestFeed($lastId: bigint = 99999999) {
  hic_et_nunc_token(order_by: {id: desc}, limit: 50, where: {id: {_lt: $lastId}, artifact_uri: {_neq: ""}}) {
    artifact_uri
    display_uri
    creator_id
    id
    mime
    thumbnail_uri
    timestamp
    title
  }
}
`

const query_objkt = `
query objkt($id: bigint!) {
  hic_et_nunc_token_by_pk(id: $id) {
    mime
    timestamp
    display_uri
    description
    artifact_uri
    creator {
      address
    }
    thumbnail_uri
    title
    supply
    royalties
    swaps(where: {status: {_eq: "0"}}) {
      amount_left
      price
      creator {
        address
      }
    }
    token_holders(where: {quantity: {_gt: "0"}}) {
      holder_id
      quantity
    }
    token_tags {
      tag {
        tag
      }
    }
    trades(order_by: {timestamp: asc}) {
      amount
      swap {
        price
      }
      seller {
        address
      }
      buyer {
        address
      }
      timestamp
    }
  }
}
`

const query_collection = `
query collectorGallery($address: String!) {
  hic_et_nunc_token_holder(where: {holder_id: {_eq: $address}, token: {creator: {address: {_neq: $address}}}, quantity: {_gt: "0"}}, order_by: {token_id: desc}) {
    token {
      id
      artifact_uri
      display_uri
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
      creator {
        address
      }
    }
  }
}
`

const query_creations = `
query creatorGallery($address: String!) {
  hic_et_nunc_token(where: {creator: {address: {_eq: $address}}, supply: {_gt: 0}}, order_by: {id: desc}) {
    id
    artifact_uri
    display_uri
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

async function fetchGraphQL(operationsDoc, operationName, variables) {
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

//
// OBJKT
//

async function fetchObjkt(id) {
  const { errors, data } = await fetchGraphQL(query_objkt, "objkt", { "id": id });
  if (errors) {
    console.error(errors);
  }
  const result = data.hic_et_nunc_token_by_pk
  console.log({ result })
  return result
}

//
// Collection
//

async function fetchCollection(tz) {
  const { errors, data } = await fetchGraphQL(query_collection, "collectorGallery", { "address": tz });
  if (errors) {
    console.error(errors);
  }
  const result = data.hic_et_nunc_token_holder
  console.log({ result })
  return result
}

//
// Creations
//

async function fetchCreations(tz) {
  const { errors, data } = await fetchGraphQL(query_creations, "creatorGallery", { "address": tz });
  if (errors) {
    console.error(errors);
  }
  const result = data.hic_et_nunc_token
  /* console.log({ result }) */
  return result
}

async function fetchFeed(lastId) {
  const { errors, data } = await fetchGraphQL(query_feed, "LatestFeed", { "lastId": lastId });
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

app.post('/objkt', async (req, res) => {

  //let list = await getRestrictedObjkts()
  res.json(await fetchObjkt(req.body.id))
})

app.post('/feed', async (req, res) => {
  res.json(await fetchFeed(req.body.lastId))
})

app.get('/tag', async (req, res) => {
  await getTag(req, res)
})

//app.listen(3002)
module.exports.v3 = serverless(app)
