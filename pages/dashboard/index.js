import { withIronSessionSsr } from "iron-session/next";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Box,
  Chip,
  MenuItem,
} from "@mui/material";
import { useState } from "react";
import { getChargers } from "../../src/server/zaptectApi";

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const { access_token, username } = req.session.user;
    const chargers = await getChargers(access_token);

    return {
      props: {
        user: username,
        chargers: chargers,
      },
    };
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

export default function Dashbiard({ user, chargers }) {
  const [selection, setSelection] = useState([]);

  console.log(user, chargers);

  const onChange = (e, args) => {
    setSelection(e.target.value);
  };

  return (
    <Grid mt={3} container justifyContent={"center"} alignItems={"center"}>
      <Grid item>
        <Card>
          <CardContent>
            <Typography mb={3} variant={"h5"}>
              Chose chargers
            </Typography>
            <FormControl sx={{ m: 1, width: 300 }}>
              <InputLabel id="demo-multiple-chip-label">Charger</InputLabel>
              <Select
                labelId="select-charger"
                value={selection}
                onChange={onChange}
              >
                {chargers.map((charger) => (
                  <MenuItem key={charger.Id} value={charger.Id}>
                    {charger.Name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
