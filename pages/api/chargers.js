import {withIronSessionApiRoute} from "iron-session/next";
import {login} from "../../src/server/zaptectApi";
import {COOKIE} from "../../src/cookie";

export default withIronSessionApiRoute(
    async function chargers(req, res) {
        try {
            const chargers = await getChargers(req.session.user.access_token);
            console.log(chargers)
            res.status(200).json(chargers)
            res.end()
        } catch (e) {
            res.status(401);
        }
    },
    COOKIE
);
