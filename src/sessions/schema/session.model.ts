import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from 'src/users/schema/user.model';

@Table
export class Sessions extends Model {
  @Column({
    type: DataType.STRING,
    primaryKey: false,
  })
  sid: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  lastActivity: Date;

  @Column({
      type: DataType.TEXT,
      allowNull: false
  })
  data: string

  @Column({
    type: DataType.DATE,
    defaultValue: new Date(Date.now() + 24 * 60 * 60 * 1000)
  })
  expires: Date;

  @BelongsTo(() => User)
  user: User

}