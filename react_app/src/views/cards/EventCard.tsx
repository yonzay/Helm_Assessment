// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Button, { ButtonProps } from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import { styled } from '@mui/material/styles'
import axios from 'axios'
import { useCookies } from 'react-cookie'
import { useState } from 'react'

const ResetButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  marginLeft: theme.spacing(4.5),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center',
    marginTop: theme.spacing(4)
  }
}))

const EventCard: React.FC<{ event_id: string, name: string, host_name: string, start_date: Date, end_date: Date, participants: number  }> = ({ event_id, name, host_name, start_date, end_date, participants }) => {
  const [cookies, set_cookies] = useCookies();
  const [leave_event_response, set_leave_event_response] = useState<string>();
  const [disable_button, set_disable_button] = useState<boolean>();
  const leave_event = () => {
    set_disable_button(true);
    axios.post('http://127.0.0.1:8080/api/v1/user/leave_event', {
      user_id: cookies.user._id,
      event_id: event_id,
      session_token: cookies.user.session_token
    }, { validateStatus: () => true }).then(result => {
      if (result.data.message == 'you cannot leave this event as you are the host' || result.data.message == 'invalid session token') {
        set_leave_event_response(result.data.message);
        setTimeout(() => {
          set_leave_event_response('');
          set_disable_button(false);
        }, 3000);
        return;
      }
      set_leave_event_response(result.data.message);
      setTimeout(() => {
          set_leave_event_response('');
          const index = (cookies.events as []).findIndex((event: any) => event._id == event_id);
          if (index != -1) {
            cookies.events.splice(index, 1);
            set_cookies('events', cookies.events, {
                path: "/",
                sameSite: true
            });
          }
      }, 3000);
    });
  }
  return (
       <Card>
        <CardHeader title={ name } />
        <CardContent>
          <Box sx={{ mb: 5, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant='body2'>Hosted by: { host_name } | { participants } participants</Typography>
          </Box>
          <Typography variant='body1' sx={{ marginBottom: 3.25 }}>Start Date: <Typography variant='body2' sx={{ marginBottom: 3.25 }}>{ start_date.toLocaleString() }</Typography></Typography>
          <Typography variant='body1' sx={{ marginBottom: 3.25 }}>End Date: <Typography variant='body2' sx={{ marginBottom: 3.25 }}>{ end_date.toLocaleString() }</Typography></Typography>
        </CardContent>
        <CardActions className='card-action-dense'>
          <Button>Location</Button>
          <ResetButtonStyled disabled={disable_button} color='error' variant='outlined' onClick={ () => leave_event() }>Leave</ResetButtonStyled>
        </CardActions>
        <CardActions className='card-action-dense'>
          { leave_event_response }
        </CardActions>
      </Card>
      )
}

export default EventCard