import { CustomError } from '../errors/custom.error';


export class UserEntity {

	constructor(
		public id: string,
		public name: string,
		public email: string,
		public emailValidated: boolean,
		public password: string,
		public role: string[],
		public img?: string,
	) { }

	static fromObject( object: { [ key: string ]: any; } ): UserEntity {

		const { id, _id, name, email, emailValidated, password, role, img } = object;

		if ( !id && !_id ) throw CustomError.badRequest( 'User id not provided' );
		if ( !name ) throw CustomError.badRequest( 'User name not provided' );
		if ( !email ) throw CustomError.badRequest( 'User email not provided' );
		if ( emailValidated === undefined ) throw CustomError.badRequest( 'User emailValidated not provided' );
		if ( !password ) throw CustomError.badRequest( 'User password not provided' );
		if ( !role ) throw CustomError.badRequest( 'User role not provided' );

		return new UserEntity(
			_id || id,
			name,
			email,
			emailValidated,
			password,
			role,
			img,
		);
	}

}