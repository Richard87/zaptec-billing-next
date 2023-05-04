import { format, formatDistance, isAfter, parseISO, startOfHour } from "date-fns";

import {
   Table,
   TableContainer,
   TableBody,
   TableRow,
   TableCell,
   TableHead,
   TableFooter,
   Paper,
} from "@mui/material";

const ReportCard = ({ charger, start, end, sessions, prices }) => {
   start = parseISO(start);
   end = parseISO(end);

   let sessionCount = 0.0;
   let totalEnergy = 0.0;
   let totalSpotPrice = 0.0;

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
                     <TableCell align="right">Pr kWh</TableCell>
                     <TableCell align="right">User</TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {prices &&
                     sessions.map((session, i) => {
                        const sStart = parseISO(session.StartDateTime);
                        const sEnd = parseISO(session.EndDateTime);

                        const sessionStartedInPeriod = isAfter(sStart, start) && !isAfter(sStart, end);

                        if (!sessionStartedInPeriod) return null;
                        

                        sessionCount++;

                        const distance = formatDistance(sStart, sEnd);

                        let [sessionPrice, sessionEnergy, sessionKwh] = (session.EnergyDetails ?? []).reduce(
                           (session, { Timestamp, Energy }) => {
                              const d = startOfHour(parseISO(Timestamp));
                              
                              const month = Timestamp.substring(0,7).replace('-', '.');
                              
                              const x = prices.filter((x) => x.date === month)[0];
                              // console.log(x?.pr_kWh, Energy, Timestamp);
                              session[0] += (x?.pr_kWh * Energy) || (session[2] * Energy) || 0;
                              session[1] += Energy;
                              session[2] = x?.pr_kWh > session[2] ? x?.pr_kWh : session[2];
                              
                              return session;
                           },
                           [0.0, 0.0, 0.0]
                        );
                           // console.log(sessionKwh);
                           
                        const energy = Math.round(sessionEnergy * 100) / 100;
                        const price = Math.round(sessionPrice) / 100; // convert øre til kr

                        totalSpotPrice += sessionPrice;
                        totalEnergy += session.Energy;

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
                              <TableCell align="right">{energy===0 ? "[No energy data]" : price===0 ? "[No price data]":  price + "kr"}</TableCell>
                              <TableCell align="right">{sessionKwh===0? "[No price data]" : (Math.round((sessionKwh / 100) * 1000) / 1000)+'kr'}</TableCell>
                              <TableCell align="right">{session.UserFullName}</TableCell>
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
                     <TableCell>{Math.round(totalEnergy * 100) / 100 + "kW"}</TableCell>
                  </TableRow>
                  <TableRow>
                     <TableCell colSpan={4} align={"right"}>
                        <strong>Total Spot price:</strong>
                     </TableCell>
                     <TableCell>{Math.round(totalSpotPrice) / 100}kr</TableCell>
                  </TableRow>

                  <TableRow>
                     <TableCell colSpan={4} align={"right"}>
                        <strong>Herav mva:</strong>
                     </TableCell>
                     <TableCell>
                        {Math.round(totalSpotPrice * 0.25) / 100}
                        kr
                     </TableCell>
                  </TableRow>
               </TableBody>
               <TableFooter></TableFooter>
            </Table>
         </TableContainer>
      </>
   );
};

export default ReportCard;