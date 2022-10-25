import Grid from '@mui/material/Grid'
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Magnify from 'mdi-material-ui/Magnify';
import 'react-datepicker/dist/react-datepicker.css'
import Button from '@mui/material/Button';
import { useCookies } from "react-cookie";
import { useRouter } from "next/router";
import BrowseEventCard from 'src/views/cards/BrowseEventCard';
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';
import DatePicker from 'react-datepicker';
import { forwardRef, useState, useEffect } from 'react';
import axios from 'axios';


const CustomInput = forwardRef((props, ref) => {
    return <TextField {...props} inputRef={ref} autoComplete='off'  
            size='small'
            placeholder='Search By Date Range Start'
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
            InputProps={{
                startAdornment: (
                <InputAdornment position='start'>
                    <Magnify fontSize='small'/>
                </InputAdornment>
                )
            }}
        />
  })
  
  const CustomInput2 = forwardRef((props, ref) => {
    return <TextField {...props} inputRef={ref} autoComplete='off'  
    size='small'
    placeholder='Search By Date Range End'
    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
    InputProps={{
        startAdornment: (
        <InputAdornment position='start'>
            <Magnify fontSize='small'/>
        </InputAdornment>
        )
    }}
/>
  })

let participant_username: string


const browse_events = () => {
    const [cookies, set_cookies] = useCookies();
    const [start_date, set_start_date] = useState<Date | null | undefined>(null);
    const [events, set_events] = useState<any>();
    const [end_date, set_end_date] = useState<Date | null | undefined>(null);

    useEffect(() => {
        let current_date = new Date();
        axios.post('http://127.0.0.1:8080/api/v1/user/query', {
            type: 'events',
            user_id: cookies.user?._id,
            events: {
              type: 'date_range',
              by_date_range: {
                start_date: {
                    month: current_date.getMonth() + 1,
                    day: current_date.getDate(),
                    year: current_date.getFullYear()
                },
                end_date: {
                    month: current_date.getMonth() + 1,
                    day: current_date.getDate(),
                    year: current_date.getFullYear() + 1
                }
              }
            },
            session_token: cookies.user?.session_token
        }, { validateStatus: () => true }).then(result => set_events(result.data.events));
    }, []);

    const search_by_date_range = () => {
        axios.post('http://127.0.0.1:8080/api/v1/user/query', {
            type: 'events',
            user_id: cookies.user?._id,
            events: {
              type: 'date_range',
              by_date_range: {
                start_date: {
                    month: start_date ? start_date.getMonth() + 1 : 0,
                    day: start_date ? start_date.getDate() : 0,
                    year: start_date ? start_date.getFullYear() : 0
                },
                end_date: {
                    month: end_date ? end_date.getMonth() + 1 : 0,
                    day: end_date ? end_date.getDate() : 0,
                    year: end_date ? end_date.getFullYear() : 0
                }
              }
            },
            session_token: cookies.user?.session_token
        }, { validateStatus: () => true }).then(result => set_events(result.data.events));
    }

    const search_by_participant = () => {
        axios.post('http://127.0.0.1:8080/api/v1/user/query', {
            type: 'events',
            user_id: cookies.user?._id,
            events: {
              type: 'participant',
              by_participant: participant_username
            },
            session_token: cookies.user?.session_token
        }, { validateStatus: () => true }).then(result => set_events(result.data.events));
    }

    const router = useRouter();
    if (!cookies.user?.session_token && (process as any).browser) {
      router.push('/401');
      return (<></>);
    }
    return (
    <ApexChartWrapper>
        <Grid container spacing={6}>
            <Grid item xs={12} sx={{ paddingBottom: 4 }}>
            <Grid item xs={12}>
                <Grid container spacing={6}>
                <Grid item >
                        <TextField
                            size='small'
                            placeholder='Search By Participant'
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                            InputProps={{
                                startAdornment: (
                                <InputAdornment position='start'>
                                    <Magnify fontSize='small'/>
                                </InputAdornment>
                                )
                            }}
                            onInput={ (input) => { participant_username = (input.target as any).value } }
                        />
                    </Grid>
                    <Grid item >
                        <Button variant='contained' sx={{ marginRight: 3.5 }} onClick= { () => search_by_participant() }>Search</Button>
                    </Grid>
                    <Grid item >
                        <DatePickerWrapper>
                            <DatePicker
                                selected={start_date}
                                showYearDropdown
                                showMonthDropdown
                                customInput={
                                <CustomInput />
                                }
                                id='form-layouts-separator-date'
                                onChange={ (date: Date) => { set_start_date(date) } }/>
                            </DatePickerWrapper>
                </Grid>
                    <Grid item >
                            <DatePickerWrapper>
                                <DatePicker
                                    selected={end_date}
                                    showYearDropdown
                                    showMonthDropdown
                                    customInput={
                                    <CustomInput2 />
                                    }
                                    id='form-layouts-separator-date'
                                    onChange={ (date: Date) => { set_end_date(date) } }/>
                                </DatePickerWrapper>
                            </Grid>
                            <Grid item >
                            <Button variant='contained' sx={{ marginRight: 3.5 }} onClick= { () => search_by_date_range() }>Search</Button>
                        </Grid>
                    </Grid>
                    </Grid>
            </Grid>
            {
                events?.map((event: any) =>
                <Grid item xs={12} md={4}>
                    <BrowseEventCard event_id={ event._id } name={ event.name } host_name={ event.host_name } start_date={ new Date(event.start_date) } end_date={ new Date(event.end_date) } participants={ event.participants.length } />
                </Grid>)
            }
        </Grid>
      </ApexChartWrapper>)
}

export default browse_events