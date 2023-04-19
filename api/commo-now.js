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

    // Add commo requests to loop
    requests.push({name: "latest", url: commo.urlBase + "latest" + commo.urlParam()})
    requests.push({name: "yesterday", url: commo.urlBase + yesterday.toISOString().substring(0,10) + commo.urlParam()})
    
    function cleanData(data) {
        let x = {}
        for (let symbol in data.data.rates) {
            if (symbol == "SOYBEAN") x.Soya = 1 / data.data.rates[symbol] / 36.7437 * 1000
            else if (symbol == "BRENTOIL") x.Råolje = 1 / data.data.rates[symbol]
            else if (symbol == "EUR") x.Euro = data.data.rates.NOK / data.data.rates.EUR
            else if (symbol == "TGJ23") x.Gass = 1 / data.data.rates[symbol]
        }
        return x
    }

    function formatData(data) {
        let x = {}
        for (let symbol in data[0]) {
            x[symbol] = { 
                now: data[0][symbol].toFixed(1),
                yesterday: data[1][symbol].toFixed(1),
                change: ((parseFloat(data[0][symbol]) / parseFloat(data[1][symbol]) - 1) * 100).toPrecision(2)
            }
        }
        return x
    }

    async function goGet() {
        let data = await Promise.all(requests.map(r =>
            fetch(r.url)
            .then(resp => resp.json())
            .then(data => cleanData(data))
        ))
        return formatData(data)
    } 

    return goGet()
}

module.exports = { getCommo }