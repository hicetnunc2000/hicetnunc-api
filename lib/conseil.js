const conseiljs = require('conseiljs')
const fetch = require('node-fetch')
const log = require('loglevel')
const BigNumber = require('bignumber.js')
const axios = require('axios')
const _ = require('lodash')
const Bottleneck = require("bottleneck/es5");

const logger = log.getLogger('conseiljs')
logger.setLevel('error', false)
conseiljs.registerLogger(logger)
conseiljs.registerFetch(fetch)
const conseilServer = 'https://conseil-prod.cryptonomic-infra.tech'
const conseilApiKey = 'aa73fa8a-8626-4f43-a605-ff63130f37b1' // signup at nautilus.cloud
const mainnet = require('./config').networkConfig
// In order to speed up queries we need to limit some feed results to only new 
// items and transactions :( 
const LATEST_EPOCH = 1424923
const MILLISECOND_MODIFIER = 1000
const ONE_MINUTE_MILLIS = 60 * MILLISECOND_MODIFIER
const ONE_HOUR_MILLIS = 60 * ONE_MINUTE_MILLIS
const ONE_DAY_MILLIS = 24 * ONE_HOUR_MILLIS
const ONE_WEEK_MILLIS = 7 * ONE_DAY_MILLIS

Map.prototype.mapMap = function(callback) {
  const output = new Map()
  this.forEach((element, key)=>{
    output.set(key, callback(element, key))
  })
  return output
}

Array.prototype.sum = Array.prototype.sum || function (){
  return this.reduce(function(p,c){return p+c},0);
};

Array.prototype.avg = Array.prototype.avg || function () {
  return this.sum()/this.length; 
};

const _getMinTime = () => {
  var d = new Date()
  d.setDate(d.getDate() - 14)
  return  d.getTime()
}

const _subtractWeek = (timestamp) => {
  return timestamp - ONE_WEEK_MILLIS
}

const _subtractDays = (timestamp, days) => {
  return timestamp - (ONE_DAY_MILLIS * days)
}

const _subtractHours = (timestamp, hours) => {
  return timestamp - (ONE_HOUR_MILLIS * hours)
}

const _floorTimeToMinute = (currentTime) => {
  return Math.floor(currentTime / ONE_MINUTE_MILLIS) * ONE_MINUTE_MILLIS
}

const _getTimeQuantizedToMinute = () => {
  return _floorTimeToMinute((new Date()).getTime())
} 


async function getBackendConfig() {
  return (
    await axios.get(
      'https://raw.githubusercontent.com/hicetnunc2000/hicetnunc/main/config/backend_vars.json'
    )
  ).data
}


const hDAOFeed = async () => {
  let hDAOQuery = conseiljs.ConseilQueryBuilder.blankQuery()
  hDAOQuery = conseiljs.ConseilQueryBuilder.addFields(hDAOQuery, 'key', 'value')
  hDAOQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    hDAOQuery,
    'big_map_id',
    conseiljs.ConseilOperator.EQ,
    [mainnet.curationsPtr]
  )
  hDAOQuery = conseiljs.ConseilQueryBuilder.setLimit(hDAOQuery, 300_000)

  let hDAOResult = await conseiljs.TezosConseilClient.getTezosEntityData(
    { url: conseilServer, apiKey: conseilApiKey, network: 'mainnet' },
    'mainnet',
    'big_map_contents',
    hDAOQuery
  )
  return hDAOResult.map((e) => {
    return {
      token_id: parseInt(e.key),
      hDAO_balance: parseInt(e.value.split(' ')[1]),
    }
  })
}

const getObjkthDAOBalance = async (token_id) => {
  token_id = (typeof token_id === 'string') ? token_id : token_id.toString()
  let hDAOQuery = conseiljs.ConseilQueryBuilder.blankQuery()
  hDAOQuery = conseiljs.ConseilQueryBuilder.addFields(hDAOQuery, 'key', 'value')
  hDAOQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    hDAOQuery,
    'big_map_id',
    conseiljs.ConseilOperator.EQ,
    [mainnet.curationsPtr]
  )
  hDAOQuery = conseiljs.ConseilQueryBuilder.addPredicate(hDAOQuery, 'key', conseiljs.ConseilOperator.EQ, [token_id])
  hDAOQuery = conseiljs.ConseilQueryBuilder.setLimit(hDAOQuery, 1)

  let hDAOResult = await conseiljs.TezosConseilClient.getTezosEntityData(
    { url: conseilServer, apiKey: conseilApiKey, network: 'mainnet' },
    'mainnet',
    'big_map_contents',
    hDAOQuery
  )
  if (hDAOResult.length == 1) {
    return hDAOResult.map((e) => {
      return parseInt(e.value.split(' ')[1])
    })[0]
  }
  return 0
}

/**
 * Returns a list of nft token ids and amounts that a given address owns.
 *
 * @param {string} address
 * @returns
 */
const getCollectionForAddress = async (address) => {
  let collectionQuery = conseiljs.ConseilQueryBuilder.blankQuery()
  collectionQuery = conseiljs.ConseilQueryBuilder.addFields(
    collectionQuery,
    'key',
    'value',
    'operation_group_id'
  )
  collectionQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    collectionQuery,
    'big_map_id',
    conseiljs.ConseilOperator.EQ,
    [mainnet.nftLedger]
  )
  collectionQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    collectionQuery,
    'key',
    conseiljs.ConseilOperator.STARTSWITH,
    [`Pair 0x${conseiljs.TezosMessageUtils.writeAddress(address)}`]
  )
  collectionQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    collectionQuery,
    'value',
    conseiljs.ConseilOperator.EQ,
    [0],
    true
  )
  collectionQuery = conseiljs.ConseilQueryBuilder.setLimit(
    collectionQuery,
    300_000
  )

  const collectionResult = await conseiljs.TezosConseilClient.getTezosEntityData(
    { url: conseilServer, apiKey: conseilApiKey, network: 'mainnet' },
    'mainnet',
    'big_map_contents',
    collectionQuery
  )
  let collection = collectionResult.map((i) => {
    return {
      piece: i['key'].toString().replace(/.* ([0-9]{1,}$)/, '$1'),
      amount: Number(i['value']),
      opId: i['operation_group_id'],
    }
  })

  const queryChunks = chunkArray(
    collection.map((i) => i.piece),
    50
  ) // NOTE: consider increasing this number somewhat
  const makeObjectQuery = (keys) => {
    let mintedObjectsQuery = conseiljs.ConseilQueryBuilder.blankQuery()
    mintedObjectsQuery = conseiljs.ConseilQueryBuilder.addFields(
      mintedObjectsQuery,
      'key_hash',
      'value'
    )
    mintedObjectsQuery = conseiljs.ConseilQueryBuilder.addPredicate(
      mintedObjectsQuery,
      'big_map_id',
      conseiljs.ConseilOperator.EQ,
      [mainnet.nftMetadataMap]
    )
    mintedObjectsQuery = conseiljs.ConseilQueryBuilder.addPredicate(
      mintedObjectsQuery,
      'key',
      keys.length > 1
        ? conseiljs.ConseilOperator.IN
        : conseiljs.ConseilOperator.EQ,
      keys
    )
    mintedObjectsQuery = conseiljs.ConseilQueryBuilder.setLimit(
      mintedObjectsQuery,
      keys.length
    )

    return mintedObjectsQuery
  }

  const objectQueries = queryChunks.map((c) => makeObjectQuery(c))
  const objectIpfsMap = {}
  await Promise.all(
    objectQueries.map(
      async (q) =>
        await conseiljs.TezosConseilClient.getTezosEntityData(
          { url: conseilServer, apiKey: conseilApiKey, network: 'mainnet' },
          'mainnet',
          'big_map_contents',
          q
        ).then((result) =>
          result.map((row) => {
            const objectId = row['value']
              .toString()
              .replace(/^Pair ([0-9]{1,}) .*/, '$1')
            const objectUrl = row['value']
              .toString()
              .replace(/.* 0x([0-9a-z]{1,}) \}$/, '$1')
            const ipfsHash = Buffer.from(objectUrl, 'hex').toString().slice(7)

            objectIpfsMap[objectId] = ipfsHash
          })
        )
    )
  )

  const operationGroupIds = collectionResult.map((r) => r.operation_group_id)
  const priceQueryChunks = chunkArray(operationGroupIds, 30)
  const makeLastPriceQuery = (opIds) => {
    let lastPriceQuery = conseiljs.ConseilQueryBuilder.blankQuery()
    lastPriceQuery = conseiljs.ConseilQueryBuilder.addFields(
      lastPriceQuery,
      'timestamp',
      'amount',
      'operation_group_hash',
      'parameters_entrypoints',
      'parameters'
    )
    lastPriceQuery = conseiljs.ConseilQueryBuilder.addPredicate(
      lastPriceQuery,
      'kind',
      conseiljs.ConseilOperator.EQ,
      ['transaction']
    )
    lastPriceQuery = conseiljs.ConseilQueryBuilder.addPredicate(
      lastPriceQuery,
      'status',
      conseiljs.ConseilOperator.EQ,
      ['applied']
    )
    lastPriceQuery = conseiljs.ConseilQueryBuilder.addPredicate(
      lastPriceQuery,
      'internal',
      conseiljs.ConseilOperator.EQ,
      ['false']
    )
    lastPriceQuery = conseiljs.ConseilQueryBuilder.addPredicate(
      lastPriceQuery,
      'operation_group_hash',
      opIds.length > 1
        ? conseiljs.ConseilOperator.IN
        : conseiljs.ConseilOperator.EQ,
      opIds
    )
    lastPriceQuery = conseiljs.ConseilQueryBuilder.setLimit(
      lastPriceQuery,
      opIds.length
    )

    return lastPriceQuery
  }

  const priceQueries = priceQueryChunks.map((c) => makeLastPriceQuery(c))
  const priceMap = {}
  await Promise.all(
    priceQueries.map(
      async (q) =>
        await conseiljs.TezosConseilClient.getTezosEntityData(
          { url: conseilServer, apiKey: conseilApiKey, network: 'mainnet' },
          'mainnet',
          'operations',
          q
        ).then((result) =>
          result.map((row) => {
            let amount = 0
            const action = row.parameters_entrypoints

            if (action === 'collect') {
              amount = Number(
                row.parameters.toString().replace(/^Pair ([0-9]+) [0-9]+/, '$1')
              )
            } else if (action === 'transfer') {
              amount = Number(
                row.parameters
                  .toString()
                  .replace(
                    /[{] Pair \"[1-9A-HJ-NP-Za-km-z]{36}\" [{] Pair \"[1-9A-HJ-NP-Za-km-z]{36}\" [(]Pair [0-9]+ [0-9]+[)] [}] [}]/,
                    '$1'
                  )
              )
            }

            priceMap[row.operation_group_hash] = {
              price: new BigNumber(row.amount),
              amount,
              timestamp: row.timestamp,
              action,
            }
          })
        )
    )
  )

  collection = collection.map((i) => {
    let price = 0
    let receivedOn = new Date()
    let action = ''

    try {
      const priceRecord = priceMap[i.opId]
      price = priceRecord.price
        .dividedToIntegerBy(priceRecord.amount)
        .toNumber()
      receivedOn = new Date(priceRecord.timestamp)
      action = priceRecord.action === 'collect' ? 'Purchased' : 'Received'
    } catch {
      //
    }

    delete i.opId

    return {
      price: isNaN(price) ? 0 : price,
      receivedOn,
      action,
      ipfsHash: objectIpfsMap[i.piece.toString()],
      ...i,
    }
  })

  return collection.sort(
    (a, b) => b.receivedOn.getTime() - a.receivedOn.getTime()
  ) // sort descending by date – most-recently acquired art first
}

const gethDaoBalanceForAddress = async (address) => {
  console.log('gethDaoBalanceForAddress', address)
  let hDaoBalanceQuery = conseiljs.ConseilQueryBuilder.blankQuery()
  hDaoBalanceQuery = conseiljs.ConseilQueryBuilder.addFields(
    hDaoBalanceQuery,
    'value'
  )
  hDaoBalanceQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    hDaoBalanceQuery,
    'big_map_id',
    conseiljs.ConseilOperator.EQ,
    [mainnet.daoLedger]
  )
  hDaoBalanceQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    hDaoBalanceQuery,
    'key',
    conseiljs.ConseilOperator.EQ,
    [`Pair 0x${conseiljs.TezosMessageUtils.writeAddress(address)} 0`]
  )
  hDaoBalanceQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    hDaoBalanceQuery,
    'value',
    conseiljs.ConseilOperator.EQ,
    [0],
    true
  )
  hDaoBalanceQuery = conseiljs.ConseilQueryBuilder.setLimit(hDaoBalanceQuery, 1)

  let balance = 0

  try {
    const balanceResult = await conseiljs.TezosConseilClient.getTezosEntityData(
      { url: conseilServer, apiKey: conseilApiKey, network: 'mainnet' },
      'mainnet',
      'big_map_contents',
      hDaoBalanceQuery
    )
    balance = balanceResult[0]['value'] // TODO: consider bigNumber here, for the moment there is no reason for it
  } catch (error) {
    console.log(
      `gethDaoBalanceForAddress failed for ${JSON.stringify(
        hDaoBalanceQuery
      )} with ${error}`
    )
  }

  return balance
}

const getTokenBalance = async (
  big_map_id,
  address,
  fa2 = false,
  token_id = 0
) => {
  let tokenBalanceQuery = conseiljs.ConseilQueryBuilder.blankQuery()
  tokenBalanceQuery = conseiljs.ConseilQueryBuilder.addFields(
    tokenBalanceQuery,
    'value'
  )
  tokenBalanceQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    tokenBalanceQuery,
    'big_map_id',
    conseiljs.ConseilOperator.EQ,
    [big_map_id]
  )
  if (fa2) {
    tokenBalanceQuery = conseiljs.ConseilQueryBuilder.addPredicate(
      tokenBalanceQuery,
      'key',
      conseiljs.ConseilOperator.EQ,
      [
        `Pair 0x${conseiljs.TezosMessageUtils.writeAddress(
          address
        )} ${token_id}`,
      ]
    )
  } else {
    tokenBalanceQuery = conseiljs.ConseilQueryBuilder.addPredicate(
      tokenBalanceQuery,
      'key',
      conseiljs.ConseilOperator.EQ,
      [`0x${conseiljs.TezosMessageUtils.writeAddress(address)}`]
    )
  }
  tokenBalanceQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    tokenBalanceQuery,
    'value',
    conseiljs.ConseilOperator.EQ,
    [0],
    true
  )
  tokenBalanceQuery = conseiljs.ConseilQueryBuilder.setLimit(
    tokenBalanceQuery,
    1
  )

  let balance = 0

  try {
    const balanceResult = await conseiljs.TezosConseilClient.getTezosEntityData(
      { url: conseilServer, apiKey: conseilApiKey, network: 'mainnet' },
      'mainnet',
      'big_map_contents',
      tokenBalanceQuery
    )
    balance = balanceResult[0]['value'] // TODO: consider bigNumber here, for the moment there is no reason for it
  } catch (error) {
    console.log(
      `getTokenBalance failed for ${JSON.stringify(
        tokenBalanceQuery
      )} with ${error}`
    )
  }

  return balance
}

const getTezBalanceForAddress = async (address) => {
  let accountQuery = conseiljs.ConseilQueryBuilder.blankQuery()
  accountQuery = conseiljs.ConseilQueryBuilder.addFields(
    accountQuery,
    'balance'
  )
  accountQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    accountQuery,
    'account_id',
    conseiljs.ConseilOperator.EQ,
    [address],
    false
  )
  accountQuery = conseiljs.ConseilQueryBuilder.setLimit(accountQuery, 1)

  try {
    const balanceResult = await conseiljs.TezosConseilClient.getTezosEntityData(
      { url: conseilServer, apiKey: conseilApiKey, network: 'mainnet' },
      'mainnet',
      'accounts',
      accountQuery
    )
    balance = balanceResult[0]['balance'] // TODO: consider bigNumber here, for the moment there is no reason for it
  } catch (error) {
    console.log(
      `getTezBalanceForAddress failed for ${JSON.stringify(
        accountQuery
      )} with ${error}`
    )
  }

  return balance
}

const gethDAOPerTez = async (address) => {
  const tezBalance = await getTezBalanceForAddress(address)
  const hdaoBalance = await gethDaoBalanceForAddress(address)
  return hdaoBalance / Math.max(tezBalance,1)
}

const getKolibriPerTez = async (address) => {
  const tezBalance = await getTezBalanceForAddress(address)
  var kolibriBalance = await getTokenBalance(
    mainnet.kolibriLedger,
    address
  )

  // TODO: Find a better way to get the balance, this is FA1.2, mike?
  kolibriBalance =
    parseInt(kolibriBalance.replace('Pair {} ', '')) / 10 ** (18 - 6)
  return kolibriBalance / Math.max(tezBalance,1)
}

const gethDaoBalances = async () => {
  let hDaoBalanceQuery = conseiljs.ConseilQueryBuilder.blankQuery()
  hDaoBalanceQuery = conseiljs.ConseilQueryBuilder.addFields(
    hDaoBalanceQuery,
    'key',
    'value'
  )
  hDaoBalanceQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    hDaoBalanceQuery,
    'big_map_id',
    conseiljs.ConseilOperator.EQ,
    [mainnet.daoLedger]
  )
  hDaoBalanceQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    hDaoBalanceQuery,
    'value',
    conseiljs.ConseilOperator.EQ,
    [0],
    true
  )
  hDaoBalanceQuery = conseiljs.ConseilQueryBuilder.setLimit(
    hDaoBalanceQuery,
    500_000
  )

  let balance = 0
  let hdaoMap = {}

  try {
    const balanceResult = await conseiljs.TezosConseilClient.getTezosEntityData(
      { url: conseilServer, apiKey: conseilApiKey, network: 'mainnet' },
      'mainnet',
      'big_map_contents',
      hDaoBalanceQuery
    )

    balanceResult.forEach((row) => {
      hdaoMap[
        conseiljs.TezosMessageUtils.readAddress(
          row['key'].toString().replace(/^Pair 0x([0-9a-z]{1,}) [0-9]+/, '$1')
        )
      ] = parseInt(row['value'])
    })
    //#balance = balanceResult[0]['value'] // TODO: consider bigNumber here, for the moment there is no reason for it
  } catch (error) {
    console.log(
      `gethDaoBalanceForAddress failed for ${JSON.stringify(
        hDaoBalanceQuery
      )} with ${error}`
    )
  }

  return hdaoMap
}

const getObjektOwners = async (objekt_id) => {
  let objektBalanceQuery = conseiljs.ConseilQueryBuilder.blankQuery()
  objektBalanceQuery = conseiljs.ConseilQueryBuilder.addFields(
    objektBalanceQuery,
    'key',
    'value'
  )
  objektBalanceQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    objektBalanceQuery,
    'big_map_id',
    conseiljs.ConseilOperator.EQ,
    [mainnet.nftLedger]
  )
  objektBalanceQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    objektBalanceQuery,
    'key',
    conseiljs.ConseilOperator.ENDSWITH,
    [` ${objekt_id}`],
    false
  )
  objektBalanceQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    objektBalanceQuery,
    'value',
    conseiljs.ConseilOperator.EQ,
    [0],
    true
  )
  objektBalanceQuery = conseiljs.ConseilQueryBuilder.setLimit(
    objektBalanceQuery,
    500_000
  )

  let objektMap = {}

  try {
    const balanceResult = await conseiljs.TezosConseilClient.getTezosEntityData(
      { url: conseilServer, apiKey: conseilApiKey, network: 'mainnet' },
      'mainnet',
      'big_map_contents',
      objektBalanceQuery
    )

    balanceResult.forEach((row) => {
      objektMap[
        conseiljs.TezosMessageUtils.readAddress(
          row['key'].toString().replace(/^Pair 0x([0-9a-z]{1,}) [0-9]+/, '$1')
        )
      ] = row['value']
    })
    //#balance = balanceResult[0]['value'] // TODO: consider bigNumber here, for the moment there is no reason for it
  } catch (error) {
    console.log(
      `getObjektOwners failed for ${JSON.stringify(
        objektBalanceQuery
      )} with ${error}`
    )
  }

  return objektMap
}

const getObjektMintingsDuringPeriod = async (min_time, max_time) => {
  let mintOperationQuery = conseiljs.ConseilQueryBuilder.blankQuery()
  mintOperationQuery = conseiljs.ConseilQueryBuilder.addFields(
    mintOperationQuery,
    'source'
  )
  mintOperationQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    mintOperationQuery,
    'kind',
    conseiljs.ConseilOperator.EQ,
    ['transaction']
  )
  mintOperationQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    mintOperationQuery,
    'timestamp',
    conseiljs.ConseilOperator.BETWEEN,
    [min_time, max_time]
  ) // 2021 Feb 1
  mintOperationQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    mintOperationQuery,
    'status',
    conseiljs.ConseilOperator.EQ,
    ['applied']
  )
  mintOperationQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    mintOperationQuery,
    'destination',
    conseiljs.ConseilOperator.EQ,
    [mainnet.protocol]
  )
  mintOperationQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    mintOperationQuery,
    'parameters_entrypoints',
    conseiljs.ConseilOperator.EQ,
    ['mint_OBJKT']
  )
  mintOperationQuery = conseiljs.ConseilQueryBuilder.addOrdering(
    mintOperationQuery,
    'block_level',
    conseiljs.ConseilSortDirection.DESC
  )
  mintOperationQuery = conseiljs.ConseilQueryBuilder.setLimit(
    mintOperationQuery,
    500_000
  ) // TODO: this is hardwired and will not work for highly productive artists

  const mintOperationResult = await conseiljs.TezosConseilClient.getTezosEntityData(
    { url: conseilServer, apiKey: conseilApiKey, network: 'mainnet' },
    'mainnet',
    'operations',
    mintOperationQuery
  )

  const mints = mintOperationResult.map((r) => r['source'])

  var initialValue = new Map()
  var reducer = function (minters, mintOp) {
    if (!minters[mintOp]) {
      minters[mintOp] = 1
    } else {
      minters[mintOp] = minters[mintOp] + 1
    }
    return minters
  }
  return mints.reduce(reducer, initialValue)
}

/**
 * Queries Conseil in two steps to get all the objects minted by a specific address. Step 1 is to query for all 'mint_OBJKT' operations performed by the account to get the list of operation group hashes. Then that list is partitioned into chunks and another query (or set of queries) is run to get big_map values. These values are then parsed into an array of 3-tuples containing the hashed big_map key that can be used to query a Tezos node directly, the nft token id and the ipfs item hash.
 *
 * @param {string} address
 * @returns
 */
const getArtisticOutputForAddress = async (address) => {
  let mintOperationQuery = conseiljs.ConseilQueryBuilder.blankQuery()
  mintOperationQuery = conseiljs.ConseilQueryBuilder.addFields(
    mintOperationQuery,
    'operation_group_hash'
  )
  mintOperationQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    mintOperationQuery,
    'kind',
    conseiljs.ConseilOperator.EQ,
    ['transaction']
  )
  mintOperationQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    mintOperationQuery,
    'timestamp',
    conseiljs.ConseilOperator.AFTER,
    [1612240919000]
  ) // 2021 Feb 1
  mintOperationQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    mintOperationQuery,
    'status',
    conseiljs.ConseilOperator.EQ,
    ['applied']
  )
  mintOperationQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    mintOperationQuery,
    'destination',
    conseiljs.ConseilOperator.EQ,
    [mainnet.protocol]
  )
  mintOperationQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    mintOperationQuery,
    'parameters_entrypoints',
    conseiljs.ConseilOperator.EQ,
    ['mint_OBJKT']
  )
  mintOperationQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    mintOperationQuery,
    'source',
    conseiljs.ConseilOperator.EQ,
    [address]
  )
  mintOperationQuery = conseiljs.ConseilQueryBuilder.addOrdering(
    mintOperationQuery,
    'block_level',
    conseiljs.ConseilSortDirection.DESC
  )
  mintOperationQuery = conseiljs.ConseilQueryBuilder.setLimit(
    mintOperationQuery,
    256
  ) // TODO: this is hardwired and will not work for highly productive artists

  const mintOperationResult = await conseiljs.TezosConseilClient.getTezosEntityData(
    { url: conseilServer, apiKey: conseilApiKey, network: 'mainnet' },
    'mainnet',
    'operations',
    mintOperationQuery
  )

  const operationGroupIds = mintOperationResult.map(
    (r) => r['operation_group_hash']
  )
  const queryChunks = chunkArray(operationGroupIds, 30)

  const makeObjectQuery = (opIds) => {
    let mintedObjectsQuery = conseiljs.ConseilQueryBuilder.blankQuery()
    mintedObjectsQuery = conseiljs.ConseilQueryBuilder.addFields(
      mintedObjectsQuery,
      'key_hash',
      'value'
    )
    mintedObjectsQuery = conseiljs.ConseilQueryBuilder.addPredicate(
      mintedObjectsQuery,
      'big_map_id',
      conseiljs.ConseilOperator.EQ,
      [mainnet.nftMetadataMap]
    )
    mintedObjectsQuery = conseiljs.ConseilQueryBuilder.addPredicate(
      mintedObjectsQuery,
      'operation_group_id',
      opIds.length > 1
        ? conseiljs.ConseilOperator.IN
        : conseiljs.ConseilOperator.EQ,
      opIds
    )
    mintedObjectsQuery = conseiljs.ConseilQueryBuilder.setLimit(
      mintedObjectsQuery,
      opIds.length
    )

    return mintedObjectsQuery
  }

  const objectQueries = queryChunks.map((c) => makeObjectQuery(c))

  const objectInfo = await Promise.all(
    objectQueries.map(
      async (q) =>
        await conseiljs.TezosConseilClient.getTezosEntityData(
          { url: conseilServer, apiKey: conseilApiKey, network: 'mainnet' },
          'mainnet',
          'big_map_contents',
          q
        ).then((result) =>
          result.map((row) => {
            const objectId = row['value']
              .toString()
              .replace(/^Pair ([0-9]{1,}) .*/, '$1')
            const objectUrl = row['value']
              .toString()
              .replace(/.* 0x([0-9a-z]{1,}) \}$/, '$1')
            const ipfsHash = Buffer.from(objectUrl, 'hex').toString().slice(7)

            return { key: row['key_hash'], objectId, ipfsHash }
          })
        )
    )
  )

  return objectInfo
    .flat(1)
    .sort((a, b) => parseInt(b.objectId) - parseInt(a.objectId))
}



const getArtisticUniverse = async (max_time, min_time, limit, skip_swaps=true) => {
  max_time = ((typeof max_time !== 'undefined') && max_time != 0) ? max_time : _getTimeQuantizedToMinute()
  min_time = ((typeof min_time !== 'undefined') && min_time != 0) ? min_time : _subtractDays(max_time, 3)
  limit = ((typeof limit !== 'undefined') && limit != 0) ? limit : 2500
  let min_block_level = LATEST_EPOCH
  let mintOperationQuery = conseiljs.ConseilQueryBuilder.blankQuery()
  mintOperationQuery = conseiljs.ConseilQueryBuilder.addFields(
    mintOperationQuery,
    'operation_group_hash'
  )
  mintOperationQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    mintOperationQuery,
    'kind',
    conseiljs.ConseilOperator.EQ,
    ['transaction']
  )
  mintOperationQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    mintOperationQuery,
    'timestamp',
    conseiljs.ConseilOperator.BETWEEN,
    [min_time, max_time]
  ) //Two weeks ago
  mintOperationQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    mintOperationQuery,
    'block_level',
    conseiljs.ConseilOperator.GT,
    [min_block_level]
  )
  mintOperationQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    mintOperationQuery,
    'status',
    conseiljs.ConseilOperator.EQ,
    ['applied']
  )
  mintOperationQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    mintOperationQuery,
    'destination',
    conseiljs.ConseilOperator.EQ,
    [mainnet.protocol]
  )
  mintOperationQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    mintOperationQuery,
    'parameters_entrypoints',
    conseiljs.ConseilOperator.EQ,
    ['mint_OBJKT']
  )
  mintOperationQuery = conseiljs.ConseilQueryBuilder.addOrdering(
    mintOperationQuery,
    'block_level',
    conseiljs.ConseilSortDirection.DESC
  )
  mintOperationQuery = conseiljs.ConseilQueryBuilder.setLimit(
    mintOperationQuery,
    limit
  )

  const mintOperationResult = await conseiljs.TezosConseilClient.getTezosEntityData(
    { url: conseilServer, apiKey: conseilApiKey, network: 'mainnet' },
    'mainnet',
    'operations',
    mintOperationQuery
  )

  const operationGroupIds = mintOperationResult.map(
    (r) => r['operation_group_hash']
  )

  let royaltiesQuery = conseiljs.ConseilQueryBuilder.blankQuery()
  royaltiesQuery = conseiljs.ConseilQueryBuilder.addFields(
    royaltiesQuery,
    'key',
    'value'
  )
  royaltiesQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    royaltiesQuery,
    'big_map_id',
    conseiljs.ConseilOperator.EQ,
    [mainnet.nftRoyaltiesMap]
  )
  royaltiesQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    royaltiesQuery,
    'block_level',
    conseiljs.ConseilOperator.GT,
    [min_block_level]
  )
  royaltiesQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    royaltiesQuery,
    'timestamp',
    conseiljs.ConseilOperator.BETWEEN,
    [min_time, max_time]
  ) //Two weeks ago
  royaltiesQuery = conseiljs.ConseilQueryBuilder.setLimit(
    royaltiesQuery,
    100_000
  )
  const royaltiesResult = await conseiljs.TezosConseilClient.getTezosEntityData(
    { url: conseilServer, apiKey: conseilApiKey, network: 'mainnet' },
    'mainnet',
    'big_map_contents',
    royaltiesQuery
  )
  let artistMap = {}
  royaltiesResult.forEach((row) => {
    artistMap[row['key']] = conseiljs.TezosMessageUtils.readAddress(
      row['value'].toString().replace(/^Pair 0x([0-9a-z]{1,}) [0-9]+/, '$1')
    )
  })

  let swapMap = {}

  if (!skip_swaps) {
    let swapsQuery = conseiljs.ConseilQueryBuilder.blankQuery()
    swapsQuery = conseiljs.ConseilQueryBuilder.addFields(
      swapsQuery,
      'key',
      'value'
    )
    swapsQuery = conseiljs.ConseilQueryBuilder.addPredicate(
      swapsQuery,
      'block_level',
      conseiljs.ConseilOperator.GT,
      [min_block_level]
    )
    swapsQuery = conseiljs.ConseilQueryBuilder.addPredicate(
      swapsQuery,
      'timestamp',
      conseiljs.ConseilOperator.BETWEEN,
      [min_time, max_time]
    ) //Two weeks ago
    swapsQuery = conseiljs.ConseilQueryBuilder.addPredicate(
      swapsQuery,
      'big_map_id',
      conseiljs.ConseilOperator.EQ,
      [mainnet.nftSwapMap]
    )
    swapsQuery = conseiljs.ConseilQueryBuilder.setLimit(swapsQuery, 30_000) // NOTE, limited to 30_000

    const swapsResult = await conseiljs.TezosConseilClient.getTezosEntityData(
      { url: conseilServer, apiKey: conseilApiKey, network: 'mainnet' },
      'mainnet',
      'big_map_contents',
      swapsQuery
    )

    const swapStoragePattern = new RegExp(
      `Pair [(]Pair 0x([0-9a-z]{44}) ([0-9]+)[)] [(]Pair ([0-9]+) ([0-9]+)[)]`
    )
  

    swapsResult.forEach((row) => {
      swap_id = row['key']
      const match = swapStoragePattern.exec(row['value'])
      if (!match) {
        return
      }
      const amount = match[2]
      const objkt_id = match[3]
      const xtz_per_objkt = match[4]

      if (swapMap[row['key']]) {
        swapMap[row['key']].push({})
      } else {
        swapMap[row['key']] = [{ swap_id, objkt_id, amount, xtz_per_objkt }]
      }
    })
  }

  const queryChunks = chunkArray(operationGroupIds, 50)

  const makeObjectQuery = (opIds) => {
    let objectsQuery = conseiljs.ConseilQueryBuilder.blankQuery()
    objectsQuery = conseiljs.ConseilQueryBuilder.addFields(
      objectsQuery,
      'key',
      'value',
      'operation_group_id'
    )
    objectsQuery = conseiljs.ConseilQueryBuilder.addPredicate(
      objectsQuery,
      'big_map_id',
      conseiljs.ConseilOperator.EQ,
      [mainnet.nftMetadataMap]
    )
    objectsQuery = conseiljs.ConseilQueryBuilder.addPredicate(
      objectsQuery,
      'timestamp',
      conseiljs.ConseilOperator.BETWEEN,
      [min_time, max_time]
    )
    objectsQuery = conseiljs.ConseilQueryBuilder.addPredicate(
      objectsQuery,
      'block_level',
      conseiljs.ConseilOperator.GT,
      [min_block_level]
    )
    objectsQuery = conseiljs.ConseilQueryBuilder.addPredicate(
      objectsQuery,
      'operation_group_id',
      opIds.length > 1
        ? conseiljs.ConseilOperator.IN
        : conseiljs.ConseilOperator.EQ,
      opIds
    )
    objectsQuery = conseiljs.ConseilQueryBuilder.setLimit(
      objectsQuery,
      opIds.length
    )

    return objectsQuery
  }

  const objectQueries = queryChunks.map((c) => makeObjectQuery(c))

  let universe = []
  await Promise.all(
    objectQueries.map(async (q) => {
      const r = []
      try {
        r = await conseiljs.TezosConseilClient.getTezosEntityData(
          { url: conseilServer, apiKey: conseilApiKey, network: 'mainnet' },
          'mainnet',
          'big_map_contents',
          q
        ).then((result) =>
          result.map((row) => {
            const objectId = row['value']
              .toString()
              .replace(/^Pair ([0-9]{1,}) .*/, '$1')
            const objectUrl = row['value']
              .toString()
              .replace(/.* 0x([0-9a-z]{1,}) \}$/, '$1')
            const ipfsHash = Buffer.from(objectUrl, 'hex').toString().slice(7)

            universe.push({
              objectId,
              ipfsHash,
              minter: artistMap[objectId],
              swaps: swapMap[objectId] !== undefined ? swapMap[objectId] : [],
            })
          })
        ) // NOTE: it's a work in progress, this will drop failed requests and return a smaller set than expected
      } finally {
        return r
      }
    })
  )

  return universe
}

const getFeaturedArtisticUniverse = async (max_time) => {
  max_time = ((typeof max_time !== 'undefined') && max_time != 0) ? max_time : _getTimeQuantizedToMinute()
  console.log('max time', max_time)
  const min_time = _subtractWeek(max_time)
  console.log('min time', min_time)
  hdaoMap = await gethDaoBalances()
  const twoh_ago = _subtractHours(max_time, 3)

  const backendConf = await getBackendConfig()
  if(backendConf.disableFilter) {
    return await getArtisticUniverse(max_time, _subtractDays(max_time, 3), 2000)
  }
  // Weekly and recent mints can be used to identify two misbehaving users:
  // 1. bot-minters who mint huge amounts of works, they should gain followers early or via 3rd party sites
  // 2. copyminters who mint many works in short timespan before they get banned
  mintsPerCreatorWeek = await getObjektMintingsDuringPeriod(min_time, max_time)

  //We now create the scoring task
  let minter_arr = [ ...Object.keys(mintsPerCreatorWeek) ]
  let minters = _.take(_.uniq(minter_arr), 30)
  const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 2
  });
  let tzktscores = new Map()
  let scoreTask = Promise.all(
    Array.from(minters).map(async (minter) => {
      const mscore = await limiter.schedule(() => { 
        return axios.get(
          `https://api.tzkt.io/v1/accounts/${minter}/metadata`
        ).then((data)  => {
          
          let score = 0
          if(data) {
            if(data.data.alias) score += 0.2
            if(data.data.twitter) score += 0.25
            if(data.data.instagram) score += 0.25
            if(data.data.github) score += 0.2
            if(data.data.site) score += 0.25
            if(data.data.reddit) score += 0.25
            if(data.data.email) score += 0.2
            if(data.data.logo) score += 0.2
            if(data.data.description) score += 0.2
          }
          return Math.min(score, 1)
        }).catch((error) => {
          if (error.response) {
            if(error.response.status == 429) {
              console.log('TOO FAST')
              return -1
            }
          }
            return 0
          })
      })
      tzktscores[minter] = mscore
    })
  )
  
  //We run scoring task along with the "real" tasks for performance

  var tasks = [
    scoreTask,
    getObjektMintingsDuringPeriod(twoh_ago, max_time),
    getArtisticUniverse(max_time, _subtractDays(max_time, 3), 2000)
  ]
  if(!backendConf.disableSwapPrices) {
    //We setup thresholds using price data so that people aren't affected by huge swings in hdao value
    tasks = tasks.concat([
      gethDAOPerTez(backendConf.hDaoSwap),
      getKolibriPerTez(backendConf.kolibriSwap)])
    var [bs, mintsPerCreator3h, artisticUniverse, hdaoPerTez, kolPerTez] = await Promise.all(tasks)
    hdaoPerKol = hdaoPerTez / Math.max(kolPerTez, 0.0000000001)
  }
  else {
    var [bs, mintsPerCreator3h, artisticUniverse] = await Promise.all(tasks)
  }
  
  
  let replacementScore = Object.values(tzktscores).filter(v => v !== -1).avg() / 2
  tzktscores = tzktscores.mapMap((value, key) => { 
    if (value === -1) {
      return replacementScore
    }
    return value
  })
  // Cost to be on feed per objekt last 7 days shouldn't be higher than any of:
  //   0.5tez
  //   10 hDAO
  //   $1
  // But not lower than:
  //   0.1 hDAO
  //
  // We should probably add more thresholds like $, € and yen
  // It should be cheap but not too cheap and it shouldn't be
  // affected by tez or hDAO volatility
  let thresholdHdao = backendConf.filterMinhDAO
  if (!backendConf.disableSwapPrices) {
      console.log(hdaoPerTez, hdaoPerKol)
      thresholdHdao = Math.floor(
        Math.max(backendConf.filterMinhDAO,
          Math.min(
                backendConf.filterMaxhDAO,
                backendConf.filterMaxTez * hdaoPerTez,
                backendConf.filterMaxKol * hdaoPerKol)
              )
            )
  }
  console.log('thresholdHdao', thresholdHdao)
  // We now filter based on if user has a tzkt profile or not and if they spam
  // the feed or have a "normal human" behavior to avoid bots
  return artisticUniverse.filter(o => {
    //We look at hdao and tzkt status to set as a base-score
    let minterhDAO = (hdaoMap[o.minter] || 0) 
    let minterScore = (tzktscores[o.minter] || replacementScore)
    let minterBaseScore = minterhDAO + (minterScore * thresholdHdao) + (minterhDAO * minterScore * backendConf.tzktScorehDAOMultiplier)

    let minterMintsWeek = Math.max(mintsPerCreatorWeek[o.minter] || 1, 1)
    let minterMints3hExp = (2 ** Math.max((mintsPerCreator3h[o.minter] || 1) - 1, 0))
    let minterFreeObjkts = minterScore * backendConf.filterWeeklyFreeObjkts

    let divisor = Math.max(minterMintsWeek + minterMints3hExp - minterFreeObjkts, 0)

    return (minterBaseScore / divisor) > thresholdHdao
  })
}

const getRecommendedCurateDefault = async () => {
  const backendConf = await getBackendConfig()
  if(!backendConf.disableSwapPrices) {
    hdaoPerTez = await gethDAOPerTez(backendConf.hDaoSwap)
    kolPerTez = await getKolibriPerTez(backendConf.kolibriSwap)
    hdaoPerKol = hdaoPerTez / kolPerTez
    //Minimum of $0.1, 0.1 hDAO, and 0.1tez, in hDAO
    return Math.floor(
      Math.min(hdaoPerKol * 0.1, 0.1, 0.1 * hdaoPerTez) * 1_000_000
    )
  }
  return backendConf.curateDefault
}

/**
 * Returns object ipfs hash and swaps if any
 *
 * @param {number} objectId
 * @returns
 */
const getObjectById = async (objectId, with_swaps=true, min_creation_level, max_creation_level) => {
  let objectQuery = conseiljs.ConseilQueryBuilder.blankQuery()
  objectQuery = conseiljs.ConseilQueryBuilder.addFields(objectQuery, 
    'key',
    'value',
    'block_level')
  objectQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    objectQuery,
    'big_map_id',
    conseiljs.ConseilOperator.EQ,
    [mainnet.nftMetadataMap]
  )
  objectQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    objectQuery,
    'key',
    conseiljs.ConseilOperator.EQ,
    [objectId]
  )
  if ((typeof min_creation_level !== 'undefined') && min_creation_level !== null) {
    if ((typeof max_creation_level !== 'undefined' ) && max_creation_level !== null ) {
      objectQuery = conseiljs.ConseilQueryBuilder.addPredicate(
        objectQuery,
        'block_level',
        conseiljs.ConseilOperator.BETWEEN,
        [min_creation_level, max_creation_level]
      )
    } else {
      objectQuery = conseiljs.ConseilQueryBuilder.addPredicate(
        objectQuery,
        'block_level',
        conseiljs.ConseilOperator.GT,
        [min_creation_level]
      )
    }
    
  }


  objectQuery = conseiljs.ConseilQueryBuilder.addOrdering(
    objectQuery,
    'block_level',
    conseiljs.ConseilSortDirection.DESC
  )

  objectQuery = conseiljs.ConseilQueryBuilder.setLimit(objectQuery, 1)

  const objectResult = await conseiljs.TezosConseilClient.getTezosEntityData(
    { url: conseilServer, apiKey: conseilApiKey, network: 'mainnet' },
    'mainnet',
    'big_map_contents',
    objectQuery
  )

  const objectUrl = objectResult[0]['value']
    .toString()
    .replace(/.* 0x([0-9a-z]{1,}) \}$/, '$1')
  const ipfsHash = Buffer.from(objectUrl, 'hex').toString().slice(7)
  
  let swaps = []


  
  if (!with_swaps) {
    return { objectId, ipfsHash, swaps }
  }
  let swapsQuery = conseiljs.ConseilQueryBuilder.blankQuery()
  swapsQuery = conseiljs.ConseilQueryBuilder.addFields(
    swapsQuery,
    'key',
    'value'
  )
  swapsQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    swapsQuery,
    'big_map_id',
    conseiljs.ConseilOperator.EQ,
    [mainnet.nftSwapMap]
  )
  swapsQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    swapsQuery,
    'value',
    conseiljs.ConseilOperator.LIKE,
    [`) (Pair ${objectId} `]
  )
  if ((typeof min_creation_level !== 'undefined') && min_creation_level !== null) {
    swapsQuery = conseiljs.ConseilQueryBuilder.addPredicate(
      swapsQuery,
      'block_level',
      conseiljs.ConseilOperator.GT,
      [min_creation_level]
    )
  }

  swapsQuery = conseiljs.ConseilQueryBuilder.setLimit(swapsQuery, 1000) // NOTE, limited to 1000 swaps for a given object

  const swapsResult = await conseiljs.TezosConseilClient.getTezosEntityData(
    { url: conseilServer, apiKey: conseilApiKey, network: 'mainnet' },
    'mainnet',
    'big_map_contents',
    swapsQuery
  )
  const swapStoragePattern = new RegExp(
    `Pair [(]Pair 0x([0-9a-z]{44}) ([0-9]+)[)] [(]Pair ${objectId} ([0-9]+)[)]`
  )

  try {
    swapsResult.map((row) => {
      const match = swapStoragePattern.exec(row['value'])

      swaps.push({
        swap_id: row['key'],
        issuer: conseiljs.TezosMessageUtils.readAddress(match[1]),
        objkt_amount: match[2],
        xtz_per_objkt: match[3],
      })
    })
  } catch (error) {
    console.log(`failed to process swaps for ${objectId} with ${error}`)
  }

  return { objectId, ipfsHash, swaps }
}


const getSwapsForAddress = async(address) => {
  let swaps = []
  let swapsQuery = conseiljs.ConseilQueryBuilder.blankQuery()
  swapsQuery = conseiljs.ConseilQueryBuilder.addFields(
    swapsQuery,
    'key',
    'value'
  )
  swapsQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    swapsQuery,
    'big_map_id',
    conseiljs.ConseilOperator.EQ,
    [mainnet.nftSwapMap]
  )

  let addrHash = `0x${conseiljs.TezosMessageUtils.writeAddress(address)}`
  swapsQuery = conseiljs.ConseilQueryBuilder.addPredicate(
    swapsQuery,
    'value',
    conseiljs.ConseilOperator.LIKE,
    [`Pair (Pair ${addrHash} `]
  )
  swapsQuery = conseiljs.ConseilQueryBuilder.setLimit(swapsQuery, 1000) // NOTE, limited to 1000 swaps for a given object

  const swapsResult = await conseiljs.TezosConseilClient.getTezosEntityData(
    { url: conseilServer, apiKey: conseilApiKey, network: 'mainnet' },
    'mainnet',
    'big_map_contents',
    swapsQuery
  )
  const swapStoragePattern = new RegExp(
    `Pair [(]Pair ${addrHash} ([0-9]+)[)] [(]Pair ([0-9]+) ([0-9]+)[)]`
  )

  try {
    swapsResult.map((row) => {
      const match = swapStoragePattern.exec(row['value'])

      swaps.push({
        swap_id: row['key'],
        token_id: match[2],
        objkt_amount: match[1],
        xtz_per_objkt: match[3],
      })
    })
  } catch (error) {
    console.log(`failed to process swaps for ${address} with ${error}`)
  }

  return swaps
}

const chunkArray = (arr, len) => {
  // TODO: move to util.js
  let chunks = [],
    i = 0,
    n = arr.length

  while (i < n) {
    chunks.push(arr.slice(i, (i += len)))
  }

  return chunks
}

module.exports = {
  getCollectionForAddress,
  gethDaoBalanceForAddress,
  getObjkthDAOBalance,
  getArtisticOutputForAddress,
  getObjectById,
  getArtisticUniverse,
  getFeaturedArtisticUniverse,
  hDAOFeed,
  getRecommendedCurateDefault,
  getObjektOwners,
  getSwapsForAddress,
}
