import Joi from "joi";
import User from "../models/user";
import { REFRESH_SECRET } from "../config";
import refreshToken from "../models/refreshToken";
import CustomErrorHandler from "../services/CustomErrorHandler";
import JwtService from "../services/JwtService";
const refreshController = {
    async refresh(req,res,next){
            //validation
        const refreshSchema = Joi.object({
            refresh_token: Joi.string().required(),
           
        })

        const { error } = refreshSchema.validate(req.body);

        if(error){
            return next(error);
        }

        //check token exist in database
        let refreshtoken;
        try{
            refreshtoken = await refreshToken.findOne({token: req.body.refresh_token});
            if(!refreshtoken){
                return next(CustomErrorHandler.unAuthorized('Invalid refresh token'));
            }
            let userId; 
            try{
                const { _id } = await JwtService.verify(refreshtoken.token, REFRESH_SECRET);
                userId = _id;
            }
            catch(err){
                return next(CustomErrorHandler.unAuthorized('Invalid refresh token'));
            }
            const user = await User.findOne({_id: userId});
            if(!user){
                return next(CustomErrorHandler.unAuthorized('no user found'));
            }

            //generate token 
            const access_token = JwtService.sign({_id: user._id, role: user.role  });
            const refresh_token = JwtService.sign({_id: user._id, role: user.role }, '1y', REFRESH_SECRET);

            await refreshToken.create({token: refresh_token});
            res.json({access_token, refresh_token });
        }
        catch(err){
            return next(new Error ('Something went wrong' + err.message));
        }
    }
};
export default refreshController;
