import "../styles/globals.css";
import {useState} from "react"
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query'

function MyApp({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient())
  return <QueryClientProvider client={queryClient}><Component {...pageProps} /></QueryClientProvider>;
}

export default MyApp;
