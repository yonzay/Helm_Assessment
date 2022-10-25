import { useCookies } from "react-cookie";
import { useRouter } from "next/router";
import { Grid } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import 'react-datepicker/dist/react-datepicker.css'
import DatePickerWrapper from "src/@core/styles/libs/react-datepicker";
import DatePicker from "react-datepicker";
import TextField from "@mui/material/TextField";
import AccountClockOutline from "mdi-material-ui/AccountClockOutline";
import CardActions from "@mui/material/CardActions";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import ManageEventCard from "src/views/cards/ManageEventCard";
import Divider from "@mui/material/Divider";
import Backdrop from '@mui/material/Backdrop';
import StarOutline from 'mdi-material-ui/StarOutline'
import AccountBoxOutline from 'mdi-material-ui/AccountBoxOutline'
import { ButtonProps } from "@mui/material/Button";
import { styled } from '@mui/material/styles'
import { useState, forwardRef } from "react";
import axios from "axios";

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
    return <TextField fullWidth {...props} inputRef={ref} label='Start Date' autoComplete='off'  InputProps={{
      startAdornment: (
        <InputAdornment position='start'>
          <StarOutline />
        </InputAdornment>
      )
  }} />
  })
  
  const CustomInput2 = forwardRef((props, ref) => {
    return <TextField fullWidth {...props} inputRef={ref} label='End Date' autoComplete='off'  InputProps={{
      startAdornment: (
        <InputAdornment position='start'>
          <StarOutline />
        </InputAdornment>
      )
  }} />
  })

  
let event_name: string;

let start_time: {
  minute: number;
  hour: number;
  meridiem: 'AM' | 'PM';
} = {
    minute: 0,
    hour: 0,
    meridiem: 'AM'
};

let end_time: {
  minute: number;
  hour: number;
  meridiem: 'AM' | 'PM';
} = {
    minute: 0,
    hour: 0,
    meridiem: 'AM'
};

const manage_events = () => {
    const [cookies, set_cookies] = useCookies();
    const [open_create_event, set_open_create_event] = useState<boolean>(false);
    const [create_event_response, set_create_event_response] = useState<string>();
    const [create_event_button, set_create_event_button] = useState<boolean>();
    const [start_date, set_start_date] = useState<Date | null | undefined>(null);
    const [end_date, set_end_date] = useState<Date | null | undefined>(null);
    const router = useRouter();
    if (!cookies.user?.session_token && (process as any).browser) {
      router.push('/401');
      return (<></>);
    }
    const create_event = () => {
        set_create_event_button(true);
        if (!start_date || !end_date) {
            set_create_event_response('dates must be picked');
            setTimeout(() => {
                set_create_event_response('');
                set_create_event_button(false);
            }, 3000);
            return;
        }
        axios.post('http://127.0.0.1:8080/api/v1/auth/create/create_event', {
            user_id: cookies.user._id,
            event: {
                name: event_name,
                start_date: {
                  month: start_date.getMonth() + 1,
                  day: start_date.getDate(),
                  year: start_date.getFullYear()
                },
                start_time: {
                    minute: start_time.minute,
                    hour: start_time.hour,
                    meridiem: start_time.meridiem
                },
                end_date: {
                  month: end_date.getMonth() + 1,
                  day: end_date.getDate(),
                  year: end_date.getFullYear()
                },
                end_time: {
                    minute: end_time.minute,
                    hour: end_time.hour,
                    meridiem: end_time.meridiem
                }
            },
            session_token: cookies.user.session_token
            }, { validateStatus: () => true }).then(result => {
                if (result.status != 201) {
                    set_create_event_response(result.data.message);
                    setTimeout(() => {
                        set_create_event_response('');
                        set_create_event_button(false);
                    }, 3000);
                    return;
                }
                set_create_event_response('event successfully created');
                setTimeout(() => {
                    set_create_event_response('');
                    set_create_event_button(false);
                    cookies.user.subscribed_event_ids.push(result.data.event._id);
                    cookies.events.push(result.data.event);
                    set_cookies('user', cookies.user, {
                        path: "/",
                        sameSite: true
                    });
                    set_cookies('events', cookies.events, {
                        path: "/",
                        sameSite: true
                    });
                }, 3000);
            });
    }
    return (
        <Grid container spacing={6}>
            <Grid item xs={12} sx={{ paddingBottom: 4 }}>
                <Button variant='contained' sx={{ marginRight: 3.5 }} onClick= { () => { set_open_create_event(true) } }>
                    Create Event
                </Button>
                <Backdrop 
                 sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                 open={ open_create_event }
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
                                  <TextField fullWidth label='Event Name' InputProps={{
                                  startAdornment: (
                                      <InputAdornment position='start'>
                                          <AccountBoxOutline />
                                      </InputAdornment>
                                    )
                                  }} onInput={ (input) => { event_name = (input.target as any).value } }/>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                 <DatePickerWrapper>
                                  <DatePicker
                                      selected={start_date}
                                      showYearDropdown
                                      showMonthDropdown
                                      placeholderText='MM-DD-YYYY'
                                      customInput={
                                      <CustomInput />
                                      }
                                      id='form-layouts-separator-date'
                                      onChange={ (date: Date) => { set_start_date(date) } }/>
                                  </DatePickerWrapper>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField fullWidth label='Start Hour' InputProps={{
                                  startAdornment: (
                                      <InputAdornment position='start'>
                                          <AccountClockOutline />
                                      </InputAdornment>
                                    )
                                  }} onInput={ (input) => { start_time.hour = (input.target as any).value } }/>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField fullWidth label='Start Minute' InputProps={{
                                  startAdornment: (
                                      <InputAdornment position='start'>
                                          <AccountClockOutline />
                                      </InputAdornment>
                                    )
                                  }} onInput={ (input) => { start_time.minute = (input.target as any).value } }/>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField fullWidth label='Start Meridiem' InputProps={{
                                  startAdornment: (
                                      <InputAdornment position='start'>
                                          <AccountClockOutline />
                                      </InputAdornment>
                                    )
                                  }} onInput={ (input) => { start_time.meridiem = (input.target as any).value } }/>
                                </Grid>
                                <Grid item xs={12}>
                                  <Divider sx={{ marginBottom: 0 }} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <DatePickerWrapper>
                                      <DatePicker
                                      selected={end_date}
                                      showYearDropdown
                                      showMonthDropdown
                                      placeholderText='MM-DD-YYYY'
                                      customInput={
                                        <CustomInput2 />
                                      }
                                      id='form-layouts-separator-date'
                                      onChange={ (date: Date) => { set_end_date(date) } }
                                      />
                                  </DatePickerWrapper>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField fullWidth label='End Hour' InputProps={{
                                  startAdornment: (
                                  <InputAdornment position='start'>
                                      <AccountClockOutline />
                                  </InputAdornment>
                                  )
                                  }} onInput={ (input) => { end_time.hour = (input.target as any).value } } />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField fullWidth label='End Minute' InputProps={{
                                  startAdornment: (
                                  <InputAdornment position='start'>
                                      <AccountClockOutline />
                                  </InputAdornment>
                                  )
                                  }} onInput={ (input) => { end_time.minute = (input.target as any).value } } />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField fullWidth label='End Meridiem' InputProps={{
                                  startAdornment: (
                                  <InputAdornment position='start'>
                                      <AccountClockOutline />
                                  </InputAdornment>
                                  )
                                  }} onInput={ (input) => { end_time.meridiem = (input.target as any).value } } />
                                </Grid>
                            </Grid>
                          </CardContent>
                            <Button type='submit' variant='contained' disabled={ create_event_button } onClick={ () => create_event() }>
                              Create Event
                            </Button>
                            <ResetButtonStyled  type='reset' color='error' variant='outlined' disabled={ create_event_button } onClick={ () => {
                              set_open_create_event(false);
                              start_time = {
                                minute: 0,
                                hour: 0,
                                meridiem: 'AM'
                              };
                              end_time = {
                                minute: 0,
                                hour: 0,
                                meridiem: 'AM'
                              };
                              set_start_date(null);
                              set_end_date(null);
                            }}>Cancel</ResetButtonStyled>
                            <CardActions className='card-action-dense'>
                              { create_event_response }
                            </CardActions>
                      </form>
                    </CardContent>
                </Card>
                </Backdrop>
            </Grid>
            {
                cookies.events?.map((event: any) => {
                    if (event.host_id == cookies.user._id) return (
                        <Grid item xs={12} md={4}>
                            <ManageEventCard event_id={ event._id } name={ event.name } host_name={ event.host_name } start_date={ new Date(event.start_date) } end_date={ new Date(event.end_date) } participants={ event.participants.length } />
                        </Grid>
                    )
                })
            }
        </Grid>
    )
}

export default manage_events