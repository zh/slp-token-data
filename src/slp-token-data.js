const axios = require('axios')
const { Buffer } = require('buffer')
const { getContracts, generatePoun } = require('pouns-sdk')

const IPFS = 'ipfs.w3s.link'
const JUUNGLE = 'https://www.juungle.net/api/v1/nfts/icon'

const allGateways = (cid) => {
  return [
    `https://${cid}.ipfs.w3s.link`,
    `https://files.tokentiger.com/ipfs/view/${cid}`
  ]
};

const getIPFSdata = async (cid, gateways) => {
  for (const gateway of gateways) {
    try {
      const url = `${gateway}/data.json`
      console.log(`ipfs gateway: ${url}`)
      const result = await axios.get(url, {
        timeout: 10000, // Set timeout to 10 seconds
      })
      if (result.status === 200 && result.data) {
        if (result.headers['content-type'].startsWith('image/'))
          return { icon: url, download: true }
        if (result.data.tokenIcon)
          return { icon: result.data.tokenIcon, download: true }
        return { gateway: gateway }
      }
    } catch (_) {
      console.log('get IPFS error.')
    }
  }
  throw new Error('All gateways failed.');
}

// config = { wallet, token, size }

const getMedia = async (url, config = {}) => {
  try {
    // exceptions
    if (url.startsWith('nouns://[') || url.startsWith('pouns://['))
      return processPouns(url.substring(8), config)
    // standard handlers
    const tokenURL = new URL(url)
    if (tokenURL.protocol === 'ipfs:')
      return processIPFS(url.substring(7), config)
    if (tokenURL.protocol === 'http:' || tokenURL.protocol === 'https:')
      return processHTTP(url)
    if (tokenURL.protocol === 'pouns:' || tokenURL.protocol === 'nouns:')
      return processPouns(tokenURL.hostname, config)
    if (tokenURL.protocol === 'psf:') return processPSF(config)
    if (tokenURL.protocol === 'juungle:') return processJuungle(config)
    if (tokenURL.protocol === 'legacy:') return processLegacy(config)
    return null
  } catch (error) {
    console.log('getMedia() error: ', error)
    return null
  }
}

const processHTTP = async (url) => {
  try {
    await axios.get(url) // just check the url
    return { icon: url, download: true }
  } catch (error) {
    return null
  }
}

const processIPFS = async (cid, config) => {
  let gatewayURLs = []
  if (config.gateway) {
    gatewayURLs = [config.gateway]
  } else {
    gatewayURLs = allGateways(cid)
  }
  const result = await getIPFSdata(cid, gatewayURLs)
  // if (result.icon) return result // image URL resolved
  const localConfig = config
  if (result.gateway) localConfig.gateway = result.gateway
  return processPSF(localConfig)
}

// accept config.size
const processPouns = async (url, config) => {
  if (!url) return null
  const seed = url.replace('(', '[').replace(')', ']')
  const svg = await generatePoun(getContracts(), seed)
  const imgData = Buffer.from(svg, 'base64').toString()
  let icon = imgData
  if (config.size) {
    icon = imgData.replace(
      '<svg width="320" height="320"',
      `<svg width="${config.size}" height="${config.size}"`
    )
  }
  return { icon, download: false } // direct display, no download
}

const processPSF = async (config) => {
  const { token, wallet } = config
  let gatewayURLs = []
  if (config.gateway) {
    gatewayURLs = [config.gateway]
  } else {
    gatewayURLs = allGateways(cid)
  }
  const tokenData = await wallet.getTokenData(token.tokenId)
  console.log('token: ', JSON.stringify(tokenData, null, 2))
  if (tokenData.mutableData && tokenData.mutableData.startsWith('ipfs://')) {
    const cid = tokenData.mutableData.substring(7)
    const result = await getIPFSdata(cid, gatewayURLs)
    if (result && result.icon)
      return { icon: result.icon, download: true }
  }
  return null
}

const processLegacy = async (config) => {
  const url = `https://tokens.bch.sx/${config.size}/${config.token.tokenId}.png`
  return processHTTP(url)
}

const processJuungle = async (config) => {
  const { token, wallet } = config
  try {
    const tokenData = await wallet.getTokenData(token.tokenId)
    const group = tokenData.genesisData.parentGroupId
    const url = `${JUUNGLE}/${group}/${token.tokenId}`
    return processHTTP(url)
  } catch (_) {
    return null
  }
}

module.exports = {
  getMedia
}
