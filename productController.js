
import Product from "../models/product";
import multer from "multer";
import path from 'path';
import CustomErrorHandler from "../services/CustomErrorHandler";     
import fs from 'fs';
import productSchema from "../validators/productValidator";

const storage = multer.diskStorage({
    destination: (req,file,cb) => cb(null, 'uploads/'),
    filename:  (req,file,cb) => {
        const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e9
          )}${path.extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      });

const handleMultipartData = multer({ storage, limit: {filesize : 1000000 * 5 }}).single('image')


const productController = 
{
    async store(req,res,next)
    {

        handleMultipartData(req,res, async (err) => {
            if(err){
                return next(CustomErrorHandler.serverError(err.message));
            }
            const filePath = req.file.path;
            //validation
            const { error } = productSchema.validate(req.body);
            // if(error){
            //        fs.unlink('${appRoot}/${filePath}', (err) =>  {
            //           return next(CustomErrorHandler.serverError(err.message)); 
            //         });
            //         return next(error);
            // }

            const  { name, price, size } = req.body;
            let document;
            try{
                document = await Product.create({
                    name,
                    price,
                    size,
                    image: filePath
                });
            }
            catch(err){
                return next(err);
            }

            res.status(201).json(document);
        });

    }, 
    async update(req,res,next){
        handleMultipartData(req,res, async (err) => {
            if(err){
                return next(CustomErrorHandler.serverError(err.message));
            }
            let filePath;
            if(req.file){
                filePath = req.file.path;
            }
            //validation
            const { error } = productSchema.validate(req.body);

            if(error){
                return next(error);
            }
            // if(error){
            //        fs.unlink('${appRoot}/${filePath}', (err) =>  {
            //           return next(CustomErrorHandler.serverError(err.message)); 
            //         });
            //         return next(error);
            // }

            const  { name, price, size } = req.body;
            let document;
            try{
                document = await Product.findOneAndUpdate({_id: req.params.id },{
                    name,
                    price,
                    size,
                ...(req.file && {image:filePath})
                }, {new: true} );
            }
            catch(err){
                return next(err);
            }

            res.status(201).json(document);
        });

    },

        async destroy(req,res,next){
            const document = await Product.findOneAndRemove({_id: req.params.id});
            if(!document){
                return next(new Error ('Nothing to delete'));
            }
            res.json(document);
            //image delete

        },

        async index(req,res,next){
            let documents;
            //use pagination (mongoose-pagination)
            try{
                documents = await Product.find().select('-updatedAt -__v').sort({_id: -1});
            }
            catch(err){
                return next(CustomErrorHandler,serverError());
            }
                return res.json(documents);
        }, 
        async show(req,res,next){
            let documents;
            try{
                documents = await Product.findOne({_id: req.params.id }).select('-__v');
            }
            catch(err){
                return next(CustomErrorHandler,serverError());
            }
            return res.json(documents);
        }
    
}

export default productController;