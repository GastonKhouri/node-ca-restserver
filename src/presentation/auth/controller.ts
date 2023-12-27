import { Request, Response } from 'express';
import { CustomError, LoginUserDto, RegisterUserDto } from '../../domain';
import { AuthService } from '../services/auth.service';


export class AuthController {

	constructor(
		private readonly authService: AuthService
	) { }

	private handleError = ( error: any, res: Response ) => {
		if ( error instanceof CustomError ) {
			return res.status( error.statusCode ).json( { error: error.message } );
		}

		console.log( `${ error }` );
		return res.status( 500 ).json( { error: 'Internal Server Error' } );
	};

	registerUser = async ( req: Request, res: Response ) => {

		const [ error, registerUserDto ] = RegisterUserDto.create( req.body );
		if ( error ) return res.status( 400 ).json( { error } );

		this.authService.registerUser( registerUserDto! )
			.then( user => res.json( user ) )
			.catch( error => this.handleError( error, res ) );

	};

	loginUser = async ( req: Request, res: Response ) => {

		const [ error, loginUserDto ] = LoginUserDto.create( req.body );
		if ( error ) return res.status( 400 ).json( { error } );

		this.authService.loginUser( loginUserDto! )
			.then( user => res.json( user ) )
			.catch( error => this.handleError( error, res ) );

	};

	validateEmail = async ( req: Request, res: Response ) => {

		const { token } = req.params;

		this.authService.validateEmail( token )
			.then( () => res.json( { message: 'Email validated' } ) )
			.catch( error => this.handleError( error, res ) );

		res.json( { message: 'Email validated' } );
	};

}