import { Router } from 'express';

interface route {
    path: string;
    router: Router;
}

export { route }