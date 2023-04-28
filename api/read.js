const { AwesomeGraphQLClient } = require('awesome-graphql-client')

function read() {

    // Read from Hygraph
    const client = new AwesomeGraphQLClient({
        endpoint: 'https://api-eu-central-1-shared-euc1-02.hygraph.com/v2/clgryv0it118001uj6vjm7imi/master',
        fetch
    })
    const readLatest = `query Latest {
        nows(first: 1) {
          timestamp
          jsonData
        }
      }`
    async function returnLatest() {
        let now = Date.now()
        let query = await client.request(readLatest)
        .then(data => {
            let diff = data.nows[0].timestamp - now
            if (diff > 10800000) console.error("Json data out of sync") // 3 hours
            return data.nows[0].jsonData
        })
        .catch(error => console.log(error))
        return query
    }
    return returnLatest()
}

read()

module.exports = { read }