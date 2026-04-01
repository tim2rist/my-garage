'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const app = express();

// --- Config ---
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'mygarage_secret_2026';

// --- AWS DynamoDB Config ---
const awsConfig = {
    region: process.env.AWS_REGION || 'eu-central-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    }
};

const ddbClient = new DynamoDBClient(awsConfig);
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// --- Middleware ---
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

// --- Auth Routes ---

/** 
 * GET /api/check-id/:id 
 * Check username availability
 */
app.get('/api/check-id/:id', async (req, res) => {
    try {
        const result = await ddbDocClient.send(new ScanCommand({
            TableName: 'MyGarage_Users',
            FilterExpression: 'username = :u',
            ExpressionAttributeValues: { ':u': req.params.id.toLowerCase() }
        }));
        res.json({ available: result.Items.length === 0 });
    } catch (err) {
        console.error('Check-ID Error:', err.message); // This will show in your terminal
        res.status(500).json({ error: 'Database error during check' });
    }
});

/** 
 * POST /api/register 
 */
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    try {
        const userId = uuidv4();
        const hash = await bcrypt.hash(password, 10);

        await ddbDocClient.send(new PutCommand({
            TableName: 'MyGarage_Users',
            Item: {
                id: userId,
                username: username.toLowerCase(),
                email: email.toLowerCase(),
                password_hash: hash,
                created_at: new Date().toISOString()
            }
        }));

        const token = jwt.sign({ id: userId, username }, JWT_SECRET);
        res.json({ token, user: { id: userId, username, email } });
    } catch (err) {
        console.error('Registration Error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/** 
 * POST /api/login 
 */
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

    try {
        const result = await ddbDocClient.send(new ScanCommand({
            TableName: 'MyGarage_Users',
            FilterExpression: 'email = :e',
            ExpressionAttributeValues: { ':e': email.toLowerCase() }
        }));

        const user = result.Items?.[0];
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(400).json({ error: 'Nieprawidłowy email lub hasło' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (err) {
        console.error('Login Error:', err.message);
        res.status(500).json({ error: 'Błąd serwera podczas logowania' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});