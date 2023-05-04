import { withIronSessionSsr } from "iron-session/next";
import {
   getDaysInMonth
} from "date-fns";
import { useQuery } from "react-query";
import {
   LinearProgress,
   Grid
} from "@mui/material";
import { useEffect, useState } from "react";
import { COOKIE } from "../../src/cookie";
import Head from "next/head";
import { ReportCard } from "./components/reportCard";
import { SettingsCard } from "./components/settingsCard";

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
            `/api/contentful?changedDate=${change}`
         ).then((res) => res.json());
         setChange(false);
         return res;
      },
      { enabled: startDate !== "" && endDate !== "" }
   );


   useEffect(() => {
      setChange(true);
      // console.log(endDate)
   }, [startDate, endDate]);

   return (
      <>
         {/* <Button onClick={()=>{
        destroySession();
      }}>Delete zaptec cookie</Button> */}
         <Head>
            <title>Zaptec charging price</title>
         </Head>

         <Grid pt={6} spacing={3} container justifyContent={"center"} alignItems={"center"}>
            
            <Grid item sm={8} xs={12} >
               <SettingsCard
                  chargers={chargers ?? []}
                  charger={charger}
                  onChangeCharger={(e) => setCharger(e.target.value)}
                  start={startDate.substring(0, 7)}
                  onChangeStart={(e) => {
                     setStartDate(e.target.value + "-01");
                     setChange(true);
                  }}
                  end={endDate.substring(0, 7)}
                  onChangeEnd={(e) => {
                     const days = getDaysInMonth(new Date(e.target.value));
                     setEndDate(e.target.value + "-" + days + "T23:59:59");
                     setChange(true);
                  }}
               />
               {(isLoadingChargers || isLoadingSessions || isLoadingPrices) && <LinearProgress />}
            </Grid>
            {prices && sessions && startDate && endDate && (
               <Grid mb={3} item sm={8} xs={12}>
                  <ReportCard key={charger} charger={charger} sessions={sessions} start={startDate} end={endDate} prices={prices} />
               </Grid>
            )}
         </Grid>
         {/* <pre>
          {JSON.stringify(prices, null, 2)}
        </pre> */}
      </>
   );
}




