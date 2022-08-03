import { withIronSessionSsr } from "iron-session/next";
import {format, formatDistance, isBefore, isAfter, parseISO, startOfHour,formatRFC3339,formatISO} from "date-fns"
import {useQuery} from "react-query"
import {
  Button, Card, LinearProgress,
  CardActions, CardContent, Grid, TextField, Typography, FormControl, InputLabel, Select,
  OutlinedInput, Box,Paper, Chip,List, ListItem,ListItemText,ListItemAvatar, Avatar,
  MenuItem, Table,  TableContainer,TableBody,TableRow, TableCell,TableHead, TableFooter
} from "@mui/material";
import ImageIcon from '@mui/icons-material/Image';
import WorkIcon from '@mui/icons-material/Work';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import { useState } from "react";
import {COOKIE} from "../../src/cookie";
import Head from "next/head";
import Prices from "./prices.json"

const PRICE_SUPPORT = {
  "2022.07": 192.78,
  "2022.06": 116.67,
  "2022.05": 95.32,
  "2022.04": 103.89,
  "2022.03": 117.04,
  "2022.02": 50.54,
  "2022.01": 70.63,
  "2021.12": 73.62,
}

export const getServerSideProps = withIronSessionSsr(
    async function ({req, res,}) {
      const user = req.session.user;

      if (user === undefined) {
        res.setHeader("location", "/");
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

export default function Dashboard() {
  const [charger, setCharger] = useState('');
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const {data: chargers, isLoading: isLoadingChargers} = useQuery("chargers", () => fetch("/api/chargers").then(res => res.json()))
  const {data: sessions, isLoading: isLoadingSessions} = useQuery(
      "sessions-"+charger,
      () => fetch(`/api/sessions?charger=${charger}`).then(res => res.json()),
      {enabled: !!charger}
  )

  return (
      <>
        <Head>
          <title>Zaptec charging price</title>
        </Head>
        <Grid mt={3} spacing={3} container justifyContent={"center"} alignItems={"center"}>
        <Grid item sm={8} xs={12}>
          <SettingsCard
              chargers={chargers ?? []}
              charger={charger}
              onChangeCharger={e => setCharger(e.target.value)}

              start={startDate}
              onChangeStart={e => setStartDate(e.target.value)}

              end={endDate}
              onChangeEnd={e => setEndDate(e.target.value)}
          />
          {(isLoadingChargers || isLoadingSessions) && <LinearProgress/>}
        </Grid>
        {sessions && startDate && endDate && <Grid mb={3} item sm={8} xs={12}>
          <ReportCard key={charger} charger={charger} sessions={sessions} start={startDate} end={endDate}/>
        </Grid>}
      </Grid></>
  );
}

function SettingsCard({chargers, onChangeCharger, onChangeStart, onChangeEnd, charger, start,end}) {
  return <Card>
    <CardContent>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
              fullWidth
              value={charger}
              select
              onChange={onChangeCharger}
              label={"Charger"}
          >
            {chargers.map(charger => <MenuItem key={charger.Id} value={charger.Id}>
              {charger.Name}
            </MenuItem>)}
          </TextField>
        </Grid>
        <Grid container item xs={12} spacing={3}>
          <Grid item xs={6}>
            <TextField
                fullWidth
                label={"Start day"}
                helperText={"Include all charges started this day"}
                value={start}
                onChange={onChangeStart}
                type="date"
                InputLabelProps={{shrink: true}}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
                InputLabelProps={{shrink: true}}
                fullWidth
                label={"End day"}
                helperText={"Include all charges started before midnight"}
                value={end}
                onChange={onChangeEnd}
                type="date"
            />
          </Grid>
        </Grid>
      </Grid>

    </CardContent>
  </Card>;
}

const ReportCard = ({charger, start, end, sessions}) => {
  start = parseISO(start)
  end = parseISO(end)

  let sessionCount = 0.0
  let totalEnergy = 0.0
  let totalSpotPrice = 0.0
  let totalSupport = 0.0

  return <><TableContainer mb={3} component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Start</TableCell>
          <TableCell align="right">Duration</TableCell>
          <TableCell align="right">Energy</TableCell>
          <TableCell align="right">Price</TableCell>
          <TableCell align="right">Gov. support</TableCell>
          <TableCell align="right">User</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sessions.map((session, i) => {
          const sStart = parseISO(session.StartDateTime)
          const sEnd = parseISO(session.EndDateTime)

          const sessionStartedInPeriod = isAfter(sStart, start) && !isAfter(sStart, end)

          if (!sessionStartedInPeriod)
            return null

          sessionCount++

          const distance = formatDistance(sStart, sEnd)

          let [sessionPrice, sessionEnergy, sessionSupport] = (session.EnergyDetails ?? []).reduce((session, {Timestamp, Energy}) => {
            const d = startOfHour(parseISO(Timestamp));
            let s = d.toISOString().substring(0,19) + "Z";
            const month = format(d, "yyyy.MM")
            const p = Prices[s] ?? 0 //
            session[0] += p * Energy
            session[1] += Energy
            session[2] += Energy * -(PRICE_SUPPORT[month] ?? 0)

            return session
          }, [0.0, 0.0, 0.0])

          // If the charger is offline, we might not have EnergyDetails, lets just use the price from start of the session
          // Todo: use the average spot price from the duration of the session instead.
          if (sessionEnergy < 1) {
            const d = startOfHour(parseISO(session.StartDateTime));
            let s = d.toISOString().substring(0,19) + "Z";
            const month = format(d, "yyyy.MM")
            sessionEnergy = session.Energy
            sessionPrice = session.Energy * Prices[s]
            sessionSupport = Math.round(sessionEnergy * -(PRICE_SUPPORT[month] ?? 0))
          }
          const energy = Math.round(sessionEnergy * 100) / 100
          const price = Math.round(sessionPrice) / 100 // convert øre til kr
          const support = Math.round(sessionSupport) / 100

          totalSpotPrice += sessionPrice
          totalSupport += sessionSupport
          totalEnergy += session.Energy

          return (
              <TableRow
                  key={session.Id}
                  sx={{'&:last-child td, &:last-child th': {border: 0}}}
              >
                <TableCell component="th" scope="row">
                  {format(sStart, "dd.MM.yyyy hh:mm")}
                </TableCell>
                <TableCell align="right">{distance}</TableCell>
                <TableCell align="right">{energy}kW</TableCell>
                <TableCell align="right">{price}kr</TableCell>
                <TableCell align="right">{support}kr</TableCell>
                <TableCell align="right">{session.UserFullName}</TableCell>
              </TableRow>
          )
        })}
      </TableBody>
      <TableBody>
        <TableRow><TableCell colSpan={4} align={"right"}><strong>Sessions:</strong></TableCell><TableCell>{sessionCount}</TableCell></TableRow>
        <TableRow><TableCell colSpan={4} align={"right"}><strong>Energy:</strong></TableCell><TableCell>{Math.round(totalEnergy * 100) / 100 + "kW"}</TableCell></TableRow>
        <TableRow><TableCell colSpan={4} align={"right"}><strong>Spot price:</strong></TableCell><TableCell>{Math.round(totalSpotPrice) / 100}kr</TableCell></TableRow>
        <TableRow><TableCell colSpan={4} align={"right"}><strong>Total gov. support:</strong></TableCell><TableCell>{Math.round(totalSupport) / 100}kr</TableCell></TableRow>
        <TableRow><TableCell colSpan={4} align={"right"}><strong>Totat:</strong></TableCell><TableCell>{Math.round(totalSpotPrice + totalSupport) / 100}kr</TableCell></TableRow>
      </TableBody>
      <TableFooter>
      </TableFooter>
    </Table>
  </TableContainer></>
}
