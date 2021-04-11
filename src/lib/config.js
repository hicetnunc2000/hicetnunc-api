'use strict'

module.exports = {
  burnAddress:
    process.env.BURN_ADDRESS || 'tz1burnburnburnburnburnburnburjAYjjX',
  feedItemsPerPage: process.env.FEED_ITEMS_PER_PAGE || 30,
  networkConfig: {
    network: 'mainnet',
    nftContract: 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton',
    hDAOToken: 'KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW',
    curations: 'KT1TybhR7XraG75JFYKSrh7KnxukMBT5dor6',
    protocol: 'KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9',
    nftLedger: 511,
    nftMetadataMap: 514,
    nftSwapMap: 523,
    curationsPtr: 519,
    nftRoyaltiesMap: 522,
    daoLedger: 515,
  },
  serverPort: 3001,
}
