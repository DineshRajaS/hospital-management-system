const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Doctor = sequelize.define('Doctor', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    specialization: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    qualification: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    consultationFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    department: {
      type: DataTypes.STRING(100)
    },
    workingHoursStart: {
      type: DataTypes.TIME,
      defaultValue: '09:00:00'
    },
    workingHoursEnd: {
      type: DataTypes.TIME,
      defaultValue: '17:00:00'
    },
    profilePicture: {
      type: DataTypes.STRING(255)
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00
    }
  }, {
    tableName: 'doctors'
  });

  return Doctor;
};
