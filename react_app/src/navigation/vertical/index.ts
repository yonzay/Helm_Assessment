// ** Icon imports
import Login from 'mdi-material-ui/Login'
import Mail from 'mdi-material-ui/Mail'
import CogOutline from 'mdi-material-ui/CogOutline'
import Table from 'mdi-material-ui/Table'
import CubeOutline from 'mdi-material-ui/CubeOutline'
import FormatLetterCase from 'mdi-material-ui/FormatLetterCase'
import AccountGroup from 'mdi-material-ui/AccountGroup'
import CreditCardOutline from 'mdi-material-ui/CreditCardOutline'
import GoogleCirclesExtended from 'mdi-material-ui/GoogleCirclesExtended'
import LogoutVariant from 'mdi-material-ui/LogoutVariant'
// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'
import AccountDetails from 'mdi-material-ui/AccountDetails'
import AccountCog from 'mdi-material-ui/AccountCog'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      sectionTitle: 'Events'
    },
    {
      title: 'Your Events',
      icon: AccountDetails,
      path: '/your_events'
    },
    {
      title: 'Browse Events',
      icon: AccountGroup,
      path: '/browse_events'
    },
    {
      title: 'Manage Events',
      icon: AccountCog,
      path: '/manage_events'
    },
    {
      sectionTitle: 'Misc'
    },
    {
      title: 'Invitations',
      icon: Mail,
      path: '/invitations'
    },
    {
      title: 'Account Settings',
      icon: CogOutline,
      path: '/account-settings'
    },
    {
      title: 'Logout',
      icon: LogoutVariant,
      path: '/logout'
    }
  ]
}

export default navigation
