// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { Grid } from '@mui/material'
import Button, { ButtonProps } from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import TabList from '@mui/lab/TabList'
import Tab from '@mui/material/Tab'
import 'react-datepicker/dist/react-datepicker.css'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import DatePicker from 'react-datepicker'
import Typography from '@mui/material/Typography'
import ParticipantsTable from '../tables/ParticipantsTable'
import CardHeader from '@mui/material/CardHeader'
import AccountClockOutline from 'mdi-material-ui/AccountClockOutline'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import { styled } from '@mui/material/styles'
import { useCookies } from 'react-cookie'
import { useState, forwardRef, SyntheticEvent } from 'react'
import Backdrop from '@mui/material/Backdrop';
import StarOutline from 'mdi-material-ui/StarOutline'
import AccountBoxOutline from 'mdi-material-ui/AccountBoxOutline'
import axios from 'axios'

const ResetButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  marginLeft: theme.spacing(4.5),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center',
    marginTop: theme.spacing(4)
  }
}))

const CustomInput = forwardRef((props, ref) => {
  return <TextField fullWidth {...props} inputRef={ref} label='New Start Date' autoComplete='off'  InputProps={{
    startAdornment: (
      <InputAdornment position='start'>
        <StarOutline />
      </InputAdornment>
    )
}} />
})

const CustomInput2 = forwardRef((props, ref) => {
  return <TextField fullWidth {...props} inputRef={ref} label='New End Date' autoComplete='off'  InputProps={{
    startAdornment: (
      <InputAdornment position='start'>
        <StarOutline />
      </InputAdornment>
    )
}} />
})

let new_event_name: string;

let start_time: {
  minute: number;
  hour: number;
  meridiem: 'AM' | 'PM';
}

let end_time: {
  minute: number;
  hour: number;
  meridiem: 'AM' | 'PM';
}

const ManageEventCard: React.FC<{ event_id: string, name: string, host_name: string, start_date: Date, end_date: Date, participants: number }> = ({ event_id, name, host_name, start_date, end_date, participants }) => {
  const [disable_buttons, set_disable_buttons] = useState<boolean>(false);
  const [manage_event_response, set_manage_event_response] = useState<string>();
  const [update_event_response, set_update_event_response] = useState<string>();
  const [update_event_button, set_update_event_button] = useState<boolean>();
  const [open_update, set_open_update] = useState<boolean>(false);
  const [new_start_date, set_new_start_date] = useState<Date | null | undefined>(null);
  const [new_end_date, set_new_end_date] = useState<Date | null | undefined>(null);
  const [open_participants, set_open_participants] = useState<boolean>(false);
  const [participants_response, set_participants_response] = useState<string>();
  const [participants_button, set_participants_button] = useState<boolean>(false);
  const [cookies, set_cookies] = useCookies();

  const [participants_data, set_participants_data] = useState<{
    _id: string;
    first_name: string;
    last_name: string;
    username: string;
    actions: any;
  }[] | null >(null);

  const [join_requests_data, set_join_requests_data] = useState<{
    _id: string;
    first_name: string;
    last_name: string;
    username: string;
    actions: any;
  }[] | null >(null);

  const [available_users, set_available_users] = useState<{
    _id: string;
    first_name: string;
    last_name: string;
    username: string;
    actions: any;
  }[] | null >(null);

  const [tab_value, set_tab_value] = useState<string>('1')

  const handleChange = (event: SyntheticEvent, new_tab_value: string) => set_tab_value(new_tab_value);

  const delete_event = () => {
    set_disable_buttons(true);
    axios.post('http://127.0.0.1:8080/api/v1/auth/delete/delete_event', {
      user_id: cookies.user._id,
      event_id: event_id,
      session_token: cookies.user.session_token
    }, { validateStatus: () => true }).then(result => {
        if (result.data.message == 'invalid session token') {
          set_manage_event_response(result.data.message);
          setTimeout(() => {
              set_manage_event_response('');
              set_disable_buttons(false);
          }, 3000);
          return;
        }
        set_manage_event_response(result.data.message);
        setTimeout(() => {
          set_manage_event_response('');
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
  const update_event = () => {
    set_update_event_button(true);
    axios.post('http://127.0.0.1:8080/api/v1/auth/update/update_event', {
      user_id: cookies.user._id,
      event: {
        _id: event_id,
        name: new_event_name,
        start_date: new_start_date ? {
          month: new_start_date.getMonth() + 1,
          day: new_start_date.getDate(),
          year: new_start_date.getFullYear()
        } : undefined,
        start_time: start_time ? {
            minute: start_time.minute,
            hour: start_time.hour,
            meridiem: start_time.meridiem
        } : undefined,
        end_date: new_end_date ? {
          month: new_end_date.getMonth() + 1,
          day: new_end_date.getDate(),
          year: new_end_date.getFullYear()
        } : undefined,
        end_time: end_time ? {
            minute: end_time.minute,
            hour: end_time.hour,
            meridiem: end_time.meridiem
        } : undefined
      },
      session_token: cookies.user.session_token
    }, {
      validateStatus: () => true
    }).then(result => {
      if (result.status != 200) {
          set_update_event_response(result.data.message);
          setTimeout(() => {
            set_update_event_response('');
            set_update_event_button(false);
          }, 3000);
          return;
      }
      set_update_event_response('successfully saved changes');
      setTimeout(() => {
        set_update_event_response('');
        set_update_event_button(false);
        const index = (cookies.events as []).findIndex((event: any) => event._id == event_id);
        if (index != -1) {
            Object.keys(result.data.updated_event).forEach(key => {
              (cookies.events[index] as any)[key] = result.data.updated_event[key];
            });
          set_cookies('events', cookies.events, {
              path: "/",
              sameSite: true
          });
        }
      }, 3000);
    });
  }
  
  const initialize_start_date_time = () => start_time ? null : (() => { (start_time as any) = {}; })();
  const initialize_end_date_time = () => end_time ? null : (() => { (end_time as any) = {}; })();

  const remove_user = (user_to_remove: string, button_state: any) => {
    button_state.currentTarget.disabled = true;
    axios.post('http://127.0.0.1:8080/api/v1/auth/update/update_participants', {
      action: 'remove',
      user_id: cookies.user._id,
      event_id: event_id,
      participants: [{ user_id: user_to_remove }],
      session_token: cookies.user.session_token
    }, { validateStatus: () => true }).then(result => {
        if (result.status != 200) {
          set_participants_response(result.data.message);
          setTimeout(() => {
            set_participants_response('');
          }, 3000);
          return;
        }
        const event_index = cookies.events.findIndex((event: any) => event._id == event_id);
        const participant_index = cookies.events[event_index].participants.findIndex((participant: any) => participant.user_id == user_to_remove);
        if ((event_index && event_index == -1) || (participant_index && participant_index == -1)) {
          set_participants_response('invalid participant or event');
          setTimeout(() => {
            set_participants_response('');
          }, 3000);
          return;
        }
        cookies.events[event_index].participants.splice(participant_index, 1);
        axios.post('http://127.0.0.1:8080/api/v1/user/query', {
          type: 'users',
          user_id: cookies.user._id,
          users: {
            type: 'singletons',
            by_singletons: cookies.events[event_index].participants.map((participant: any) => participant.user_id)
          },
          session_token: cookies.user.session_token
        }, { validateStatus: () => true }).then(result => {
          if (result.status != 200) {
            set_participants_response(result.data.message);
            setTimeout(() => {
              set_participants_response('');
            }, 3000);
            return;
          }
          const participants_api_data = result.data.users;
          set_participants_data(participants_api_data.map((user: any) => { return {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            actions: <>
              <ResetButtonStyled color='error' variant='outlined' onClick={ (e) => {
                remove_user(user._id, e);
              } }>Remove</ResetButtonStyled>
            </>
          }}));
          axios.post('http://127.0.0.1:8080/api/v1/user/query', {
            type: 'events',
            user_id: cookies.user._id,
            events: {
              type: 'singletons',
              by_singletons: cookies.user.subscribed_event_ids
            },
            session_token: cookies.user.session_token
          }, { validateStatus: () => true }).then(result => {
            let events: any = result.data.events;
            if (!events.forEach) events = [];
            set_cookies('events', events, {
              path: "/",
              sameSite: true
            });
          });
      });
    });
  }

  const reply_to_join_request = (user_to_reply_to: string, response: boolean, button_state: any) => {
    button_state.currentTarget.disabled = true;
    axios.post('http://127.0.0.1:8080/api/v1/user/reply', {
      type: 'join_request',
      user_id: cookies.user._id,
      join_request: {
        event_id: event_id,
        from_user_id: user_to_reply_to,
        required: false,
        response: response
      },
      session_token: cookies.user.session_token
    }, { validateStatus: () => true }).then(result => {
      if (result.status != 204) {
        set_participants_response(result.data.message);
        setTimeout(() => {
          set_participants_response('');
        }, 3000);
        return;
      }

      const event_index = cookies.events.findIndex((event: any) => event._id == event_id);

      cookies.events[event_index].join_request_ids.splice(cookies.events[event_index].join_request_ids.findIndex((join_request_id: any) => join_request_id == user_to_reply_to), 1);

      if (response) {
        cookies.events[event_index].participants.push({ user_id: user_to_reply_to, required: false });
        set_cookies('events', cookies.events, {
          path: "/",
          sameSite: true
        });
      } else {
        set_cookies('events', cookies.events, {
          path: "/",
          sameSite: true
        });
      }

      axios.post('http://127.0.0.1:8080/api/v1/user/query', {
        type: 'users',
        user_id: cookies.user._id,
        users: {
          type: 'singletons',
          by_singletons: cookies.events[event_index].participants.map((participant: any) => participant.user_id)
        },
        session_token: cookies.user.session_token
      }, { validateStatus: () => true }).then(result => {
        if (result.status != 200) {
          set_participants_response(result.data.message);
          setTimeout(() => {
            set_participants_response('');
          }, 3000);
          return;
        }
        const participants_api_data = result.data.users;
        axios.post('http://127.0.0.1:8080/api/v1/user/query', {
          type: 'users',
          user_id: cookies.user._id,
          users: {
            type: 'singletons',
            by_singletons: cookies.events[cookies.events.findIndex((event: any) => event._id == event_id)].join_request_ids
          },
          session_token: cookies.user.session_token
        }, { validateStatus: () => true }).then(result => {
          if (result.status != 200) {
            set_participants_response(result.data.message);
            setTimeout(() => {
              set_participants_response('');
            }, 3000);
            return;
          }
          const join_request_users = result.data.users;
          set_join_requests_data(join_request_users.map((user: any) => { return {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            actions: <>
              <ResetButtonStyled color='info' variant='outlined' onClick={ (e) => reply_to_join_request(user._id, true, e) }>Accept</ResetButtonStyled>
              <ResetButtonStyled color='error' variant='outlined' onClick={ (e) => reply_to_join_request(user._id, false, e) }>Decline</ResetButtonStyled>
            </>
          }}));
          set_participants_data(participants_api_data.map((user: any) => { return {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            actions: <>
              <ResetButtonStyled color='error' variant='outlined' onClick={ (e) => {
                remove_user(user._id, e);
              } }>Remove</ResetButtonStyled>
            </>
          }}));
            axios.post('http://127.0.0.1:8080/api/v1/user/query', {
              type: 'events',
              user_id: cookies.user._id,
              events: {
                type: 'singletons',
                by_singletons: cookies.user.subscribed_event_ids
              },
              session_token: cookies.user.session_token
            }, { validateStatus: () => true }).then(result => {
              let events: any = result.data.events;
              if (!events.forEach) events = [];
              set_cookies('events', events, {
                path: "/",
                sameSite: true
              });
            });
        });
      });
    })
  }

  const invite_participants = (recipient: string, username: string, button_state: any) => {
    button_state.currentTarget.disabled = true;
    axios.post('http://127.0.0.1:8080/api/v1/user/send_invitation', {
      user_id: cookies.user._id,
      event_id: event_id,
      recipient_id: recipient,
      vip: false,
      session_token: cookies.user.session_token
    }, { validateStatus: () => true }).then(result => {
        if (result.status != 204) {
          set_participants_response(result.data.message);
          setTimeout(() => {
            set_participants_response('');
          }, 3000);
          return;
        }
        set_participants_response(`successfully sent invitation to ${ username }`);
        setTimeout(() => {
          set_participants_response('');
        }, 3000);
    });
  }

  const load_participants = () => {
    const index = cookies.events?.findIndex((event: any) => event._id == event_id);
    if (index && index == -1) {
      set_manage_event_response('this event does not exist');
      setTimeout(() => {
        set_manage_event_response('');
        set_participants_button(false);
      }, 3000);
      return;
    }
    //gets participants
    axios.post('http://127.0.0.1:8080/api/v1/user/query', {
      type: 'users',
      user_id: cookies.user._id,
      users: {
        type: 'singletons',
        by_singletons: cookies.events[index].participants.map((participant: any) => participant.user_id)
      },
      session_token: cookies.user.session_token
    }, { validateStatus: () => true }).then(result => {
      if (result.status != 200) {
        set_manage_event_response(result.data.message);
        setTimeout(() => {
          set_manage_event_response('');
          set_participants_button(false);
        }, 3000);
        return;
      }
      const participants_api_data = result.data.users;
      //gets people who have requested to join
      axios.post('http://127.0.0.1:8080/api/v1/user/query', {
        type: 'users',
        user_id: cookies.user._id,
        users: {
          type: 'singletons',
          by_singletons: cookies.events[index].join_request_ids
        },
        session_token: cookies.user.session_token
      }, { validateStatus: () => true }).then(result => {
        if (result.status != 200) {
          set_manage_event_response(result.data.message);
          setTimeout(() => {
            set_manage_event_response('');
            set_participants_button(false);
          }, 3000);
          return;
        }
        const join_request_users = result.data.users;
        //gets a list of available users
        axios.post('http://127.0.0.1:8080/api/v1/user/query', {
          type: 'users',
          user_id: cookies.user._id,
          users: {
            type: 'range',
            offset: 1,
            range: 50
          },
          session_token: cookies.user.session_token
        }, { validateStatus: () => true }).then(result => {
          if (result.status != 200) {
            set_manage_event_response(result.data.message);
            setTimeout(() => {
              set_manage_event_response('');
              set_participants_button(false);
            }, 3000);
            return;
          }
          const available_users = result.data.users;
          set_participants_data(participants_api_data.map((user: any) => { return {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            actions: <>
              <ResetButtonStyled color='error' variant='outlined' onClick={ (e) => {
                remove_user(user._id, e);
              } }>Remove</ResetButtonStyled>
            </>
          }}));
          set_join_requests_data(join_request_users.map((user: any) => { return {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            actions: <>
              <ResetButtonStyled color='info' variant='outlined' onClick={ (e) => reply_to_join_request(user._id, true, e) }>Accept</ResetButtonStyled>
              <ResetButtonStyled color='error' variant='outlined' onClick={ (e) => reply_to_join_request(user._id, false, e) }>Decline</ResetButtonStyled>
            </>
          }}));
          set_available_users(available_users.map((user: any) => { return {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            actions: <>
              <ResetButtonStyled color='info' variant='outlined' onClick={ (e) => invite_participants(user._id, user.username, e) }>Invite</ResetButtonStyled>
            </>
          }}));
          set_open_participants(true);
        })
      });
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
            <Button disabled={disable_buttons} onClick={ () => set_open_update(!open_update) }>Update</Button>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={ open_update }
              >
                <Card sx={{ zIndex: 1 }} style={ {
                      display: 'block',
                      width: '30vw',
                      transitionDuration: '0.3s',
                      height: '32vw'
                  }}>
                  <CardContent sx={{ padding: theme => `${ theme.spacing(12, 9, 7)} !important` }}>
                      <form noValidate autoComplete='off' onSubmit={e => e.preventDefault()}>
                          <CardContent>
                            <Grid container spacing={5}>
                                <Grid item xs={12} sm={6}>
                                  <TextField fullWidth label='New Event Name' InputProps={{
                                  startAdornment: (
                                      <InputAdornment position='start'>
                                          <AccountBoxOutline />
                                      </InputAdornment>
                                    )
                                  }} onInput={ (input) => { new_event_name = (input.target as any).value } }/>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                 <DatePickerWrapper>
                                  <DatePicker
                                      selected={new_start_date}
                                      showYearDropdown
                                      showMonthDropdown
                                      placeholderText='MM-DD-YYYY'
                                      customInput={
                                      <CustomInput />
                                      }
                                      id='form-layouts-separator-date'
                                      onChange={ (date: Date) => { set_new_start_date(date) } }/>
                                  </DatePickerWrapper>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField fullWidth label='New Start Hour' InputProps={{
                                  startAdornment: (
                                      <InputAdornment position='start'>
                                          <AccountClockOutline />
                                      </InputAdornment>
                                    )
                                  }} onInput={ (input) => { initialize_start_date_time(); start_time.hour = (input.target as any).value } }/>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField fullWidth label='New Start Minute' InputProps={{
                                  startAdornment: (
                                      <InputAdornment position='start'>
                                          <AccountClockOutline />
                                      </InputAdornment>
                                    )
                                  }} onInput={ (input) => { initialize_start_date_time(); start_time.minute = (input.target as any).value } }/>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField fullWidth label='New Start Meridiem' InputProps={{
                                  startAdornment: (
                                      <InputAdornment position='start'>
                                          <AccountClockOutline />
                                      </InputAdornment>
                                    )
                                  }} onInput={ (input) => { initialize_start_date_time(); start_time.meridiem = (input.target as any).value } }/>
                                </Grid>
                                <Grid item xs={12}>
                                  <Divider sx={{ marginBottom: 0 }} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <DatePickerWrapper>
                                      <DatePicker
                                      selected={new_end_date}
                                      showYearDropdown
                                      showMonthDropdown
                                      placeholderText='MM-DD-YYYY'
                                      customInput={
                                      <CustomInput2 />
                                      }
                                      id='form-layouts-separator-date'
                                      onChange={ (date: Date) => { set_new_end_date(date) } }
                                      />
                                  </DatePickerWrapper>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField fullWidth label='New End Hour' InputProps={{
                                  startAdornment: (
                                  <InputAdornment position='start'>
                                      <AccountClockOutline />
                                  </InputAdornment>
                                  )
                                  }} onInput={ (input) => { initialize_end_date_time(); end_time.hour = (input.target as any).value } } />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField fullWidth label='New End Minute' InputProps={{
                                  startAdornment: (
                                  <InputAdornment position='start'>
                                      <AccountClockOutline />
                                  </InputAdornment>
                                  )
                                  }} onInput={ (input) => { initialize_end_date_time(); end_time.minute = (input.target as any).value } } />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField fullWidth label='New End Meridiem' InputProps={{
                                  startAdornment: (
                                  <InputAdornment position='start'>
                                      <AccountClockOutline />
                                  </InputAdornment>
                                  )
                                  }} onInput={ (input) => { initialize_end_date_time(); end_time.meridiem = (input.target as any).value } } />
                                </Grid>
                            </Grid>
                          </CardContent>
                            <Button type='submit' variant='contained' disabled={ update_event_button } onClick={ () => update_event() }>
                              Save Changes
                            </Button>
                            <ResetButtonStyled  type='reset' color='error' variant='outlined' disabled={ update_event_button } onClick={ () => {
                              set_open_update(false);
                              (start_time as any) = undefined;
                              (end_time as any) = undefined;
                              set_new_start_date(null);
                              set_new_end_date(null);
                            }}>Cancel</ResetButtonStyled>
                            <CardActions className='card-action-dense'>
                              { update_event_response }
                            </CardActions>
                      </form>
                    </CardContent>
                </Card>
              </Backdrop>
            <Button disabled={participants_button} onClick={ () => load_participants() }>Participants</Button>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={ open_participants }
              >
                <Card>
                <TabContext value={tab_value}>
                  <TabList centered onChange={handleChange} aria-label='card navigation example'>
                    <Tab value='1' label='Participants' />
                    <Tab value='2' label='View Join Requests' />
                    <Tab value='3' label='Available Users' />
                  </TabList>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <TabPanel value='1' sx={{ p: 0 }}>
                        <ParticipantsTable participants_data={ participants_data as any[] }/>
                    </TabPanel>
                    <TabPanel value='2' sx={{ p: 0 }}>
                      <ParticipantsTable participants_data={ join_requests_data as any[] }/>
                    </TabPanel>
                    <TabPanel value='3' sx={{ p: 0 }}>
                    <ParticipantsTable participants_data={ available_users as any[] }/>
                    </TabPanel>
                  </CardContent>
                  <CardActions>
                  <ResetButtonStyled  type='reset' color='error' variant='outlined' onClick={ () => { set_participants_button(false); set_open_participants(false); }}>Cancel</ResetButtonStyled>
                  </CardActions>
                  <CardActions className='card-action-dense'>
                    { participants_response }
                  </CardActions>
                </TabContext>
              </Card>
            </Backdrop>
            <ResetButtonStyled color='error' variant='outlined' disabled={disable_buttons} onClick={ () => delete_event() }>Delete</ResetButtonStyled>
          </CardActions>
          <CardActions className='card-action-dense'>
            { manage_event_response }
          </CardActions>
        </Card>
  )
}

export default ManageEventCard