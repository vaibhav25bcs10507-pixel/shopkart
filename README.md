# 🛒 ShopKart

ShopKart is a full-stack web application built to explore modern web development concepts, including frontend development, backend API integration, database management, and version control.

## 🚀 Features

- Interactive user interface
- Frontend and backend integration
- REST API development
- Database integration with MongoDB
- Organized and modular project structure
- Environment-based configuration

> Add or remove features according to the functionality actually implemented in your project.

## 🛠️ Tech Stack

**Frontend**
- React.js
- Vite
- Tailwind CSS

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose

**Tools**
- Git
- GitHub
- npm

## 📁 Project Structure

```text
ShopKart/
├── src/                 # Frontend source code
├── public/              # Static assets
├── backend/             # Backend application
│   ├── src/             # Routes, controllers, models
│   └── package.json     # Backend dependencies
├── index.html
├── package.json         # Frontend dependencies
├── vite.config.js
├── .gitignore
└── README.md
```

*The structure above is illustrative. Adjust it to match your actual files and folders.*

## ⚙️ Getting Started

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- npm
- [MongoDB](https://www.mongodb.com/) or a MongoDB Atlas connection

### 1. Clone the repository

```bash
git clone https://github.com/harshitlakhara7877/shopKart.git
cd shopKart
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Configure environment variables

Create a `.env` file in the backend directory and add the variables required by your backend.

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

Replace the example values with your actual configuration. Refer to your backend code for the exact variable names required.

**Important:** Never commit your `.env` file or expose database credentials and API secrets publicly.

### 5. Run the backend

From the `backend` directory, run the appropriate script defined in its `package.json`. For example:

```bash
npm run dev
```

### 6. Run the frontend

Open a new terminal in the project root:

```bash
npm run dev
```

Vite will display a local development URL, usually:

```text
http://localhost:5173
```

Open that URL in your browser.

## 🔐 Environment Variables

Configure all environment variables required by the application before running it.

Keep credentials private and use `.env.example` to document required variable names without including real secret values.

## 📚 What I Learned

- Building user interfaces with React.
- Developing backend APIs using Node.js and Express.js.
- Integrating MongoDB with Mongoose.
- Connecting frontend components to backend APIs.
- Debugging application errors and managing dependencies.
- Using Git and GitHub for version control and project collaboration.

## 🔮 Future Improvements

- Improve responsive design and accessibility.
- Add
