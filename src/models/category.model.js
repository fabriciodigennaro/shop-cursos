const { Model } = require('sequelize');

class Category extends Model {

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
                tableName: "categories",
                timestamps: false,
                underscored: true,
                sequelize
            }
        );
    }
}

module.exports = Category;