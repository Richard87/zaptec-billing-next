import {withIronSessionApiRoute} from "iron-session/next";
import {COOKIE} from "../../src/cookie"
import fetch from "node-fetch";
import cache from "memory-cache";

export default withIronSessionApiRoute(
    async function chargers(req, res) {
        try {

            let Data = await FetchChargers(req.session.user.access_token);

            // console.log("chargers", Data)

            // res.status(401)
            res.status(200).json(Data)
        } catch (e) {
            res.status(401);
        } finally {
            res.end()
        }
    },
    COOKIE
);


const FetchChargers = async (token) => {
    const url = `https://api.zaptec.com/api/chargers`
    const cachedResponse = cache.get(url+token);

    if (cachedResponse) {
        return cachedResponse;
    } else {
        const hours = 1;

        const response = await fetch(url, {headers: {"Authorization":`Bearer ${token}`}})
        const {Data} = await response.json()

        cache.put(url+token, Data, hours * 1000 * 60 * 60);
        return Data;
    }

}
