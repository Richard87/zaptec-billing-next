import { withIronSessionSsr } from "iron-session/next";
import {
   format,
   formatDistance,
   isAfter,
   parseISO,
   startOfHour,
} from "date-fns";
import { useQuery } from "react-query";
import {
   Card,
   LinearProgress,
   CardContent,
   Grid,
   TextField,
   MenuItem,
   Table,
   TableContainer,
   TableBody,
   TableRow,
   TableCell,
   TableHead,
   TableFooter,
   Paper,
   Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import { COOKIE } from "../../../src/cookie";
import Head from "next/head";
import SupportPrice from "../support.json";

export const getServerSideProps = withIronSessionSsr(async function ({
   req,
   res,
}) {
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
COOKIE);

export default function Dashboard() {
   const [charger, setCharger] = useState("");
   const [startDate, setStartDate] = useState("");
   const [endDate, setEndDate] = useState("");
   const [change, setChange] = useState(false);

   function destroySession() {
      console.log("desroy");
      fetch("/api/sessionDestroy").then((res) => res.json());
      window.location.href = "/dashboard";
   }

   const { data: chargers, isLoading: isLoadingChargers } = useQuery(
      "chargers",
      () =>
         fetch("/api/chargers")
            .then((response) => {
               if (!response.ok) {
                  destroySession();
               }
               return response.json();
            })
            .catch((error) => {
               console.log(error);
            })
   );
   // console.log(chargers)

   // const {data: chargers, isLoading: isLoadingChargers} = useQuery("chargers", () => fetch("/api/chargers").then(res => res.json()))

   const { data: sessions, isLoading: isLoadingSessions } = useQuery(
      "sessions-" + charger,
      () => fetch(`/api/sessions?charger=${charger}`).then((res) => res.json()),
      { enabled: !!charger }
   );

   // console.log(sessions)

   const { data: prices, isLoading: isLoadingPrices } = useQuery(
      ["prices", startDate, endDate, change],
      () => {
         const res = fetch(
            `/api/pricesLyse?startDate=${startDate}&&endDate=${endDate}&&changedDate=${change}`
         ).then((res) => res.json());
         setChange(false);
         return res;
      },
      { enabled: startDate !== "" && endDate !== "" }
   );

   useEffect(() => {
      setChange(true);
   }, [startDate, endDate]);

   return (
      <>
         {/* <Button onClick={()=>{
        destroySession();
      }}>Delete zaptec cookie</Button> */}
         <Head>
            <title>Zaptec charging price</title>
         </Head>

         <Grid
            mt={3}
            spacing={3}
            container
            justifyContent={"center"}
            alignItems={"center"}
         >
            <Grid item sm={8} xs={12}>
               <SettingsCard
                  chargers={chargers ?? []}
                  charger={charger}
                  onChangeCharger={(e) => setCharger(e.target.value)}
                  start={startDate}
                  onChangeStart={(e) => {
                     setStartDate(e.target.value);
                     setChange(true);
                  }}
                  end={endDate}
                  onChangeEnd={(e) => {
                     setEndDate(e.target.value);
                     setChange(true);
                  }}
               />
               {(isLoadingChargers || isLoadingSessions || isLoadingPrices) && (
                  <LinearProgress />
               )}
            </Grid>
            {prices && sessions && startDate && endDate && (
               <Grid mb={3} item sm={8} xs={12}>
                  <ReportCard
                     key={charger}
                     charger={charger}
                     sessions={sessions}
                     start={startDate}
                     end={endDate}
                     prices={prices}
                  />
               </Grid>
            )}
         </Grid>
         {/* <pre>
          {JSON.stringify(prices, null, 2)}
        </pre> */}
      </>
   );
}

function SettingsCard({
   chargers,
   onChangeCharger,
   onChangeStart,
   onChangeEnd,
   charger,
   start,
   end,
}) {
   return (
      <Card>
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
                     {chargers.map((charger) => (
                        <MenuItem key={charger.Id} value={charger.Id}>
                           {charger.Name}
                        </MenuItem>
                     ))}
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
                        InputLabelProps={{ shrink: true }}
                     />
                  </Grid>
                  <Grid item xs={6}>
                     <TextField
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        label={"End day"}
                        helperText={
                           "Include all charges started before midnight"
                        }
                        value={end}
                        onChange={onChangeEnd}
                        type="date"
                     />
                  </Grid>
               </Grid>
            </Grid>
         </CardContent>
      </Card>
   );
}

const ReportCard = ({ charger, start, end, sessions, prices }) => {
   start = parseISO(start);
   end = parseISO(end);

   let sessionCount = 0.0;
   let totalEnergy = 0.0;
   let totalSpotPrice = 0.0;
   let totalSupport = 0.0;

   let prevMon = null;
   let numMonths = 0;

   // let kapasitetsledd = 48.0; // kwH

   const energileddDag = 22.47;
   const energileddNattHelg = 16.07;
   // const energiledd = (energileddDag + energileddNattHelg) / 2;


   const mva = 1.25;

   return (
      <>
         <TableContainer mb={3} component={Paper}>
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
                  {prices &&
                     sessions.map((session, i) => {
                        
                        
                        const sStart = parseISO(session.StartDateTime);
                        const sEnd = parseISO(session.EndDateTime);
                        
                        const sessionStartedInPeriod =
                        isAfter(sStart, start) && !isAfter(sStart, end);
                        
                        if (!sessionStartedInPeriod) return null;
                        
                        sessionCount++;
                        
                        const distance = formatDistance(sStart, sEnd);
                        
                        const result = Object.values(
                           session?.EnergyDetails.reduce(
                              (acc, { Timestamp, Energy }) => {
                                 const date = format(
                                    parseISO(Timestamp.substring(0, 19)),
                                    "yyyy-MM-dd'T'HH"
                                 );
                                 const key = `${date}:00:00.000+00:00`;
                                 if (!acc[key]) {
                                    acc[key] = {
                                       Timestamp: key,
                                       Energy: Energy,
                                    };
                                 } else {
                                    acc[key].Energy += Energy;
                                 }
                                 return acc;
                              },
                              {}
                           )
                        );
                        // const high = Math.max(
                        //    ...session?.EnergyDetails.map((x) => x.Energy)
                        // );
                        // console.log(session?.EnergyDetails);
                        console.log(result);

                        let [
                           sessionPrice,
                           sessionEnergy,
                           sessionSupport,
                           sessionNettleie,
                        ] = (session.EnergyDetails ?? []).reduce(
                           (session, { Timestamp, Energy }) => {
                              const d = startOfHour(parseISO(Timestamp));
                              let s = d.toISOString().substring(0, 19) + "Z";
                              const month = format(d, "yyyy.MM");

                              const time = format(parseISO(Timestamp), "kk.mm");
                              const day = format(d, "MMMM");
                              const mon = format(d, "MM");

                              if (mon !== prevMon) ++numMonths;
                              prevMon = mon;

                              const p = prices[s] ?? 0; //
                              session[0] += p * Energy;
                              session[1] += Energy;
                              session[2] += Energy * -(SupportPrice[month] ?? 0); //Trekke fra strømstøtte
                              session[3] += Energy; // noe om nettleie her

                              // console.log(format(parseISO(Timestamp),"kk:mm"));
                              // console.log(time)
                              return session;
                           },
                           [0.0, 0.0, 0.0, 0.0]
                        );
                           // console.log(session.EnergyDetails);
                        // console.log(
                        //    sessionEnergy,
                        //    sessionPrice,
                        //    sessionSupport,
                        //    sessionNettleie
                        // );

                        // If the charger is offline, we might not have EnergyDetails, lets just use the price from start of the session
                        // Todo: use the average spot price from the duration of the session instead.
                        if (sessionEnergy < 1) {
                           console.log("sessionEnergy < 1");
                           const d = startOfHour(
                              parseISO(session.StartDateTime)
                           );
                           let s = d.toISOString().substring(0, 19) + "Z";
                           const month = format(d, "yyyy.MM");
                           sessionEnergy = session.Energy;
                           sessionPrice = session.Energy * prices[s];
                           sessionSupport = Math.round(
                              sessionEnergy * -(SupportPrice[month] ?? 0)
                           );
                        }
                        const energy = Math.round(sessionEnergy * 100) / 100;
                        const price = Math.round(sessionPrice) / 100; // convert øre til kr
                        const support = Math.round(sessionSupport) / 100;

                        totalSpotPrice += sessionPrice;
                        totalSupport += sessionSupport;
                        totalEnergy += session.Energy;
                        // totalNettleie += sessionNettleie;

                        return (
                           <TableRow
                              key={session.Id}
                              sx={{
                                 "&:last-child td, &:last-child th": {
                                    border: 0,
                                 },
                              }}
                           >
                              <TableCell component="th" scope="row">
                                 {format(sStart, "dd.MM.yyyy hh:mm")}
                              </TableCell>
                              <TableCell align="right">{distance}</TableCell>
                              <TableCell align="right">{energy}kW</TableCell>
                              <TableCell align="right">{price}kr</TableCell>
                              <TableCell align="right">{support}kr</TableCell>
                              <TableCell align="right">
                                 {session.UserFullName}
                              </TableCell>
                           </TableRow>
                        );
                     })}
               </TableBody>
               <TableBody>
                  <TableRow>
                     <TableCell colSpan={4} align={"right"}>
                        <strong>Sessions:</strong>
                     </TableCell>
                     <TableCell>{sessionCount}</TableCell>
                  </TableRow>
                  <TableRow>
                     <TableCell colSpan={4} align={"right"}>
                        <strong>Energy:</strong>
                     </TableCell>
                     <TableCell>
                        {Math.round(totalEnergy * 100) / 100 + "kW"}
                     </TableCell>
                  </TableRow>
                  <TableRow>
                     <TableCell colSpan={4} align={"right"}>
                        <strong>Spot price:</strong>
                     </TableCell>
                     <TableCell>{Math.round(totalSpotPrice) / 100}kr</TableCell>
                  </TableRow>
                  <TableRow>
                     <TableCell colSpan={4} align={"right"}>
                        <strong>Total gov. support:</strong>
                     </TableCell>
                     <TableCell>{Math.round(totalSupport) / 100}kr</TableCell>
                  </TableRow>

                  <TableRow>
                     <TableCell colSpan={4} align={"right"}>
                        <strong>Nettleie eks mva:</strong>
                     </TableCell>
                     <TableCell>
                        {/* {Math.round() / 100} */}
                        kr
                     </TableCell>
                  </TableRow>

                  <TableRow>
                     <TableCell colSpan={4} align={"right"}>
                        <strong>Total inkl mva:</strong>
                     </TableCell>
                     <TableCell>
                        {mva !== 0
                           ? Math.round((totalSpotPrice + totalSupport) * mva) /
                             100
                           : Math.round(totalSpotPrice + totalSupport) / 100}
                        kr
                     </TableCell>
                  </TableRow>
                  {mva !== 0 && (
                     <TableRow>
                        <TableCell colSpan={4} align={"right"}>
                           <strong>mva:</strong>
                        </TableCell>
                        <TableCell>
                           {Math.round((totalSpotPrice + totalSupport) * 0.25) /
                              100}
                           kr
                        </TableCell>
                     </TableRow>
                  )}
               </TableBody>
               <TableFooter></TableFooter>
            </Table>
         </TableContainer>
      </>
   );
};
