import { Router } from 'express';
import { FileUploadController } from './controller';
import { FileUploadService } from '../services';
import { TypeMiddleware } from '../middlewares/type.middleware';
import { FileUploadMiddleware } from '../middlewares/file-upload.middleware';

export class FileUploadRoutes {

	static get routes(): Router {

		const router = Router();
		const fileUploadService = new FileUploadService();
		const controller = new FileUploadController( fileUploadService );

		router.use( FileUploadMiddleware.containFiles );
		router.use( TypeMiddleware.validTypes( [ 'users', 'products' ] ) );

		// Definir las rutas
		router.post( '/single/:type', controller.uploadFile );
		router.post( '/multiple/:type', controller.uploadMultipleFiles );

		return router;
	}

}

