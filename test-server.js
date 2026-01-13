import app from './api/server.js';

const PORT = 8001; // Use 8001 to avoid conflicts
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});
