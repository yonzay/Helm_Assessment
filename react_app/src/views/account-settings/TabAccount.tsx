// ** React Imports
import { useState, ElementType, ChangeEvent, useRef, forwardRef } from 'react'
import { useRouter } from 'next/router'
// ** MUI Imports
import StarOutline from 'mdi-material-ui/StarOutline'
import EmailOutline from 'mdi-material-ui/EmailOutline'
import AccountOutline from 'mdi-material-ui/AccountOutline'
import { InputAdornment } from '@mui/material'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Button, { ButtonProps } from '@mui/material/Button'
import { useCookies } from 'react-cookie'
import axios from 'axios'

import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import DatePicker from 'react-datepicker'

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(6.25),
  borderRadius: theme.shape.borderRadius
}))

const ButtonStyled = styled(Button)<ButtonProps & { component?: ElementType; htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

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
  return <TextField fullWidth {...props} inputRef={ref} InputProps={{
    startAdornment: (
      <InputAdornment position='start'>
        <StarOutline />
      </InputAdornment>
    )
}} label='Update Birth Date' autoComplete='off' />
})

let username: string;
let first_name: string;
let last_name: string;
let email: string;

const TabAccount = () => {
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png')
  const [cookies, set_cookies] = useCookies();
  const [date, set_date] = useState<Date | null | undefined>(null);
  const [update_user_response, set_update_user_response] = useState<string>();
  const router = useRouter();

  const onChange = (file: ChangeEvent) => {
    const reader = new FileReader()
    const { files } = file.target as HTMLInputElement
    if (files && files.length !== 0) {
      reader.onload = () => setImgSrc(reader.result as string)

      reader.readAsDataURL(files[0])
    }
  }
  const update_account = (): void => {
    axios.post('http://127.0.0.1:8080/api/v1/auth/update/update_user', {
      user_id: cookies.user._id,
      username: username,
      first_name: first_name,
      last_name: last_name,
      email: email,
      date_of_birth: date ? {
        month: date.getMonth() + 1,
        day: date.getDate(),
        year: date.getFullYear()
      } : undefined,
      session_token: cookies.user.session_token
    },{ validateStatus: () => true }).then(result => {
      if (result.status == 200) {
        Object.keys(result.data.updated_user).forEach(key => {
          if (key == 'credentials.email') {
            cookies.user['email'] = result.data.updated_user['credentials.email'];
            return;
          }
          (cookies.user as any)[key] = result.data.updated_user[key];
        });
        set_cookies('user', cookies.user, {
          path: "/",
          sameSite: true
        })
        return;
      }
      set_update_user_response(result.data.message);
      setTimeout(() => { set_update_user_response('') }, 3000);
    })
  }
  const delete_account = (): void => {
    axios.post('http://127.0.0.1:8080/api/v1/user/logout', {
      user_id: cookies.user?._id,
      session_token: cookies.user?.session_token
    }, { validateStatus: () => true }).then(result => {
      if (result.status == 204) {
        axios.post('http://127.0.0.1:8080/api/v1/auth/delete/delete_user', {
          user_id: cookies.user?._id,
          session_token: cookies.user?.session_token
        }, { validateStatus: () => true }).then(result => {
          if (result.status == 204) {
            set_cookies('user', undefined, {
              path: "/",
              maxAge: 1,
              sameSite: true,
            });
            router.push('/login');
          }
          set_update_user_response(result.data.message);
          setTimeout(() => { set_update_user_response('') }, 3000);
          return;
        });
      }
      set_update_user_response(result.data.message);
      setTimeout(() => { set_update_user_response('') }, 3000);
    });
  }
  return (
    <CardContent>
      <form>
        <Grid container spacing={7}>
          <Grid item xs={12} sx={{ marginTop: 4.8, marginBottom: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ImgStyled src={imgSrc} alt='Profile Pic' />
              <Box>
                <ButtonStyled component='label' variant='contained' htmlFor='account-settings-upload-image'>
                  Upload New Photo
                  <input
                    hidden
                    type='file'
                    onChange={onChange}
                    accept='image/png, image/jpeg'
                    id='account-settings-upload-image'
                  />
                </ButtonStyled>
                <ResetButtonStyled color='error' variant='outlined' onClick={() => setImgSrc('/images/avatars/1.png')}>
                  Reset
                </ResetButtonStyled>
                <Typography variant='body2' sx={{ marginTop: 5 }}>
                  Allowed PNG or JPEG. Max size of 800K.
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Username' InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <AccountOutline />
                    </InputAdornment>
                  )
              }} placeholder={ 'Username' } defaultValue= { cookies.user?.username + ''  }
            onInput={ (input) => { username = (input.target as any).value }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='First Name' InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <AccountOutline />
                    </InputAdornment>
                  )
              }} placeholder={ 'First Name' } defaultValue={ cookies.user?.first_name + '' }
            onInput={ (input) => { first_name = (input.target as any).value }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Last Name' InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <AccountOutline />
                    </InputAdornment>
                  )
              }} placeholder={ 'Last Name' } defaultValue={ cookies.user?.last_name + '' }
            onInput={ (input) => { last_name = (input.target as any).value }} />
          </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label='Email'
                placeholder={ 'Email' }
                defaultValue={ cookies.user?.email + '' }
                onInput={ (input) => { email = (input.target as any).value }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <EmailOutline />
                    </InputAdornment>
                  )
              }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
            <TextField label='Current Birth Date' InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <StarOutline />
                    </InputAdornment>
                  )
              }}fullWidth value={ new Date(cookies.user?.date_of_birth).toLocaleDateString() } inputProps={ { readOnly: true } }/>
            <br></br>
            <br></br>
            <Typography variant='body2'>{ update_user_response }</Typography>
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
                  onChange={(date: Date) => set_date(date)}
                />
            </DatePickerWrapper>
            </Grid>
          <Grid item xs={12}>
            <Button variant='contained' sx={{ marginRight: 3.5 }} onClick= { () => update_account() }>
              Save Changes
            </Button>
            <Button type='reset' variant='outlined' color='secondary'>
              Reset
            </Button>
            <ResetButtonStyled color='error' variant='outlined' onClick={() => { delete_account() }}>
                  Delete Account
            </ResetButtonStyled>
          </Grid>
        </Grid>
      </form>
    </CardContent>
  )
}

export default TabAccount
