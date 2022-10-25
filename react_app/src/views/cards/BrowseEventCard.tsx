// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Button, { ButtonProps } from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import { useCookies } from 'react-cookie'
import { useState } from 'react'
import axios from 'axios'

const BrowseEventCard: React.FC<{ event_id: string, name: string, host_name: string, start_date: Date, end_date: Date, participants: number  }> = ({ event_id, name, host_name, start_date, end_date, participants }) => {
  const [cookies, setCookies] = useCookies();
  const [join_response, set_join_response] = useState<string>();
  const [disable_button, set_disable_button] = useState<boolean>();
  const send_join_request = () => {
    axios.post('http://127.0.0.1:8080/api/v1/user/join_request', {
      user_id: cookies.user._id,
      event_id: event_id,
      session_token: cookies.user.session_token
    }, { validateStatus: () => true }).then(result => {
      set_disable_button(true);
      if (result.status != 204) {
        set_join_response(result.data.message);
        setTimeout(() => { set_join_response(''); set_disable_button(false)}, 3000);
        return;
      }
      set_join_response('successfully sent join request');
      setTimeout(() => set_join_response(''), 3000);
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
        <Button disabled={disable_button} onClick={ () => { send_join_request() } }>Request To Join</Button>
      </CardActions>
      <CardActions className='card-action-dense'>
        { join_response }
      </CardActions>
    </Card>
  )
}

export default BrowseEventCard
