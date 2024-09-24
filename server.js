const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer'); // Middleware to handle file uploads

const app = express();
const PORT = process.env.PORT || 3000;

// Use CORS and JSON body parser
app.use(cors());
app.use(bodyParser.json());

// Multer setup to handle image upload
const upload = multer({ dest: 'uploads/' }); // Image will be stored in 'uploads' folder

// Root route for testing
app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

app.post('/ask', upload.single('image'), async (req, res) => {
    const userMessage = req.body.message;
    const imageFile = req.file; // Multer handles the image file
    const assistantId = 'asst_TkjKcEeVNsF0gYE8cLRVi2iQ'; // Replace with your actual assistant ID
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key is missing!' });
    }

    try {
        if (imageFile) {
            console.log(`Received image: ${imageFile.originalname}`);
            // Additional image handling can be done here
        }

        // Send the request to OpenAI API using the assistant ID
        const response = await axios.post(`https://api.openai.com/v1/assistants/${assistantId}/messages`, {
            messages: [
                { role: "user", content: userMessage }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            }
        });

        // Log the entire API response for debugging
        console.log("API Response:", response.data);

        // Send back the assistant's response
        if (response.data && response.data.choices && response.data.choices.length > 0) {
            const assistantResponse = response.data.choices[0].message.content;
            res.json({ message: assistantResponse });
        } else {
            res.json({ message: "No response from assistant." });
        }
    } catch (error) {
        console.error('Error fetching assistant response:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
