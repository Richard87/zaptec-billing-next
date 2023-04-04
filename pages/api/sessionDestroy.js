import { withIronSessionApiRoute } from "iron-session/next";
import {COOKIE} from "../../src/cookie"

export default withIronSessionApiRoute(
   async function sessionDestroy(req, res) {
    req.session.destroy();
    // res.redirect(301, "/dashboard");
    res.status(200).json({status: 'ok'})
},
COOKIE)