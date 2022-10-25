// ** React Imports
import { createContext, useState, ReactNode } from 'react'

interface participant {
    user_id: string;
    required: boolean;
}

export interface EventsData {
    _id: string;
    name: string;
    host_id: string;
    start_date: Date;
    end_date: Date;
    participants: participant[];
    join_request_ids: string[];
}

export interface EventsContextValue {
  events: EventsData[]
  saveEvents: (updatedEvents: EventsData[]) => void
}

const initialEvents: EventsData[] = []

export const EventsContext = createContext<EventsContextValue>({
  saveEvents: () => null,
  events: initialEvents
})

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  // ** State
  const [events, setEvents] = useState<EventsData[]>({ ...initialEvents })

  const saveEvents = (updatedEvents: EventsData[]) => setEvents(updatedEvents);


  return <EventsContext.Provider value={{ events, saveEvents }}>{children}</EventsContext.Provider>
}

export const EventContextConsumer = EventsContext.Consumer
