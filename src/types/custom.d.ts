import { User } from '../models/userModel';
import { AuthSession } from '../utils/utils';

declare module 'express-serve-static-core' {
    interface Request {
        session: AuthSession;
        user: User;
    }
}
