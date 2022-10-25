import { useContext } from 'react'
import { UserContext, UserContextValue } from '../context/userContext'

export const useUser = (): UserContextValue => useContext(UserContext)
