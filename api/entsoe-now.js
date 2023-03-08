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
            ['Nord', '10YNO-4--------9']
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
        if (points.length !== 24) return false // CET/CEST-days have 25 points
        return points.reduce((sum, p) => sum + p, 0) / 24
      }

    // let eur = commo[commo.findIndex(e => e.name == "latest")].data.EUR
    let eur = commo.Euro.now

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
            .then(parsed => cleanData(parsed)) // Format and clean
        ))
        data.map((d,i) => requests[i].data = d) // Merge with requests
        return requests
    }

    return goGet()
}

module.exports = { getEl }

/* 
ENTSO-E 


/* 
5-year average spot prices 

$csv = './spot.csv';
$csv_arr = [];
if (!($f = fopen($csv, 'r'))) {
	die('Cannot open the file ' . $filename);
}
while (($row = fgetcsv($f, null, ";")) !== false) {
	$csv_arr[$row[0]] = array( $row[1], $row[2], $row[3], $row[4], $row[5], $row[6] ); // (Oslo, Kristiansand, Bergen, Molde, Trondheim, Tromsø)
}
fclose($f);


// Get Oslo and Tromsø
$today_dm = date("j.n.");
$historic_avg_oslo = floatval($csv_arr[$today_dm][0]);
$historic_avg_tromso = floatval($csv_arr[$today_dm][5]);
*/

/* 
Get yesterdays avg from el.json


$el = file_get_contents("el.json");
$el_arr = json_decode($el, true);
$yesterday_key = array_search(date("Y-m-d", strtotime('-1 day')), array_column($el_arr['OSLO'], 'x'));
$yesterday_avg_oslo = $el_arr['OSLO'][$yesterday_key]['y'];
$yesterday_avg_tromso = $el_arr['TROMSO'][$yesterday_key]['y'];


/* 
Check data


$check = true;
if(!$responses or !$el or !$end->rates or !$start->rates) $check = false;
foreach($end->rates as $key => $value) {
    if ($value = 0) $check = false;
}
foreach($start->rates as $key => $value) {
    if ($value = 0) $check = false;
}


/* 
Build export array anyway FIX: Change 'avg' to 'start' and update front end


$n = array(
    'meta' => array(
        'start' => $start_date,
        'end' => $end_date,
        'created' => time(),
        'EUR' => $eur
    ),
    'tickers' => array(
        'OSLO' => array(
            'name' => 'Strøm (Øst)',
            'hours' => $exp['Oslo'],
            'avg' => round($averages['Oslo'], 0),
            'yesterday' => $yesterday_avg_oslo,
            //'historic_avg' => round(($historic_avg_oslo / 10), 2),
            'change' => round(($averages['Oslo'] / $yesterday_avg_oslo - 1) * 100, 1),
            'ref' => 'Dagens snittpris mot gårsdagens'
        ),
        'TROMSO' => array(
            'name' => 'Strøm (Nord)',
            'hours' => $exp['Tromsø'],
            'avg' => round($averages['Tromsø'], 1),
            'yesterday' => $yesterday_avg_tromso,
            //'historic_avg' => round(($historic_avg_tromso / 10), 2),
            'change' => round(($averages['Tromsø'] / $yesterday_avg_tromso - 1) * 100, 1),
            'ref' => 'Dagens snittpris mot gårsdagens'
        ),
        'WHEAT' => array(
            'name' => 'Hvete',
            'start' => round(1 / $start->rates->WHEAT, 1),
            'end' => round(1 / $end->rates->WHEAT, 1),
            'change' => round((((1 / $end->rates->WHEAT) / (1 / $start->rates->WHEAT)) - 1) * 100, 1),
            'ref' => 'Siden i går'
        ),
        'SOYBEAN' => array(
            'name' => 'Soya',
            'start' => round((1 / $start->rates->SOYBEAN) * 36.74371036414626, 2),
            'end' => round((1 / $end->rates->SOYBEAN) * 36.74371036414626, 2),
            'change' => round((((1 / $end->rates->SOYBEAN) / (1 / $start->rates->SOYBEAN)) - 1) * 100, 1),
            'ref' => 'Siden i går'
        ),
        'BRENTOIL' => array(
            'name' => 'Råolje',
            'start' => round(1 / $start->rates->BRENTOIL, 1),
            'end' => round(1 / $end->rates->BRENTOIL, 1),
            'change' => round((((1 / $end->rates->BRENTOIL) / (1 / $start->rates->BRENTOIL)) - 1) * 100, 1),
            'ref' => 'Siden i går'
        )
    )
);


/* 
Write/overwrite json file


if ($check == true) {
    $output_file = fopen('daily.json', 'w');
    if (fwrite($output_file, json_encode($n, JSON_UNESCAPED_UNICODE))) echo "Success in " . round((microtime(true) - $performance_start), 2) . " seconds.";
    fclose($output_file);
}
else {
    $archive_name = './failed/daily-' . date("Ymd-Hi") . '.json';
    $output_file = fopen($archive_name, 'w');
    fwrite($output_file, json_encode($n, JSON_UNESCAPED_UNICODE));
    fclose($output_file);
    echo "Failed.";
}

*/