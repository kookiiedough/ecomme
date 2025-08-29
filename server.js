const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for form uploads
const upload = multer();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('./'));

// Beta signup endpoint
app.post('/api/beta-signup', upload.any(), async (req, res) => {
    try {
        const { name, email } = req.body;
        
        if (!name || !email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name and email are required' 
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please enter a valid email address' 
            });
        }

        // Create signup data
        const signupData = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            timestamp: new Date().toISOString()
        };

        // Read existing signups or create new array
        let signups = [];
        try {
            const data = await fs.readFile('beta-signups.json', 'utf8');
            signups = JSON.parse(data);
        } catch (error) {
            // File doesn't exist yet, start with empty array
            signups = [];
        }

        // Check if email already exists
        if (signups.some(signup => signup.email === signupData.email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'This email is already registered for the beta' 
            });
        }

        // Add new signup
        signups.push(signupData);

        // Save to file
        await fs.writeFile('beta-signups.json', JSON.stringify(signups, null, 2));

        console.log('New beta signup:', signupData);

        res.json({ 
            success: true, 
            message: 'Thank you for signing up! We\'ll keep you updated.' 
        });

    } catch (error) {
        console.error('Error processing beta signup:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred. Please try again.' 
        });
    }
});

// Get signup count endpoint (optional)
app.get('/api/beta-count', async (req, res) => {
    try {
        const data = await fs.readFile('beta-signups.json', 'utf8');
        const signups = JSON.parse(data);
        res.json({ count: signups.length });
    } catch (error) {
        res.json({ count: 0 });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});