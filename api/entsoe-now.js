const { XMLParser } = require("fast-xml-parser")
const parser = new XMLParser()

function getEl(commo) {

    let requests = [],
        today = new Date(),
        yesterday = new Date(today),
        tomorrow = new Date(today)

    yesterday.setDate(yesterday.getDate() - 1)
    tomorrow.setDate(tomorrow.getDate() + 1)

    function entsoeDateTime (dateObj, hoursMinutes) {
        return `${dateObj.getFullYear()}${(dateObj.getMonth()+1).toLocaleString("nb-NO", {minimumIntegerDigits:2})}${dateObj.getDate().toLocaleString("nb-NO", {minimumIntegerDigits:2})}${hoursMinutes}`
    }

    // Parameters
    let entsoe = {
        securityToken: '08763ae4-f5ea-4254-8675-f5c3351e15e2',
        start: entsoeDateTime(yesterday, '0000'),
        end: entsoeDateTime(tomorrow, '2300'),
        domains: [
            ['Øst', '10YNO-1--------2'],
            ['Sør', '10YNO-2--------T'],
            ['Midt', '10YNO-3--------J'],
            ['Nord', '10YNO-4--------9'],
            ['Vest', '10Y1001A1001A48H'],
        ],
        urlBase: 'https://web-api.tp.entsoe.eu/api',
        urlParam: function () {
            return `?securityToken=${this.securityToken}&documentType=A44&periodStart=${this.start}&periodEnd=${this.end}`
        }
    }

    // Add requests to loop
    entsoe.domains.forEach(d => {
        requests.push({
            name: d[0], 
            url: entsoe.urlBase + entsoe.urlParam() + "&in_domain=" + d[1] + "&out_domain=" + d[1]})
    })

    function getAverage(points) {
        // if (points.length !== 24) return false // CET/CEST-days have 25 points
        return points.reduce((sum, p) => sum + p, 0) / points.length
      }

    // let eur = commo[commo.findIndex(e => e.name == "latest")].data.EUR
    let eur = commo.Euro.yesterday

    function cleanData(data) {
        let days = data.Publication_MarketDocument.TimeSeries.map(d => {
            let hours = d.Period.Point.map(p => p["price.amount"] * eur / 10)
            return { 
                hours: hours.map(d => d.toFixed(2)),
                avg: getAverage(hours).toFixed(2)
            }
        })
        return days
    }

    // Fetch all and return requests array
    async function goGet() {
        let data = await Promise.all(requests.map(r =>
            fetch(r.url)
            .then(resp => resp.text())
            .then(data => parser.parse(data)) // Parse XML
            .then(parsed => { return cleanData(parsed) }) // Format and clean
        ))
        data.map((d,i) => requests[i].data = d) // Merge with requests
        return requests
    }

    return goGet()
}

module.exports = { getEl }