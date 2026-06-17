const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Patient = sequelize.define('Patient', {
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
    patientId: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false
    },
    dateOfBirth: {
      type: DataTypes.DATE
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other')
    },
    address: {
      type: DataTypes.TEXT
    },
    emergencyContact: {
      type: DataTypes.STRING(15)
    },
    bloodGroup: {
      type: DataTypes.STRING(5)
    },
    medicalHistory: {
      type: DataTypes.TEXT
    },
    allergies: {
      type: DataTypes.TEXT
    },
    chronicConditions: {
      type: DataTypes.TEXT
    },
    currentMedications: {
      type: DataTypes.TEXT
    },
    insuranceInfo: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'patients'
  });

  return Patient;
};
