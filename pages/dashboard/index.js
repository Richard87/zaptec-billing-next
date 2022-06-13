import { withIronSessionSsr } from "iron-session/next";
import {useQuery} from "react-query"
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
import {COOKIE} from "../../src/cookie";

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const { username } = req.session.user;

    return {
      props: {
        user: username,
      },
    };
  },
    COOKIE
);

export default function Dashboard({ user }) {
  const [selection, setSelection] = useState([]);
  const {data, isLoading, isFetching} = useQuery("chargers", () => fetch("/api/chargers").then(res => res.json()))
  const chargers = data ?? []

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
