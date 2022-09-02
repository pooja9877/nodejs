import express from 'express';
const router = express.Router();
import registerController from '../Controller/registerController';
import loginController from '../Controller/loginController';
import userController from '../Controller/userController';
import refreshController from '../Controller/refreshController';
import productController from '../Controller/productController';
import auth from '../middlewares/auth';
import admin from '../middlewares/admin';

router.post('/register', registerController.register); 
router.post('/login', loginController.login); 
router.get('/me',auth, userController.me); 
router.post('/refresh',auth, refreshController.refresh); 
router.post('/products', [auth, admin] , productController.store); 
router.put('/products/:id', [auth, admin] , productController.update); 
router.delete('/products/:id', [auth, admin] , productController.destroy); 
router.get('/products', productController.index); 
router.get('/products/:id', productController.show); 

export default router;