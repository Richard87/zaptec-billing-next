import Head from "next/head";
import {COOKIE} from "../src/cookie"
import { withIronSessionSsr } from "iron-session/next";
// import styles from "../styles/Home.module.css";
import {
  Button,
  Grid,
  TextField,
  Typography,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";

export const getServerSideProps = withIronSessionSsr(
    async function ({req, res,}) {
      const user = req.session.user;

      if (user !== undefined) {
        res.setHeader("location", "/dashboard");
        res.statusCode = 302;
        res.end();
        return {
          props: {},
        };
      }

      return {
        props: {},
      };
    },
    COOKIE
);

export default function Home() {
  return (
      <>
        <Head>
          <title>Zaptec charging price</title>
        </Head>
        <Grid mt={3} container justifyContent={"center"} alignItems={"center"}>
        <Grid item>
          <Card>
            <form action={"/api/login"} method={"post"}>
              <CardContent>
                <Typography mb={3} variant={"h5"}>
                  Zaptec Billing Login
                </Typography>
                <TextField
                    name={"username"}
                    sx={{marginBottom: 3}}
                    label={"Username"}
                    fullWidth
                />
                <TextField
                    name={"password"}
                    sx={{marginBottom: 3}}
                    label={"Password"}
                    fullWidth
                    type={"password"}
                />
              </CardContent>
              <CardActions>
                <Button type={"submit"}>Login</Button>
              </CardActions>
            </form>
          </Card>
        </Grid>
      </Grid></>
  );
}
