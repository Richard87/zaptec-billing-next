import { withIronSessionApiRoute } from "iron-session/next";
import fetch from "node-fetch";
import {COOKIE} from "../../src/cookie"

export default withIronSessionApiRoute(
    async function loginRoute(req, res) {
        const { username, password } = req.body;
        if (!username) {
            console.error(data);
            res.redirect(301, "/?error=username_missing");
            return
        }
        if (!password) {
            console.error(data);
            res.redirect(301, "/?error=password_missing");
            return
        }


        const response = await fetch("https://api.zaptec.com/oauth/token", {
            method: "POST",
            body: `grant_type=password&username=${username}&password=${password}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                Accept: "application/json",
            },
        });
        const data = await response.json();


        if (response.status !== 200) {
            console.error(data);
            res.redirect(301, "/?error=access_denied");
            return
        }

        req.session.user = { username, ...data };
        await req.session.save();

        res.redirect(301, "/dashboard");
    },
COOKIE);
