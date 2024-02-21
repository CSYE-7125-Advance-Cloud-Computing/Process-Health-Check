const { Kafka } = require('kafkajs');
const db = require("../models");
const SequelizeKafka = db.kafka;
require('dotenv').config();

async function connectKafkaConsumer() {
    const kafka = new Kafka({
        clientId: 'healthCheckConsumer',
        brokers: [process.env.KAFKA_SERVER],
        sasl: {
            mechanism: 'plain',
            username: process.env.KAFKA_USER,
            password: process.env.KAFKA_PASSWORD
        },
    });
    const consumer = kafka.consumer({ groupId: 'healthCheckGroup' });
    await consumer.connect();
    return consumer;
}

async function processKafkaMessage(message) {
    const data = JSON.parse(message.value.toString());
    await SequelizeKafka.create({
        timestamp: data.timestamp,
        uri: data.url,
        status: data.status,
        expected_status_code: data.expected_status_code,
        headers: data.headers
    });
    console.log('Message stored in the database:', data);
}

async function commitMessageOffset(consumer, { topic, partition, offset }) {
    await consumer.commitOffsets([
        { topic, partition, offset: offset + 1 }
    ]);
    console.log('Offset committed for the processed message.');
}

async function consumeFromKafkaAndStoreToDB() {
    try {
        const consumer = await connectKafkaConsumer();
        await consumer.subscribe({ topic: 'healthcheck', fromBeginning: true });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    await processKafkaMessage(message);
                    await commitMessageOffset(consumer, { topic, partition, offset: message.offset });
                } catch (error) {
                    console.error('Error storing message in the database:', error);
                }
            },
        });
    } catch (error) {
        console.error('An unexpected error occurred:', error);
    }
}

consumeFromKafkaAndStoreToDB();
