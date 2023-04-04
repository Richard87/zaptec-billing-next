import fetch from "node-fetch";
import cache from "memory-cache";

const Stromstotte = async (req, res) => {
   const cachedResponse = cache.get('stottea')
   
   if (cachedResponse!==null) {
      console.log('Fetch from cache')
      res.status(200).json(cachedResponse);
   } else { 

   try {
         console.log('Fetch from API')
         
         const baseUrl = 'https://tibber.com/no/api/lookup/price-overview?postalCode=4057';
         const response = await fetch(`${baseUrl}`)
         const tmp = await response.json()
         const data = tmp.energy.last12Months.map(item=>{
            const index = item.priceComponents.map(x=>x.type).indexOf('power')
            const price = item.priceComponents[index]
            const kompensasjonWinter = [1,2,3,9,10,11,12].includes(item.month)
            const kompensasjonSommer = [4,5,6,7,8].includes(item.month)
            // console.log(kompensasjonSommer, kompensasjonWinter, item.month)

            const kalkulertKompnsasjon =  
               kompensasjonWinter && (item.year <= 2023 && (item.month <= 3 || item.month >= 9)) ? ((price.priceIncludingVat*100)-87.5)*0.9 
               : kompensasjonSommer && (item.year <= 2023 && (item.month > 3 || item.month < 9)) ? ((price.priceIncludingVat*100)-87.5)*0.8
               : ((price.priceIncludingVat*100)-87.5)*0.9
 
            const zeroPad = (num, places) => String(num).padStart(places, '0')
            return {
               [`${item.year}.${zeroPad(item.month, 2)}`]: Math.round(kalkulertKompnsasjon*100)/100
            }
         }).reverse()

         const merged = Object.assign(...data)
         
         //Sett data i memory cache. Brukes om det ikke endres dato
         const hours = 1
         cache.put('stotte', merged, hours * 1000 * 60 * 60)
         res.status(200).json(merged)
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

export default Stromstotte;