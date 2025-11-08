import { RefreshTokenEntity } from '@modules/auth/entities/refresh-token.entity';
import { MovieEntity } from '@modules/movies/entities/movie.entity';
import { UserEntity } from '@modules/users/entities/user.entity';

export const entities = [UserEntity, MovieEntity, RefreshTokenEntity];
