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