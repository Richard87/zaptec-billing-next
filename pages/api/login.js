import { withIronSessionApiRoute } from "iron-session/next";

export default withIronSessionApiRoute(
  async function loginRoute(req, res) {
    // get user from database then:
    const { username, password } = req.body;

    // @ts-ignore
    req.session.user = { username, password };
    await req.session.save();

    res.redirect(301, "/dashboard");
  },
  {
    cookieName: "zaptec_user",
    password: process.env.SESSION_KEY,
    // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
  }
);
