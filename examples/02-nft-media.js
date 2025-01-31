const { getMedia } = require('../src/slp-token-data')

const getTokenMedia = async () => {
  let data = await getMedia(
    'ipfs://bafybeifgiqhbcrjcm74t5hibxpcyy3r6pqs4gmhuckdfs3mgve6h53bqru'
  )
  if (data) console.log(JSON.stringify(data, null, 2))
  data = await getMedia(
    'ipfs://bafybeifglq4lcmsswq2jpcdjlkcdzitcaaqwdesqoczjf5uwam6lqca76m'
  )
  if (data) console.log(JSON.stringify(data, null, 2))
}
getTokenMedia()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
