import fetch from "node-fetch";
import cache from "memory-cache";
import {differenceInCalendarMonths, addMonths, startOfMonth, endOfMonth, isSameMonth, format } from "date-fns"

const FetchPricesLyse = async (req, res) => {
   const {startDate, endDate, changedDate} = req?.query
   // console.log(req.query)
   if (startDate === undefined || endDate === undefined) {
      res.status(400)
      res.end()
   }

   const cachedResponse = cache.get('prices')
   
   if (cachedResponse!==null && changedDate!=='true') {
      console.log('Fetch from cache')
      res.status(200).json(cachedResponse);
   } else { 

   try {
         console.log('Fetch from API')

         // Dele opp en range i flere ranges på en måned. API liker dårlig mer en en måned i slengen (gir ufulstendige data)
         function splitDateRangeIntoMonthRanges(startDate, endDate) {
            const monthRanges = []
            if (!startDate || !endDate || startDate > endDate) {
              return monthRanges
            }
            const numMonths = differenceInCalendarMonths(endDate, startDate)
            if (numMonths === 0) {
              monthRanges.push({ startDate, endDate })
              return monthRanges
            }
            let currentDate = startOfMonth(startDate)
            let nextMonthStartDate = addMonths(currentDate, 1)
            let rangeEndDate = endOfMonth(currentDate)
            if (isSameMonth(startDate, currentDate)) {
              monthRanges.push({ startDate, endDate: rangeEndDate })
            } else {
              monthRanges.push({ startDate: currentDate, endDate: rangeEndDate })
            }
            while (nextMonthStartDate <= endOfMonth(endDate)) {
              currentDate = nextMonthStartDate
              nextMonthStartDate = addMonths(currentDate, 1)
              rangeEndDate = nextMonthStartDate <= endOfMonth(endDate) ? endOfMonth(currentDate) : endDate
              monthRanges.push({ startDate: currentDate, endDate: rangeEndDate })
            }
            if (monthRanges.length > 0) {
              const firstMonthRange = monthRanges[0]
              const lastMonthRange = monthRanges[monthRanges.length - 1]
              if (firstMonthRange.startDate < startDate) {
                firstMonthRange.startDate = startDate
                firstMonthRange.endDate = endOfMonth(startDate)
              }
              if (lastMonthRange.endDate > endDate) {
                lastMonthRange.endDate = endDate
              }
            }
            return monthRanges
         }
         
         const start = new Date(startDate)
         const end = new Date(endDate)
         
         const allMonthRanges = splitDateRangeIntoMonthRanges(start, end)

         
         // Loope over alle date ranges for å hente data fra API
         const fetchOptions = {
            headers: {
               "Ocp-Apim-Subscription-Key":`dc1fc20b6d7c44cf81c47900d6fdb6c8`, 
               "Host": `apim.prod.up.lyse.no`
            }
         }
         const baseUrl = 'https://apim.prod.up.lyse.no/public-lookup/v1/nord-pool-area-price-per-hour-date-range';
         const responses = await Promise.all(
            allMonthRanges.map(dates => 
               fetch(`${baseUrl}?from=${format(new Date(dates.startDate), 'yyyy-MM-dd')}&to=${format(new Date(dates.endDate), 'yyyy-MM-dd')}&areaCode=NO2`, fetchOptions)
            )
         );
         const dates1 = await Promise.all(responses.map(res => res.json()));
         
         const arr = dates1.map(item=>{
            return item.priceHours.map(itm=>{
               return itm.hours
            })
         }).flat()
         
         const returnData = {}
         const paslag = 3.8

         arr.map(item=>{
           item.map(itm=>{
               returnData[itm.hour] = Math.round((itm.price+paslag) * 100) / 100
            })
         })


         //Sett data i memory cache. Brukes om det ikke endres dato
         const hours = 1
         cache.put('prices', returnData, hours * 1000 * 60 * 60)
         res.status(200).json(returnData)
      }
      catch(e){
         console.error(e)
         res.status(401)
      }
      finally{
         res.end()
      }
   }   
}

export default FetchPricesLyse;