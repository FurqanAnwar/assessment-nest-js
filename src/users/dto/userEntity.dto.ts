import { CreateUserDTO } from './create.dto';
import { Exclude } from 'class-transformer';

export class UserEntityDTO extends CreateUserDTO{
    @Exclude()
    password: string
}