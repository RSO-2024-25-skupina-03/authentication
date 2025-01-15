import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { getUserModel } from "../models/users.js";

passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
            passReqToCallback: true, // Pass the request to the callback
        },
        async (username, password, cbDone) => {
            try {
                const User = getUserModel(req.params.tenant)
                let user = await User.findOne({ email: username });
                if (!user)
                    return cbDone(null, false, { message: "Incorrect username." });
                else if (!user.validPassword(password))
                    return cbDone(null, false, { message: "Incorrect password." });
                else return cbDone(null, user);
            } catch (err) {
                return cbDone(err);
            }
        }
    )
);