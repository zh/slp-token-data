const { getMedia } = require('../../slp-token-data')

const getTokenMedia = async () => {
  let data = await getMedia(
    'psf://bafybeih7wvwdrg5xs3izvtefsyslgaimzpka4i4mpme27iwlm7632e46uy'
  )
  if (data && data.icon) console.log(`image: ${data.icon.substring(0, 60)}...`)
  data = await getMedia(
    'https://gateway.ipfs.io/ipfs/QmSDeYAe9mga6NdTozAZuyGL3Q1XjsLtvX28XFxJH8oPjq'
  )
  if (data && data.icon) console.log(`image: ${data.icon.substring(0, 60)}...`)
  data = await getMedia('ipfs://QmSDeYAe9mga6NdTozAZuyGL3Q1XjsLtvX28XFxJH8oPjq')
  if (data && data.icon) console.log(`image: ${data.icon.substring(0, 60)}...`)
  data = await getMedia('pouns://(1,1,1,1,1)')
  if (data && data.icon) console.log(`image: ${data.icon.substring(0, 60)}...`)
  data = await getMedia('pouns://[2,2,2,2,2]')
  if (data && data.icon) console.log(`image: ${data.icon.substring(0, 60)}...`)
  data = await getMedia('nouns://[3,3,3,3,3]')
  if (data && data.icon) console.log(`image: ${data.icon.substring(0, 60)}...`)
}
getTokenMedia()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
