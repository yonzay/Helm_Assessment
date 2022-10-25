import { useContext } from 'react'
import { EventsContext, EventsContextValue } from '../context/eventsContext'

export const useEvents = (): EventsContextValue => useContext(EventsContext)
