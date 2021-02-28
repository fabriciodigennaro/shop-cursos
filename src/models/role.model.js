const { Model } = require('sequelize');

class Role extends Model {

    static init(sequelize, DataTypes) {
        return super.init(
            // columns data {}
            {
                id: {
                    type: DataTypes.INTEGER(11),
                    primaryKey: true,
                    autoIncrement: true,
                },
                name: {
                    type: DataTypes.STRING(45),
                    allowNull: false
                },
         
            },
            // options {}
            {
                tableName: "roles",
                timestamps: false,
                underscored: true,
                sequelize
            }
        );
    }
}

module.exports = Role;