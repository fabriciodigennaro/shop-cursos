const { Model } = require('sequelize');
// TODO VER DECIMALES EN PRECIOS, SI ES CERO MOSTRAR EL NUMERO INTEGER

class Course extends Model {

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
                    type: DataTypes.STRING(100),
                    allowNull: false
                },
                duration: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                mentor_id: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },  
                price: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false
                },
                discount: {
                    type: DataTypes.INTEGER(11),
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: false
                },
                discounted_price: {
                    type: DataTypes.VIRTUAL,
                    get() {
                        return this.getDiscountedPrice(this.price, this.discount);
                    }
                }
            },
            // options {}
            {
                tableName: "courses",
                timestamps: false,
                underscored: true,
                sequelize
            }
        );
    }

    static associate(models) {
        models.Course.hasMany(models.CourseImage, {
            foreignKey: 'course_id',
            as: 'images'
        }); 

        models.Course.belongsToMany(models.Category, {
            as: "categories",
            through: "courses_categories",
            foreignKey: "course_id",
            otherKey: "category_id",
            timestamps: false
        });

        models.Course.belongsTo(models.Mentor, {
            as: "mentor",
            foreignKey: "mentor_id",
        });
        
        models.Course.belongsToMany(models.Order, {
            through: "orders_courses",
            as: "orders",
            foreignKey: "course_id",
            timestamps: false,
        });
    }

    getDiscountedPrice(price, discount){
        const { UtilsService } = require("../services");
        let utilsService = new UtilsService();
        return utilsService.calcularPrecioConDescuento(price, discount);
    }

}

module.exports = Course;