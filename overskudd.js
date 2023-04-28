getCommo()
.then(days => {



  let el = getEl()
  .then(domains => {
    let output = {}
    domains.map(domain => { 
      output[domain.name] = domain.data.Publication_MarketDocument.TimeSeries.map(timeseries => {
        let hours = timeseries.Period.Point.map(point => point["price.amount"])
        return { 
          hours: hours,
          avg: getAverage(hours)
        }
      })
    })
    return output
  })

  return [...days, ...el]
})
.then(combined => console.log(combined))


// Funker:
getEl()
.then(domains => {
  let output = {}
  domains.map(domain => { 
    output[domain.name] = domain.data.Publication_MarketDocument.TimeSeries.map(timeseries => {
      let hours = timeseries.Period.Point.map(point => point["price.amount"])
      return { 
        hours: hours,
        avg: getAverage(hours)
      }
    })
  })
  return output
})
.then(result => res.send(result))
.catch(error => res.send(error))


/* Fetch all, clean and return requests array
async function goGet() {
    let data = await Promise.all(requests.map(r =>
        fetch(r.url).then(resp => resp.json()).then(data => cleanData(data))
    ))
    data.map((d,i) => {       
        requests[i].data = d
    })
    return requests
} */


/* Old now.js */
const { getEl } = require("./entsoe-now")
const { getCommo } = require("./commo-now")

export default async function handler(req, res) {
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
  
  // Enable cache
  res.setHeader('Cache-Control', 's-maxage=7200') // 1 hour

  
  // ----- //

  // Fetch
  let c = await getCommo()
  let e = await getEl(c)
  // let combined = [...e, ...c]
  // let output = combined.reduce((obj, item) => Object.assign(obj, { [item.name]: item.data }), {})

  let output = (commo, el) => {
    let x = { 
      meta: {
        created: Date.now()
      },
      symbols: {
        Strøm: {}
      }
    }
    el.forEach(domain => { // Skulle egentlig vært flytta inn i entsoe-now.js
      x.symbols.Strøm[domain.name] = {
        data: domain.data
      }
      x.symbols.Strøm[domain.name].change = ((parseFloat(domain.data[1].avg) / parseFloat(domain.data[0].avg) - 1) * 100).toFixed(1)
      x.symbols.Strøm[domain.name].avg = domain.data[1].avg
    })
    for (let symbol in commo) {
      x.symbols[symbol] = commo[symbol]
    }
    return x
  }

  // Send
  res.send(output(c, e))

}