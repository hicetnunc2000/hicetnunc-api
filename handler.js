const { TezosToolkit, MichelsonMap } = require('@taquito/taquito')
const serverless = require('serverless-http')
const express = require('express')
const cors = require('cors')
const app = express()

const Tezos = new TezosToolkit('https://api.tez.ie/rpc/mainnet')
const mfp_mainnet = 'KT1Q72pNNiCnBamwttWvXGE9N2yuz6c7guSD'
const objkts_mainnet = 'KT1SiUb8CDJVDTxHkMa7B5ZQKr8oCDjHznFD'
const ipfs = 'ipfs://'

app.use(express.json())
app.use(cors({origin: '*'}))

app.get('/', (req, res) => res.json({result:200}))

app.post('/api/v1/mfp/originate', (req, res) => {

  Tezos.contract
    .at(mfp_mainnet)
    .then(c => res.json({ result: c.methods.originate_hicetnuncDAO(req.body.tz, req.body.goal, req.body.metadata).toTransferParams() }))

})

app.post('/api/v1/mfp/withdraw', (req, res) => {
  //Tezos.contract.at(kt).then( c => console.log(c.parameterSchema.ExtractSignatures()))
  Tezos.contract.at(req.body.kt).then(c => res.json({ result : c.methods.withdraw(req.body.tz, req.body.amount).toTransferParams() }))
})

app.post('/api/v1/mfp/update_metadata', (req, res) => {
  Tezos.contract.at(req.body.kt).then(c => res.json({ result : c.methods.update_meta(req.body.metadata).toTransferParams() }))
})

app.post('/api/v1/mfp/contribute', (req, res) => {
  console.log(req.body)
  Tezos.contract.at(req.body.kt).then(c => res.json({ result : c.methods.contribute(null).toTransferParams( { amount: parseInt(req.body.amount) , mutez: true }) }))
})

app.post('/api/v1/mfp/update_adm', (req, res) => {
  Tezos.contract.at(req.body.kt).then(c => res.json({ result : c.methods.update_admin(req.body.tz).toTransferParams() }))
})

app.post('/api/v1/mfp/set_baker', (req, res) => {
  Tezos.contract.at(req.body.kt).then(c => res.json({ result : c.methods.set_baker(req.body.tz).toTransferParams() }))
})

app.post('/api/v1/objkts/mint', (req, res) => {
  console.log({'': (ipfs+req.body.cid).split("").reduce((hex,c)=>hex+=c.charCodeAt(0).toString(16).padStart(2,"0"),"")})
  Tezos.contract.at(objkts_mainnet).then(c => res.json({ result : c.methods.default(req.body.tz, req.body.amount, MichelsonMap.fromLiteral({'': (ipfs+req.body.cid).split("").reduce((hex,c)=>hex+=c.charCodeAt(0).toString(16).padStart(2,"0"),"")})).toTransferParams() }))
})

//app.listen(3001, () => console.log(`Listening on: 3001`));
module.exports.handler = serverless(app)