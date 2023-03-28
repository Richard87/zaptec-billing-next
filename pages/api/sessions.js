import {withIronSessionApiRoute} from "iron-session/next";
import {COOKIE} from "../../src/cookie"
import fetch from "node-fetch";
import cache from "memory-cache";

export default withIronSessionApiRoute(
    async function sessions(req, res) {
        try {
            const { charger } = req.query;
            const { access_token } = req.session.user

            let result = [];
            let page = 0;

            let Data = await FetchPage(charger,page, access_token)

            while (Data.length > 0) {
                result = result.concat(Data)

                page++;

                Data = await FetchPage(charger, page, access_token)
            }

            res.status(200).json(result)
            res.end()
        } catch (e) {
            res.status(401).send("Error");
            console.warn("SESSIONS", e)
        }
    },
    COOKIE
);

const FetchPage = async (charger, page, token) => {
    const url = `https://api.zaptec.com/api/chargehistory?ChargerId=${charger}&PageSize=100&PageIndex=${page}&DetailLevel=1`
    const cachedResponse = cache.get(url+token);

    if (cachedResponse) {
        return cachedResponse;
    } else {
        const hours = 24;

        // console.debug("Sessions", url)
        const response = await fetch(url, {headers: {"Authorization":`Bearer ${token}`}})
        const {Data} = await response.json()


        cache.put(url+token, Data, hours * 1000 * 60 * 60);
        return Data;
    }

}
