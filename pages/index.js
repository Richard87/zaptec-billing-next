import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import {
  Button,
  Container,
  FormControl,
  Grid,
  Paper,
  TextField,
  Typography,
  Card,
  CardContent,
  CardActions,
  CardHeader,
} from "@mui/material";

export default function Home() {
  return (
    <Grid mt={3} container justifyContent={"center"} alignItems={"center"}>
      <Grid item>
        <Card>
          <CardContent>
            <Typography mb={3} variant={"h5"}>Zaptec Billing Login</Typography>
            <TextField sx={{marginBottom: 3}} label={"Username"} fullWidth />
            <TextField sx={{marginBottom: 3}} label={"Password"} fullWidth type={"password"} />
          </CardContent>
          <CardActions>
            <Button>Login</Button>
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  );
}
