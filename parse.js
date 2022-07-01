const fs = require("fs");

const files = [
    "2021-10.json", "2021-11.json", "2021-12.json",
    "2022-01.json", "2022-02.json", "2022-03.json", "2022-04.json", "2022-05.json", "2022-06.json",
]

/**
 *
 * @type {[date:string]: {[hours:string]: float}}
 */
const prices = {};

files.forEach(file => {
    const content = fs.readFileSync(file)
    const data = JSON.parse(content)

    data[0].months[0].days.forEach(d => {
        d.hours.forEach(h => {
            prices[h.utcDateTime] = (Math.round(h.energyCostConsumptionPriceAvg * 100) / 100)
        })
    })
})

fs.writeFileSync("prices.json", JSON.stringify(prices,null, 2))
