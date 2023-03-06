const { XMLParser } = require("fast-xml-parser")
const parser = new XMLParser()

function getCommo() {


    let requests = [],
        today = new Date(),
        yesterday = new Date(today)  
    yesterday.setDate(yesterday.getDate() - 1)

    /* 
    Commodities-API 
    */

    // Fetch parameters
    let commo = {
        accessKey: 'ty2dpo40x38kyood3mzwd31lnik04p6y7hzj7l1wsu67548xd4yuj58np0rz',
        base: 'USD',
        symbols: 'SOYBEAN,BRENTOIL,NOK,EUR',
        urlBase: 'https://www.commodities-api.com/api/',
        urlParam: function() { 
            return `?access_key=${this.accessKey}&base=${this.base}&symbols=${this.symbols}`
        }
    }

    function cleanData(data) {
        let rates = data.data.rates
        for (let symbol in rates) {
            if (symbol == "SOYBEAN") rates.SOYBEAN = (1 / rates[symbol] / 36.7437 * 1000).toFixed(3)
            else if (symbol == "BRENTOIL") rates.BRENTOIL = (1 / rates[symbol]).toFixed(3)
            else if (symbol == "EUR") rates.EUR = (rates.NOK / rates.EUR).toFixed(3)
            else if (symbol == "USD" || symbol == "NOK") delete rates[symbol]
        }
        return rates
    }

    // Add commo requests to loop
    requests.push({name: "latest", url: commo.urlBase + "latest" + commo.urlParam()})
    requests.push({name: "yesterday", url: commo.urlBase + yesterday.toISOString().substring(0,10) + commo.urlParam()})
    

    // Fetch all, clean and return requests array
    async function goGet() {
        let data = await Promise.all(requests.map(r =>
            fetch(r.url).then(resp => resp.json()).then(data => cleanData(data))
        ))
        data.map((d,i) => {       
            requests[i].data = d
        })
        return requests
    }

    return goGet()
}

module.exports = { getCommo }