import session from 'express-session';
import store from './store';

export default session({
    secret: process.env.SESSION_SECRET as string,
    store: store,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
    },
});
