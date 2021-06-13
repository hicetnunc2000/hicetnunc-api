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
    id
    mime
    timestamp
    display_uri
    description
    artifact_uri
    creator {
      address
      name
    }
    thumbnail_uri
    title
    supply
    royalties
    swaps(where: {status: {_eq: "0"}}) {
      amount_left
      id
      price
      creator {
        address
        name
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
    creator {
      name
    }
    token_tags {
      tag {
        tag
      }
    }
  }
}
`

const query_hdao = `query hDAOFeed($offset: Int = 0) {
  hic_et_nunc_token(order_by: {hdao_balance: desc}, limit: 50, where: {hdao_balance: {_gt: 100}}, offset: $offset) {
    artifact_uri
    display_uri
    creator_id
    id
    mime
    thumbnail_uri
    timestamp
    title
    hdao_balance
  }
}`

const query_tag = `query ObjktsByTag($tag: String = "3d", $lastId: bigint = 99999999) {
  hic_et_nunc_token(where: {token_tags: {tag: {tag: {_eq: $tag}}}, id: {_lt: $lastId}, supply: {_gt: "0"}}, limit: 250, order_by: {id: desc}) {
    id
    title
  }
}`

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
// Random
//

async function fetchObjkts(ids) {
  console.log(ids)
  const { errors, data } = await fetchGraphQL(`
    query Objkts($_in: [bigint!] = "") {
      hic_et_nunc_token(where: { id: {_in: $_in}}) {
        title
      }
    }`, "Objkts", { "id" : ids });
    console.log(data)
  return data.hic_et_nunc_token
}

async function getLastId() {
  const { errors, data } = await fetchGraphQL(`
    query LastId {
      hic_et_nunc_token(limit: 1, order_by: {id: desc}) {
        id
      }
    }`, "LastId");
  return data.hic_et_nunc_token[0].id
}

function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

async function fetchRandom() {
  const firstId = 156
  const lastId = await getLastId()

  const uniqueIds = new Set()
  while (uniqueIds.size < 50) {
    uniqueIds.add(rnd(firstId, lastId))
  }
  console.log(uniqueIds)

  return fetchObjkts(Array.from(uniqueIds))
}

//
// OBJKT
//

async function fetchObjkt(id) {
  const { errors, data } = await fetchGraphQL(query_objkt, "objkt", { "id" : id });
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

//
// hDAO
//

async function fetchHdao(offset) {
  const { errors, data } = await fetchGraphQL(query_hdao, "hDAOFeed", { "offset": offset });
  if (errors) {
    console.error(errors);
  }
  const result = data.hic_et_nunc_token
  /* console.log({ result }) */
  return result
}

//
// Tags
//

async function fetchTag(tag) {
  const { errors, data } = await fetchGraphQL(query_tag, "ObjktsByTag", { "tag" : tag });
  if (errors) {
    console.error(errors);
  }
  const result = data.hic_et_nunc_token
  /* console.log({ result }) */
  return result
}


const getRestrictedAddresses = async () => await axios.get('https://raw.githubusercontent.com/hicetnunc2000/hicetnunc/main/filters/w.json').then(res => res.data)

const getRestrictedObjkts = async () => await axios.get('https://raw.githubusercontent.com/hicetnunc2000/hicetnunc/main/filters/o.json').then(res => res.data)

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

app.post('/hdao', async (req, res) => {
  res.json(await fetchHdao(req.body.offset))
})

app.post('/random', async (req, res) => {
  res.json(await fetchRandom())
})

app.post('/tag', async (req, res) => {
  res.json(await fetchTag(req.body.tag))
})

app.post('/subjkt', async (req, res) => {
  res.json(await fetchSubjkt(req.body.subjkt))
})
// 1/1

app.listen(3002)
//module.exports.v3 = serverless(app)
