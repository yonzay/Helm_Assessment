import { Collection, ObjectId } from 'mongodb';

enum Collections {
    users = 'Users',
    events = 'Events'
}

interface database_collections {
    users: Collection;
    events: Collection;
}

interface credentials {
    email: string;
    password: string;
}

enum InvitationStatus {
    pending,
    accepted,
    declined
}

interface invitation {
    _id?: ObjectId;
    recipient_id: ObjectId;
    event_id: ObjectId;
    invitation_status: InvitationStatus;
    vip: boolean;
}

interface participant {
    user_id: ObjectId;
    required: boolean;
}

interface user_schema {
    _id?: ObjectId;
    first_name: string;
    last_name: string;
    credentials: credentials;
    username: string;
    date_of_birth: Date;
    date_joined: Date;
    invitations: invitation[];
    subscribed_event_ids: ObjectId[];
}

interface event_schema {
    _id?: ObjectId;
    name: string;
    host_name: string;
    host_id: ObjectId;
    start_date: Date;
    end_date: Date;
    participants: participant[];
    join_request_ids: ObjectId[];
}

export { Collections, database_collections, ObjectId, user_schema, event_schema, invitation, InvitationStatus, participant, credentials }