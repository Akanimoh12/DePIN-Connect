import express from 'express';
import { validateData } from './ai-validator';
import { startChainListener } from './chain-listener';

const app = express();
const port = 3000;

app.use(express.json());

app.post('/validate-data', (req, res) => {
    const { deviceId, data } = req.body;

    if (!deviceId || !data) {
        return res.status(400).json({ error: 'Missing deviceId or data' });
    }

    const isValid = validateData(data);

    if (isValid) {
        // In a real application, you would trigger a payment or store the data
        console.log(`Data from ${deviceId} is valid:`, data);
        res.status(200).json({ message: 'Data validated successfully' });
    } else {
        console.log(`Data from ${deviceId} is invalid:`, data);
        res.status(400).json({ message: 'Invalid data' });
    }
});

app.listen(port, () => {
    console.log(`AI agent listening at http://localhost:${port}`);
    // Start listening to blockchain events
    startChainListener();
});
