const { Model } = require('sequelize');

class Payment extends Model {

    static init(sequelize, DataTypes) {
        return super.init(
            // columns data {}
            {
                id: {
                    type: DataTypes.INTEGER(11),
                    primaryKey: true,
                    autoIncrement: true,
                },
                status: {
                    type: DataTypes.STRING(45),
                    allowNull: false
                },
               
            },
            // options {}
            {
                tableName: "payments",
                timestamps: false,
                underscored: true,
                sequelize
            }
        );
    }

    static associate(models) {
       
    }

}

module.exports = Payment;