module.exports = (sequelize, DataTypes) => {
  const Kafka = sequelize.define(
      'Kafka', {
          id: {
              type: DataTypes.INTEGER,
              autoIncrement: true,
              primaryKey: true
          },
          timestamp: {
              type: DataTypes.DATE,
              allowNull: false,
          },
          uri: {
              type: DataTypes.STRING,
              allowNull: false,
          },
          status: {
              type: DataTypes.INTEGER,
              allowNull: false,
          },
          expected_status_code: {
              type: DataTypes.INTEGER,
              allowNull: false,
          },
          headers: {
              type: DataTypes.JSON,
              allowNull: false,
          }
      }
  );
  return Kafka;
};
