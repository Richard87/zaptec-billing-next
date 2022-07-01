
export const COOKIE = {
    cookieName: "zaptec_auth",
    password: process.env.SESSION_KEY,
    // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        maxCookieAge: 60*60*12,
    },
}
