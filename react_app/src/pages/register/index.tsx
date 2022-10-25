// ** React Imports
import { useState, Fragment, ChangeEvent, MouseEvent, ReactNode } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** MUI Components
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import EmailOutline from 'mdi-material-ui/EmailOutline'
import AccountOutline from 'mdi-material-ui/AccountOutline'
import KeyOutline from 'mdi-material-ui/KeyOutline'
import HomeOutline from 'mdi-material-ui/HomeOutline'
import StarOutline from 'mdi-material-ui/StarOutline'
import Outline from 'mdi-material-ui/InformationOutline'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import OutlinedInput from '@mui/material/OutlinedInput'
import { styled, useTheme } from '@mui/material/styles'
import MuiCard, { CardProps } from '@mui/material/Card'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import MuiFormControlLabel, { FormControlLabelProps } from '@mui/material/FormControlLabel'
import Select, { SelectChangeEvent } from '@mui/material/Select'
// ** Icons Imports
import EyeOutline from 'mdi-material-ui/EyeOutline'
import EyeOffOutline from 'mdi-material-ui/EyeOffOutline'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Imports
import FooterIllustrationsV1 from 'src/views/pages/auth/FooterIllustration'
//FormLayoutsSeparator

import 'react-datepicker/dist/react-datepicker.css'

import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

import { forwardRef } from 'react';

import DatePicker from 'react-datepicker'

import axios from 'axios'

import { useUser } from 'src/@core/hooks/useUser'

import { useRouter } from 'next/router'

import { useCookies } from 'react-cookie'

const CustomInput = forwardRef((props, ref) => {
  return <TextField fullWidth {...props} inputRef={ref} label='Birth Date' autoComplete='off'  InputProps={{
    startAdornment: (
      <InputAdornment position='start'>
        <StarOutline />
      </InputAdornment>
    )
}} />
})

interface State {
  password: string
  password2: string
  showPassword: boolean
  showPassword2: boolean
}

// ** Styled Components
const Card = styled(MuiCard)<CardProps>(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: '45rem' }
}))

const LinkStyled = styled('a')(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const FormControlLabel = styled(MuiFormControlLabel)<FormControlLabelProps>(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  marginBottom: theme.spacing(4),
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary
  }
}))

let username: string;
let email: string;
let first_name: string;
let last_name: string;

const RegisterPage = () => {
  // ** States
  const [sign_up_response, set_sign_up_response] = useState<string>('');
  const [date, setDate] = useState<Date | null | undefined>(null)
  const [values, setValues] = useState<State>({
    password: '',
    password2: '',
    showPassword: false,
    showPassword2: false
  })
  const [cookies, set_cookies] = useCookies();

  const {user, saveUser} = useUser();
  const [disable_button, set_disable_button] = useState<boolean>(false);

  const router = useRouter()
  // Handle Password
  const handlePasswordChange = (prop: keyof State) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }
  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword })
  }
  const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  // Handle Confirm Password
  const handleConfirmChange = (prop: keyof State) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleClickShowConfirmPassword = () => {
    setValues({ ...values, showPassword2: !values.showPassword2 })
  }
  const handleMouseDownConfirmPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const sign_up = () => {
    set_disable_button(true);
    if (values.password != values.password2) {
      set_sign_up_response('please make sure your passwords match');
      setTimeout(() => { set_sign_up_response(''); set_disable_button(false); }, 3000);
      return;
    }
    axios.post('http://127.0.0.1:8080/api/v1/auth/create/create_user', {
      first_name: first_name,
      last_name: last_name,
      email: email,
      password: values.password,
      username: username,
      date_of_birth: {
        month: date?.getMonth() as number + 1,
        day: date?.getDate(),
        year: date?.getFullYear()
      }
    }, { validateStatus: () => true }).then(result => {
      if (result.status == 201) {
        user.session_token = result.data.session_token;
        user._id = result.data.user._id;
        user.first_name = result.data.user.first_name;
        user.last_name = result.data.user.last_name;
        user.email = result.data.user.credentials.email;
        user.username = result.data.user.username;
        user.date_of_birth = new Date(result.data.user.date_of_birth);
        user.date_joined = new Date(result.data.user.date_joined);
        user.invitations = [];
        user.subscribed_event_ids = [];
        saveUser(user);
        console.log(cookies);
        set_cookies('user', user, {
          path: "/",
          maxAge: 900,
          sameSite: true,
        });
        router.push('/');
      }
      set_sign_up_response(result.data.message);
      setTimeout(() => { set_sign_up_response(''); set_disable_button(false); }, 3000);
      
    });
  }
  return (
    <Box className='content-center'>
      <Card sx={{ zIndex: 1 }}>
        <CardContent sx={{ padding: theme => `${ theme.spacing(12, 9, 7)} !important` }}>
          <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src = 'https://static.wixstatic.com/media/596185_be74b63d4a40489893a7ea9d57e485cc~mv2.png/v1/fill/w_117,h_40,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Helm%20Logo%20Horizontal%20Full%20Color.png'></img>
          </Box>
          <Box sx={{ mb: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant='h5' sx={{ fontWeight: 600, marginBottom: 1.5 }}>
              Adventure starts here 🚀
            </Typography>
          </Box>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant='body2'>Please create your account to start the adventure</Typography>
          </Box>
          <form noValidate autoComplete='off' onSubmit={e => e.preventDefault()}>
          <CardContent>
            <Grid container spacing={5}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label='Username' InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <AccountOutline />
                    </InputAdornment>
                  )
              }} onInput={ (input) => { username = (input.target as any).value }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth type='email' label='Email' InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <EmailOutline />
                    </InputAdornment>
                  )
              }} onInput={ (input) => { email = (input.target as any).value }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel htmlFor='form-layouts-separator-password'>Password</InputLabel>
                  <OutlinedInput
                    label='Password'
                    value={values.password}
                    id='form-layouts-separator-password'
                    onChange={handlePasswordChange('password')}
                    type={values.showPassword ? 'text' : 'password'}
                    startAdornment={ 
                      <InputAdornment position='start'>
                      <KeyOutline />
                    </InputAdornment>
                    }
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          aria-label='toggle password visibility'
                        >
                          {values.showPassword ? <EyeOutline /> : <EyeOffOutline />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel htmlFor='form-layouts-separator-password-2'>Confirm Password</InputLabel>
                  <OutlinedInput
                    value={values.password2}
                    label='Confirm Password'
                    id='form-layouts-separator-password-2'
                    onChange={handleConfirmChange('password2')}
                    type={values.showPassword2 ? 'text' : 'password'}
                    startAdornment={ 
                      <InputAdornment position='start'>
                      <KeyOutline />
                    </InputAdornment>
                    }
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          aria-label='toggle password visibility'
                          onClick={handleClickShowConfirmPassword}
                          onMouseDown={handleMouseDownConfirmPassword}
                        >
                          {values.showPassword2 ? <EyeOutline /> : <EyeOffOutline />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ marginBottom: 0 }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label='First Name' InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <AccountOutline />
                    </InputAdornment>
                  )
              }} onInput={ (input) => { first_name = (input.target as any).value }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label='Last Name' InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <AccountOutline />
                    </InputAdornment>
                  )
              }} onInput={ (input) => { last_name = (input.target as any).value }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id='form-layouts-separator-select-label'>Country</InputLabel>
                  <Select startAdornment= {          
                  <InputAdornment position='start'>
                          <HomeOutline />
                        </InputAdornment>
                  }
                    label='Country'
                    defaultValue=''
                    id='form-layouts-separator-select'
                    labelId='form-layouts-separator-select-label'
                  >
                    <MenuItem value='UK'>UK</MenuItem>
                    <MenuItem value='USA'>USA</MenuItem>
                    <MenuItem value='Australia'>Australia</MenuItem>
                    <MenuItem value='Germany'>Germany</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePickerWrapper>
                  <DatePicker
                    selected={date}
                    showYearDropdown
                    showMonthDropdown
                    placeholderText='MM-DD-YYYY'
                    customInput={<CustomInput />}
                    id='form-layouts-separator-date'
                    onChange={(date: Date) => setDate(date) }
                  />
                </DatePickerWrapper>
              </Grid>
            </Grid>
          </CardContent>
          <Typography variant='body2'>{ sign_up_response }</Typography>
            <FormControlLabel
              control={<Checkbox />}
              label={
                <Fragment>
                  <span>I agree to </span>
                  <Link href='/' passHref>
                    <LinkStyled onClick={(e: MouseEvent<HTMLElement>) => e.preventDefault()}>
                      privacy policy & terms
                    </LinkStyled>
                  </Link>
                </Fragment>
              }
            />
            
            <Button fullWidth size='large' type='submit' variant='contained' disabled={disable_button} sx={{ marginBottom: 7 }} onClick={() => { sign_up() }}>
              Sign up
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Typography variant='body2' sx={{ marginRight: 2 }}>
                Already have an account?
              </Typography>
              <Typography variant='body2'>
                <Link passHref href='/login'>
                  <LinkStyled>Sign in instead</LinkStyled>
                </Link>
              </Typography>
            </Box>
          </form>
        </CardContent>
      </Card>
      <FooterIllustrationsV1 />
    </Box>
  )
}

RegisterPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default RegisterPage