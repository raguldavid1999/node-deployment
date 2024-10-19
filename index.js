const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');
require('dotenv').config();

const app = express();
app.use(express.json());

const redisClient = redis.createClient({
    url: process.env.REDIS_URL, // Move the Redis URL to an environment variable
    socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => Math.min(retries * 50, 2000)
    }
});

// Handle Redis connection events
(async () => {
    await redisClient.connect();
    console.log('Connected to Redis!');
})();

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

const PORT = process.env.PORT || 3000;

const itemsPool = new Pool({
    connectionString: process.env.POSTGRES_URL, // Move PostgreSQL connection string to an environment variable
    ssl: {
        rejectUnauthorized: false
    }
});

// Helper function for standardizing responses
const sendResponse = (res, status, data) => {
    res.status(status).json({ status, data });
};

app.post('/users', async (req, res) => {
    try {
        const { first_name } = req.body;
        const result = await itemsPool.query('SELECT * FROM public.users WHERE first_name = $1', [first_name]);
        sendResponse(res, 200, result.rows);
    } catch (err) {
        console.error(err);
        sendResponse(res, 500, { error: 'Database error' });
    }
});

app.get('/users-list', async (req, res) => {
    try {
        const redisValue = await redisClient.get('mykey');
        if (redisValue) {
            console.log('Retrieve from Redis');
            const responseData = {
                status: 200,
                data: JSON.parse(redisValue)
            };
            return sendResponse(res, 200, responseData.data);
        }

        const result = await itemsPool.query('SELECT * FROM public.users');
        console.log('Initial set key');
        await redisClient.set('mykey', JSON.stringify(result.rows), {
            EX: 10 // Set expiration time directly when storing
        });
        sendResponse(res, 200, result.rows);
    } catch (err) {
        console.error(err);
        sendResponse(res, 500, { error: 'Database error' });
    }
});

app.get('/users/:id', (req, res) => {
    const user = users.find(u => u.id == req.params.id);
    if (!user) {
        return sendResponse(res, 404, { error: 'User does not exist or something went wrong' });
    }
    sendResponse(res, 200, user);
});

app.listen(PORT, () => {
    console.log(`User service is running on port ${PORT}`);
});