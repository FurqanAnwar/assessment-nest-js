import { Model, Table, Column, ForeignKey, DataType, BeforeCreate, BelongsTo } from "sequelize-typescript";
import { User } from "src/users/schema/user.model";
import { LogAction } from '../actions.enum';
import { HttpException, HttpStatus } from "@nestjs/common";
import { DataTypes } from "sequelize";

@Table
export class Log extends Model<Log> {
    @ForeignKey(() => User)
    @Column({ type: DataTypes.INTEGER, allowNull: false })
    userId: number;
    
    @Column({ type:  DataTypes.ENUM(...Object.values(LogAction)), allowNull: false })
    action: LogAction
    
    @BelongsTo(() => User)
    user: User


    @BeforeCreate
    static validateAction(log: Log) {
        if (!Object.values(LogAction).includes(log.action)) {
            throw new HttpException('Invalid log action.', HttpStatus.BAD_REQUEST);
        }
    }
}

