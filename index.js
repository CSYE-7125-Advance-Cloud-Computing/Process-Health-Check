const { Kafka } = require('kafkajs');
const { Client } = require('pg');

async function consumeAndStore(kafkaConfig, pgConfig) {
    const kafka = new Kafka({
        clientId: 'healthCheckConsumer',
        brokers: [kafkaConfig.bootstrapServers]
    });
    const consumer = kafka.consumer({ groupId: 'healthCheckGroup' });

    const pgClient = new Client({
        connectionString: `postgresql://${pgConfig.username}:${pgConfig.password}@${pgConfig.host}:${pgConfig.port}/${pgConfig.database}`
    });
    await pgClient.connect();

    await consumer.connect();
    await consumer.subscribe({ topic: kafkaConfig.topic });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            try {
                const healthCheckResult = JSON.parse(message.value.toString());
                await pgClient.query('INSERT INTO health_check_results (status, message) VALUES ($1, $2)', [healthCheckResult.status, healthCheckResult.message]);
            } catch (error) {
                console.error('Error processing message:', error);
            }
        },
    });
}

// Load configurations from ConfigMap and Secrets
const kafkaConfig = {
    bootstrapServers: process.env.KAFKA_BOOTSTRAP_SERVERS,
    topic: process.env.KAFKA_TOPIC
};

const pgConfig = {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    username: process.env.PG_USERNAME,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE
};

consumeAndStore(kafkaConfig, pgConfig).catch(error => {
    console.error('An unexpected error occurred:', error);
    process.exit(1); // Exit the application
});
