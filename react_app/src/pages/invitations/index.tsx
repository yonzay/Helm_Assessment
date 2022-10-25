import Grid from '@mui/material/Grid'
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'
import { useCookies } from "react-cookie";
import { useRouter } from "next/router";
import InvitationCard from 'src/views/cards/InvitationCard';
import { useEffect, useState} from 'react';
import axios from 'axios';

const invitations = () => {
    const [cookies, set_cookies] = useCookies();
    const [event_invitations, set_event_invitations] = useState<any>();
    useEffect(() => {
        axios.post('http://127.0.0.1:8080/api/v1/user/query', {
            type: 'events',
            user_id: cookies.user?._id,
            events: {
              type: 'singletons',
              by_singletons: cookies.user?.invitations.map((invitation: any) => invitation.event_id)
            },
            session_token: cookies.user?.session_token
        }, { validateStatus: () => true }).then(result => set_event_invitations(result.data));
    }, []);
    const router = useRouter();
    if (!cookies.user?.session_token && (process as any).browser) {
      router.push('/401');
      return (<></>);
    }
    return (<ApexChartWrapper>
        <Grid container spacing={6}>
            {
                event_invitations?.events?.map((event: any) => {
                    return (
                        <Grid item xs={12} md={4}>
                            <InvitationCard invitation_id={ cookies.user?.invitations.find((invitation: any) => invitation.event_id == event._id)?._id } name={ event.name } host_name={ event.host_name } start_date={ new Date(event.start_date) } end_date={ new Date(event.end_date) } participants={ event.participants.length } />
                        </Grid>
                    )
                })
            }
        </Grid>
      </ApexChartWrapper>)
}

export default invitations


/*

            {
                cookies.user?.invitations.map((invitation: any) => {
                    event_invitations?.events.map((event: any) => {
                        if (invitation.event_id == event._id) return (
                            <Grid item xs={12} md={4}>
                                <InvitationCard invitation_id={ invitation._id } name={ event.name } host_name={ event.host_name } start_date={ new Date(event.start_date) } end_date={ new Date(event.end_date) } participants={ event.participants.length } />
                            </Grid>
                        )
                    });
                })
            }

*/