import {
   Card,
   CardContent,
   Grid,
   TextField,
   MenuItem,
} from "@mui/material";

export function SettingsCard({ chargers, onChangeCharger, onChangeStart, onChangeEnd, charger, start, end }) {
   return (
      <Card>
         <CardContent>
            <Grid container spacing={3}>
               <Grid item xs={12}>
                  <TextField fullWidth value={charger} select onChange={onChangeCharger} label={"Charger"}>
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
                        label={"Start month"}
                        helperText={"Includes all charges started this month"}
                        value={start}
                        onChange={onChangeStart}
                        type="month"
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: "2022-01", max: "2023-06" }}
                     />
                  </Grid>
                  <Grid item xs={6}>
                     <TextField
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        label={"End month"}
                        helperText={"Includes all charges started this month"}
                        value={end}
                        onChange={onChangeEnd}
                        type="month"
                        inputProps={{ min: "2022-01", max: "2023-06" }}
                     />
                  </Grid>
               </Grid>
            </Grid>
         </CardContent>
      </Card>
   );
}
