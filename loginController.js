import Joi from "joi";
import User from "../models/user";
import CustomErrorHandler from "../services/CustomErrorHandler";
import bcrypt from 'bcrypt';
import JwtService from '../services/JwtService';
import { REFRESH_SECRET } from '../config';
import refreshToken from "../models/refreshToken";
const loginController = {
    async login(req,res,next){
            //validation
        const loginSchema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
        })

        const { error } = loginSchema.validate(req.body);

        if(error){
            return next(error);
        }

        try{
            const user = await User.findOne({ email: req.body.email });

            if(!user){
                return next(CustomErrorHandler.wrongCredentials());
            }
            //compare password
            const match = await bcrypt.compare(req.body.password, user.password);
            if(!match){
                return next(CustomErrorHandler.wrongCredentials());
            }
            // generate token

           
            const access_token = JwtService.sign({_id: user._id, role: user.role  });
            const refresh_token = JwtService.sign({_id: user._id, role: user.role }, '1y', REFRESH_SECRET);

            await refreshToken.create({token: refresh_token});
            res.json({access_token, refresh_token });
        }
        catch(err){
            return next(err);
        }
    }
}



export default loginController;