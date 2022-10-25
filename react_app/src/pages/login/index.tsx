// ** React Imports
import { ChangeEvent, MouseEvent, ReactNode, Ref, useState } from 'react'

// ** Next Imports
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** MUI Components
import Box from '@mui/material/Box'
import EmailOutline from 'mdi-material-ui/EmailOutline'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import OutlinedInput from '@mui/material/OutlinedInput'
import { styled } from '@mui/material/styles'
import MuiCard, { CardProps } from '@mui/material/Card'
import InputAdornment from '@mui/material/InputAdornment'
import MuiFormControlLabel, { FormControlLabelProps } from '@mui/material/FormControlLabel'
import axios from 'axios';
import KeyOutline from 'mdi-material-ui/KeyOutline'
import { useUser } from 'src/@core/hooks/useUser'
import { useEvents } from 'src/@core/hooks/useEvents'
// ** Icons Imports
import EyeOutline from 'mdi-material-ui/EyeOutline'
import EyeOffOutline from 'mdi-material-ui/EyeOffOutline'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Imports
import FooterIllustrationsV1 from 'src/views/pages/auth/FooterIllustration'

import { useCookies } from 'react-cookie'

interface State {
  password: string
  showPassword: boolean
}

// ** Styled Components
const Card = styled(MuiCard)<CardProps>(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: '28rem' }
}))

const LinkStyled = styled('a')(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const FormControlLabel = styled(MuiFormControlLabel)<FormControlLabelProps>(({ theme }) => ({
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary
  }
}))


let email_ref: string;

const LoginPage = () => {
  // ** State
  const [values, setValues] = useState<State>({
    password: '',
    showPassword: false
  })

  const [login_response, set_login_response] = useState<string>('');
  const { user, saveUser } = useUser();
  let { events, saveEvents } = useEvents();
  const [cookies, set_cookies] = useCookies();
  const [disable_button, set_disable_button] = useState<boolean>(false);

  const router = useRouter()

  const login_action = (email: string, password: string): void => {
    set_disable_button(true);
    axios.post('http://127.0.0.1:8080/api/v1/user/login', { email: email, password: password }, { validateStatus: () => true }).then(result => {
      if (result.status == 200) {
        user.session_token = result.data.session_token;
        user._id = result.data.user._id;
        user.first_name = result.data.user.first_name;
        user.last_name = result.data.user.last_name;
        user.email = result.data.user.credentials.email;
        user.username = result.data.user.username;
        user.date_of_birth = new Date(result.data.user.date_of_birth);
        user.date_joined = new Date(result.data.user.date_joined);
        user.invitations = result.data.user.invitations;
        user.subscribed_event_ids = result.data.user.subscribed_event_ids;
        saveUser(user);
        set_cookies('user', user, {
          path: "/",
          maxAge: 900, // Expires after 15 min
          sameSite: true,
        });
        axios.post('http://127.0.0.1:8080/api/v1/user/query', {
          type: 'events',
          user_id: user._id,
          events: {
            type: 'singletons',
            by_singletons: user.subscribed_event_ids
          },
          session_token: user.session_token
        }, { validateStatus: () => true }).then(result => {
          events = result.data.events;
          if (!events.forEach) events = [];
          saveEvents(events);
          set_cookies('events', events, {
            path: "/",
            maxAge: 900,
            sameSite: true
          });
          router.push('/');
          return;
        });
      }
      set_login_response(result.data.message);
      setTimeout(() => { set_login_response(''); set_disable_button(false); }, 3000);
    });
  }

  const handleChange = (prop: keyof State) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword })
  }

  const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  return (
    <Box className='content-center'>
      <Card sx={{ zIndex: 1 }}>
        <CardContent sx={{ padding: theme => `${theme.spacing(12, 9, 7)} !important` }}>
          <Box sx={{ mb: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src = 'https://static.wixstatic.com/media/596185_be74b63d4a40489893a7ea9d57e485cc~mv2.png/v1/fill/w_117,h_40,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Helm%20Logo%20Horizontal%20Full%20Color.png'></img>
          </Box>
          <Box sx={{ mb: 6 }}>
            <Typography variant='h5' sx={{ fontWeight: 600, marginBottom: 1.5 }}>
              Welcome to {themeConfig.templateName}! 👋🏻
            </Typography>
            <Typography variant='body2'>Please sign-in to your account and start the adventure</Typography>
          </Box>
          <form noValidate autoComplete='off' onSubmit={e => e.preventDefault()}>
            <TextField autoFocus fullWidth id='email' label='Email' sx={{ marginBottom: 4 }}  InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <EmailOutline />
                    </InputAdornment>
                  )
              }} onInput={ (input) => { email_ref = (input.target as any).value }} />
            <FormControl fullWidth>
              <InputLabel htmlFor='auth-login-password'>Password</InputLabel>
              <OutlinedInput
                label='Password'
                value={values.password}
                id='auth-login-password'
                onChange={handleChange('password')}
                type={values.showPassword ? 'text' : 'password'}
                startAdornment= {
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
            <Box
              sx={{ mb: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}
            >
              <FormControlLabel control={<Checkbox />} label='Remember Me' />
              <Typography variant='body2'>{ login_response }</Typography>
            </Box>
            <Button
              fullWidth
              size='large'
              variant='contained'
              disabled={disable_button}
              sx={{ marginBottom: 7 }}
              onClick={() => login_action(email_ref, values.password)}
            >
              Login
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Typography variant='body2' sx={{ marginRight: 2 }}>
                New on our platform?
              </Typography>
              <Typography variant='body2'>
                <Link passHref href='/register'>
                  <LinkStyled>Create an account</LinkStyled>
                </Link>
              </Typography>
            </Box>
          </form>
        </CardContent>
      </Card>
    <FooterIllustrationsV1/>
    </Box>
  )
}

LoginPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default LoginPage