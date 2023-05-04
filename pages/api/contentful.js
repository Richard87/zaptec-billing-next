import * as contentful from "contentful";
import cache from "memory-cache";

const getContentful = async (req, res) => {
   const { changedDate } = req?.query;
   // console.log(req.query)

   function format_month(d) {
      return (d.getMonth() < 9 ? "0" : "") + (d.getMonth() + 1);
   }

   const cachedResponse = cache.get("prices");

   if (cachedResponse !== null && changedDate !== "true") {
      console.log("Fetch from contentful cache");
      res.status(200).json(cachedResponse);
   } else {
      try {
         console.log("Fetch from contentful api");

         const client = contentful.createClient({
            space: "jhflkxp3m6cq",
            accessToken: "p-iBYpCYu3KoEOClzA8Tdh3ZoCTd86yMa_rdhIE94R4",
         });

         const response = client
            .getEntries({
               content_type: "lyseStrmData",
               order: "-sys.createdAt",
            })
            .then((posts) => posts);
         const data = await response;

         const returnData = data.items.map((item) => {
            const date = new Date(`${item.fields.year}, ${item.fields.month}`);
            const totalInklMva = Math.round((item.fields.fakturaSum + item.fields.fakturaNettleie) * 1000) / 1000;
            return {
               ...item.fields,
               totalInklMva: totalInklMva,
               pr_kWh: Math.round((totalInklMva / item.fields.forbruk) * 100000)/1000,
               date: `${item.fields.year}.${format_month(date)}`,
            };
         });

         console.log(returnData)
         //Sett data i memory cache. Brukes om det ikke endres dato
         const hours = 1;
         cache.put("prices", returnData, hours * 1000 * 60 * 60);
         res.status(200).json(returnData);
      } catch (e) {
         console.error(e);
         res.status(401);
      } finally {
         res.end();
      }
   }
};

export default getContentful;
