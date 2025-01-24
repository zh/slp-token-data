const axios = require('axios')
const { Buffer } = require('buffer')
const { getContracts, generatePoun } = require('pouns-sdk')

const IPFS = 'ipfs.w3s.link'
const JUUNGLE = 'https://www.juungle.net/api/v1/nfts/icon'

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
  const fullUrl = `https://${cid}.${config.gateway || IPFS}$/data.json`
  try {
    const result = await axios.get(fullUrl)
    if (result.headers['content-type'].startsWith('image/'))
      return { icon: fullUrl, download: true }
    return processPSF(config)
  } catch (_) {
    return null
  }
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
  const tokenData = await wallet.getTokenData(token.tokenId)
  if (tokenData.mutableData && tokenData.mutableData.includes('ipfs://')) {
    const cid = tokenData.mutableData.substring(7)
    const fullUrl = `https://${cid}.ipfs.dweb.link/data.json`
    const result = await axios.get(fullUrl)
    if (result && result.data && result.data.tokenIcon)
      return { icon: result.data.tokenIcon, download: true }
  }
  return null
}

const processLegacy = async (config) => {
  const url = `https://tokens.bch.sx/128/${config.token.tokenId}.png`
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
