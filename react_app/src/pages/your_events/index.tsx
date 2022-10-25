import Grid from '@mui/material/Grid'
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'
import EventCard from 'src/views/cards/EventCard';
import { useCookies } from "react-cookie";
import { useRouter } from "next/router";

const your_events = () => {
    const [cookies, set_cookies] = useCookies();
    console.log(cookies.events);
    const router = useRouter();
    if (!cookies.user?.session_token && (process as any).browser) {
      router.push('/401');
      return (<></>);
    }
    return (<ApexChartWrapper>
        <Grid container spacing={6}>
            {
                cookies.events?.map((event: any) =>
                <Grid item xs={12} md={4}>
                    <EventCard event_id={ event._id } name={ event.name } host_name={ event.host_name } start_date={ new Date(event.start_date) } end_date={ new Date(event.end_date) } participants={ event.participants.length } />
                </Grid>)
            }
        </Grid>
      </ApexChartWrapper>)
}

export default your_events