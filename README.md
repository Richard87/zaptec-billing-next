# Zaptec Billing

A Zaptec App to check spot electricity prices for calculating bill.

Log in with your zaptec credentials, and select charger or ID you wish to look at.

Visit the production build at https://zaptec-billing.netlify.app

## License:

- the file `pages/dashboard/prices.json` is PROPRIETARY and not allowed to use, please find your own spot electricity prices, and format accordingly if you use this project.
- everything else is MIT licensend.


## TODO:
- [X] Select Charger and or User
- [X] Select date-range and fetch charging sessions (store selection in local storage)
- [ ] ~~Select Pool spot prices region~~
- [X] Fetch charging sessions from Zaptec API
- [ ] Calculate prices
- [ ] Script to refresh prices from Nordpool


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

