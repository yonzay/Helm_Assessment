// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { Grid } from '@mui/material'
import Button, { ButtonProps } from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import { styled } from '@mui/material/styles'
import { useCookies } from 'react-cookie'
import axios from 'axios'
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

const InvitationCard: React.FC<{ invitation_id: string, name: string, host_name: string, start_date: Date, end_date: Date, participants: number  }> = ({ invitation_id, name, host_name, start_date, end_date, participants }) => {
  const [cookies, set_cookies] = useCookies();
  const [invitation_response, set_invitation_response] = useState<string>();
  const [show_invitation, set_show_invitation] = useState<boolean>(true);
  const [disable_buttons, set_disable_buttons] = useState<boolean>(false);
  const reply = (response: boolean) => {
        set_disable_buttons(true);
        axios.post('http://127.0.0.1:8080/api/v1/user/reply', {
            type: 'invitation',
            user_id: cookies.user._id,
            invitation: {
                _id: invitation_id,
                response: response 
            },
            session_token: cookies.user.session_token
         }, { validateStatus: () => true }).then(result => {
            if (result.data.message == 'invalid session token') {
                set_invitation_response(result.data.message);
                setTimeout(() => {
                    set_invitation_response('');
                    set_disable_buttons(false);
                }, 3000);
                return;
            }
            set_invitation_response(result.data.message);
            setTimeout(() => {
                if (response && result.status == 200) {
                    cookies.user.subscribed_event_ids.push(result.data.added_to_event._id);
                    cookies.events.push(result.data.added_to_event);
                    set_cookies('user', cookies.user, {
                        path: "/",
                        sameSite: true
                    });
                    set_cookies('events', cookies.events, {
                        path: "/",
                        sameSite: true
                    });
                }
                set_invitation_response('');
                set_show_invitation(false);
                const index = (cookies.user.invitations as []).findIndex((invitation: any) => invitation._id == invitation_id);
                if (index != -1) cookies.user.invitations.splice(index, 1);
                set_cookies('user', cookies.user, {
                    path: "/",
                    sameSite: true
                });
            }, 3000);
         });
    }
    return (
        <>{ (() => { if (show_invitation) {
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
                  <Button disabled={disable_buttons} onClick={ () => reply(true) }>Accept</Button>
                  <ResetButtonStyled disabled={disable_buttons} color='error' variant='outlined' onClick={() => reply(false)}>Decline</ResetButtonStyled>
                </CardActions>
                <CardActions className='card-action-dense'>
                  { invitation_response }
                </CardActions>
              </Card>
            )
        }})() }</>
  )
}

export default InvitationCard