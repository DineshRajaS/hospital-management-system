const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Bill = sequelize.define('Bill', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    billNumber: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false
    },
    appointmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'appointments',
        key: 'id'
      }
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'patients',
        key: 'id'
      }
    },
    consultationFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    medicineFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    testFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    procedureFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'partially_paid', 'cancelled'),
      defaultValue: 'pending'
    },
    billDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'bills'
  });

  return Bill;
};