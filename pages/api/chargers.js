import {withIronSessionApiRoute} from "iron-session/next";
import {COOKIE} from "../../src/cookie"
import fetch from "node-fetch";

export default withIronSessionApiRoute(
    async function chargers(req, res) {
        try {
            const response = await fetch("https://api.zaptec.com/api/chargers", {
                headers: {"Authorization":`Bearer ${req.session.user.access_token}`}
            })

            let {Data} = await response.json();
            res.status(200).json(Data)
            res.end()
        } catch (e) {
            res.status(401);
        }
    },
    COOKIE
);
