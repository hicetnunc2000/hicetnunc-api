const conseiljs = require('conseiljs')
const fetch = require('node-fetch')
const log = require('loglevel')

const logger = log.getLogger('conseiljs')
logger.setLevel('error', false)
conseiljs.registerLogger(logger)
conseiljs.registerFetch(fetch)
const conseilServer = 'https://conseil-prod.cryptonomic-infra.tech'
const conseilApiKey = '' // signup at nautilus.cloud

const mainnet = require('./config').networkConfig

const getCollectionForAddress = async (address) => {
    let collectionQuery = conseiljs.ConseilQueryBuilder.blankQuery();
    collectionQuery = conseiljs.ConseilQueryBuilder.addFields(collectionQuery, 'key', 'value');
    collectionQuery = conseiljs.ConseilQueryBuilder.addPredicate(collectionQuery, 'big_map_id', conseiljs.ConseilOperator.EQ, [mainnet.nftLedger])
    collectionQuery = conseiljs.ConseilQueryBuilder.addPredicate(collectionQuery, 'key', conseiljs.ConseilOperator.STARTSWITH, [
        `Pair 0x${conseiljs.TezosMessageUtils.writeAddress(address)}`,
    ])
    collectionQuery = conseiljs.ConseilQueryBuilder.addPredicate(collectionQuery, 'value', conseiljs.ConseilOperator.EQ, [0], true)
    collectionQuery = conseiljs.ConseilQueryBuilder.setLimit(collectionQuery, 10_000)

    const collectionResult = await conseiljs.TezosConseilClient.getTezosEntityData({ url: conseilServer, apiKey: conseilApiKey, network: 'mainnet' }, 'mainnet', 'big_map_contents', collectionQuery);

    const collection = collectionResult.map((i) => {
        return { piece: i.key.toString().replace(/.* ([0-9]{1,}$)/, '$1'), amount: Number(i.value) }
    })

    console.log('collection', collection)

    return collection;
}

const getArtisticOutputForAddress = async (address) => {
    let mintOperationQuery = conseiljs.ConseilQueryBuilder.blankQuery();
    mintOperationQuery = conseiljs.ConseilQueryBuilder.addFields(mintOperationQuery, 'operation_group_hash');
    mintOperationQuery = conseiljs.ConseilQueryBuilder.addPredicate(mintOperationQuery, 'kind', conseiljs.ConseilOperator.EQ, ['transaction'])
    mintOperationQuery = conseiljs.ConseilQueryBuilder.addPredicate(mintOperationQuery, 'timestamp', conseiljs.ConseilOperator.AFTER, [1612240919000])
    mintOperationQuery = conseiljs.ConseilQueryBuilder.addPredicate(mintOperationQuery, 'status', conseiljs.ConseilOperator.EQ, ['applied'])
    mintOperationQuery = conseiljs.ConseilQueryBuilder.addPredicate(mintOperationQuery, 'destination', conseiljs.ConseilOperator.EQ, [mainnet.protocol])
    mintOperationQuery = conseiljs.ConseilQueryBuilder.addPredicate(mintOperationQuery, 'parameters_entrypoints', conseiljs.ConseilOperator.EQ, ['mint_OBJKT'])
    mintOperationQuery = conseiljs.ConseilQueryBuilder.addPredicate(mintOperationQuery, 'source', conseiljs.ConseilOperator.EQ, [address])
    mintOperationQuery = conseiljs.ConseilQueryBuilder.addOrdering(mintOperationQuery, 'block_level', conseiljs.ConseilSortDirection.DESC)
    mintOperationQuery = conseiljs.ConseilQueryBuilder.setLimit(mintOperationQuery, 10_000) // TODO: this is hardwired and will not work for highly productive artists

    const mintOperationResult = await conseiljs.TezosConseilClient.getTezosEntityData(
        { url: conseilServer, apiKey: conseilApiKey, network: 'mainnet' },
        'mainnet',
        'operations',
        mintOperationQuery);

    console.log('mintOperationResult', mintOperationResult)
    const operationGroupIds = mintOperationResult.map(r => r['operation_group_hash'])
    const queryChunks = chunkArray(operationGroupIds, 3)

    const makeObjectQuery = (opIds) => {
        let mintedObjectsQuery = conseiljs.ConseilQueryBuilder.blankQuery();
        mintedObjectsQuery = conseiljs.ConseilQueryBuilder.addFields(mintedObjectsQuery, 'key_hash', 'value');
        mintedObjectsQuery = conseiljs.ConseilQueryBuilder.addPredicate(mintedObjectsQuery, 'big_map_id', conseiljs.ConseilOperator.EQ, [mainnet.nftMetadataMap])
        mintedObjectsQuery = conseiljs.ConseilQueryBuilder.addPredicate(mintedObjectsQuery, 'operation_group_id', (opIds.length > 1 ? conseiljs.ConseilOperator.IN : conseiljs.ConseilOperator.EQ), opIds)
        mintedObjectsQuery = conseiljs.ConseilQueryBuilder.setLimit(mintedObjectsQuery, 100)

        return mintedObjectsQuery
    }

    const objectQueries = queryChunks.map(c => makeObjectQuery(c))

    const objectInfo = await Promise.all(objectQueries.map(async (q) => await conseiljs.TezosConseilClient.getTezosEntityData({ url: conseilServer, apiKey: conseilApiKey, network: 'mainnet' }, 'mainnet', 'big_map_contents', q)
        .then(result => result.map(row => {
            const objectId = row['value'].toString().replace(/^Pair ([0-9]{1,}) .*/, '$1')
            const objectUrl = row['value'].toString().replace(/.* 0x([0-9a-z]{1,}) \}$/, '$1')
            const ipfsHash = Buffer.from(objectUrl, 'hex').toString().slice(7);

            return { key: row['key_hash'], objectId, ipfsHash }
    }))))

    console.log('artisticOutput', objectInfo)

    return objectInfo
}


const chunkArray = (arr, len) => { // TODO: move to util.js
    let chunks = [],
        i = 0,
        n = arr.length;
  
    while (i < n) {
        chunks.push(arr.slice(i, i += len));
    }
  
    return chunks;
}

module.exports = {
    getCollectionForAddress,
    getArtisticOutputForAddress
}
