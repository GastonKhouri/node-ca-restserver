import { JwtAdapter, envs } from '../../config';
import { bcryptAdapter } from '../../config/bcrypt.adapter';
import { UserModel } from '../../data';
import { CustomError, LoginUserDto, RegisterUserDto, UserEntity } from '../../domain';
import { EmailService } from './email.service';


export class AuthService {

	constructor(
		private readonly emailService: EmailService,
	) { }

	public async registerUser( registerUserDto: RegisterUserDto ) {

		const existUser = await UserModel.findOne( { email: registerUserDto.email } );
		if ( existUser ) throw CustomError.badRequest( 'Email already exist' );

		try {

			const user = new UserModel( registerUserDto );

			// Encriptar la contraseña
			user.password = bcryptAdapter.hash( registerUserDto.password );

			await user.save();
			// JWT <---- para mantener la autenticación del usuario

			// Email de confirmación
			await this.sendConfirmationEmail( user.email );

			const { password, ...userEntity } = UserEntity.fromObject( user );

			const token = await JwtAdapter.generateToken( { id: user.id } );
			if ( !token ) throw CustomError.internalServerError( 'Error generating token' );

			return {
				user: userEntity,
				token
			};

		} catch ( error ) {
			throw CustomError.internalServerError( `${ error }` );
		}

	}

	public async loginUser( loginUserDto: LoginUserDto ) {

		const user = await UserModel.findOne( { email: loginUserDto.email } );
		if ( !user ) throw CustomError.badRequest( 'Email or password incorrect' );

		const isPasswordValid = bcryptAdapter.compare( loginUserDto.password, user.password );
		if ( !isPasswordValid ) throw CustomError.badRequest( 'Email or password incorrect' );

		const { password, ...userEntity } = UserEntity.fromObject( user );

		const token = await JwtAdapter.generateToken( { id: user.id } );
		if ( !token ) throw CustomError.internalServerError( 'Error generating token' );

		return {
			user: userEntity,
			token
		};

	}

	private async sendConfirmationEmail( email: string ) {

		const token = await JwtAdapter.generateToken( { email } );
		if ( !token ) throw CustomError.internalServerError( 'Error generating token' );

		const url = `${ envs.WEBSERVICE_URL }/auth/validate-email/${ token }`;

		const htmlBody = `
			<h1>Confirm your email</h1>
			<p>Click <a href="${ url }">here</a> to confirm your email</p>
		`;

		const isSent = await this.emailService.sendEmail( {
			to: email,
			subject: 'Confirm your email',
			htmlBody,
		} );

		if ( !isSent ) throw CustomError.internalServerError( 'Error sending email' );

		return true;

	}

	public async validateEmail( token: string ) {

		const payload = await JwtAdapter.validateToken( token );
		if ( !payload ) throw CustomError.unauthorized( 'Invalid token' );

		const { email } = payload as { email: string; };
		if ( !email ) throw CustomError.internalServerError( 'Email not in token' );

		const user = await UserModel.findOne( { email } );
		if ( !user ) throw CustomError.internalServerError( 'Email not exists' );

		user.emailValidated = true;
		await user.save();

		return true;

	}

}