# Aisylum
Think refugees and asylum seekers using AI without fear of being their info being compromised.

Aisylum is a platform designed to empower refugees and asylum seekers by leveraging AI technology to provide assistance without compromising their personal information. The project prioritizes security, privacy, and accessibility.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## Features

* **AI-Powered Assistance**: Tools and resources powered by AI to provide guidance and support, making tasks more efficient and intuitive.
* **Document Transcription**: Convert audio and video content into text with high accuracy, enabling quick access to spoken information.
* **Document Summary**: Summarize long documents into concise, easy-to-understand highlights, saving time on reading.
* **Offline Support**: Includes a service worker for offline functionality, allowing users to access key features without an internet connection.
* **Language Detection and Translation**: Automatically detect the language of the input and provide translations to various languages, facilitating multilingual communication.

---

## Tech Stack

### Frontend
- **React**: For building the user interface.
- **TypeScript**: Ensures type safety and better developer experience.
- **CSS Modules**: For scoped and maintainable styles.
- **Vite**: A fast build tool for modern web development.

### Backend
- **Node.js**: For server-side logic.
- **Express.js**: A lightweight framework for building APIs.

### State Management
- **Zustand**: For managing global state.

### Additional Tools
- **Service Worker**: For offline capabilities.
- **ESLint**: For maintaining code quality.
- **Prettier**: For consistent code formatting.

---


### Key Directories and Files

- **`src/`**: Contains the main application code, including components, contexts, hooks, and services.
- **`api/`**: Backend logic for handling fallback remote API requests and serving data.
- **`public/`**: Static assets such as images and offline pages.
- **`service-worker.js`**: Implements offline capabilities.
- **`vite.config.ts`**: Configuration for the Vite build tool.

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/DavidTimi1/Aisylum
   cd Aisylum
   ```

2. Install dependencies
   ```bash
   npm install
   ```
3.Set up environment variables:
Copy `.env.example` to `.env` and configure the necessary variables.

## Usage
###  Running the dev server
for frontend:
```bash
    npm run dev
```

for backend:
```bash
    node api/index.js
```

## Contributing
1. Fork the repo
2. Create a new branch
```bash
    git checkout -b feature/your-feature-name
```
3. Commit your changes
```bash
git commit -m "Add your message here"
```
4. Push your form
```bash
git push origin feature/your-feature-name
```

## License
This project is licensed under MIT license
[MIT License](LICENSE)