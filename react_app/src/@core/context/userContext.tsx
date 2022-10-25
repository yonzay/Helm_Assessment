// ** React Imports
import { createContext, useState, ReactNode } from 'react'

enum InvitationStatus {
    pending,
    accepted,
    declined
}

interface invitation {
    _id: string;
    recipient_id: string;
    event_id: string;
    invitation_status: InvitationStatus;
    vip: boolean;
}

export interface UserData {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    date_of_birth: Date;
    date_joined: Date;
    invitations: invitation[];
    subscribed_event_ids: string[];
    session_token: string;
}

export interface UserContextValue {
  user: UserData
  saveUser: (updatedUser: UserData) => void
}

const initialUser: UserData = {
    _id: '',
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    date_of_birth: new Date(0),
    date_joined: new Date(0),
    invitations: [],
    subscribed_event_ids: [],
    session_token: ''
}

export const UserContext = createContext<UserContextValue>({
  saveUser: () => null,
  user: initialUser
})

export const UserProvider = ({ children }: { children: ReactNode }) => {
  // ** State
  const [user, setUser] = useState<UserData>({ ...initialUser })

  const saveUser = (updatedUser: UserData) => setUser(updatedUser);


  return <UserContext.Provider value={{ user, saveUser }}>{children}</UserContext.Provider>
}

export const UserContextConsumer = UserContext.Consumer
