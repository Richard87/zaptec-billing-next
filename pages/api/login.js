import { withIronSessionApiRoute } from "iron-session/next";
import fetch from "node-fetch";
import { login } from "../../src/server/zaptectApi";

export default withIronSessionApiRoute(
  async function loginRoute(req, res) {
    try {
      const { username, password } = req.body;
      const { access_token, expires_in } = login(username, password);

      req.session.user = { username, access_token, expires_in };
      await req.session.save();

      res.redirect(301, "/dashboard");
    } catch (e) {
      res.redirect(301, "/?error=access_denied");
    }
  },
  {
    cookieName: "zaptec_user",
    password: process.env.SESSION_KEY,
    ttl: 12 * 60 * 60, // 12 hours
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
  }
);
