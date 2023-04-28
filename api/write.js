const { getCommo } = require("./commo-now")
const { AwesomeGraphQLClient } = require('awesome-graphql-client')

export default async function handler(req, res) {
  
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

    // Fetch
    let c = await getCommo()

    let timestamp = Date.now()

    // Write to Hygraph
    const client = new AwesomeGraphQLClient({
        endpoint: 'https://api-eu-central-1-shared-euc1-02.hygraph.com/v2/clgryv0it118001uj6vjm7imi/master',
        fetch
    })
    const createNewNow = `mutation createNewNow($data: Json!) {
        createNow(data:{
            timestamp: ${timestamp},
            jsonData: $data
        }) {
            id
        }
    }`
    const vars = {
        data: c
    }
    
    client.request(createNewNow, vars)
        .then(data => console.log("Write ok:", data))
        .catch(error => console.log(error))
    
}