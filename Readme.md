# 📝 Real-Time Collaborative Text Editor

A modern, cloud-based collaborative text editor built with React and Express.js that allows multiple users to create, edit, and share documents in real-time. Similar to Google Docs, this application provides rich text editing capabilities with automatic cloud synchronization.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

## ✨ Features

### 📖 Rich Text Editing
- **Slate.js Editor**: Professional rich text editing experience
- **Text Formatting**: Bold, italic, underline styling options
- **Heading Levels**: Support for H1, H2, H3 headings
- **Keyboard Shortcuts**: Ctrl+B, Ctrl+I, Ctrl+U for quick formatting

### ☁️ Cloud Integration
- **Auto-Save**: Documents automatically save every 600ms
- **MongoDB Atlas**: Cloud database for persistent storage
- **Real-time Status**: Live saving indicators and timestamps
- **Cross-Device Sync**: Access your documents from anywhere

### 📑 Document Management
- **Document List**: Browse all available documents
- **Create & Edit**: Seamless document creation and editing
- **Navigation**: Easy switching between documents
- **Persistent URLs**: Each document has a unique identifier

### 🔒 Collaborative Features
- **Shared Database**: Multiple users can access the same documents
- **Public Access**: Anyone can edit documents (configurable)
- **Version Tracking**: Automatic timestamps for document updates

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI library
- **Slate.js** - Rich text editing framework  
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Express.js** - Web application framework
- **MongoDB Atlas** - Cloud database service
- **Mongoose** - MongoDB object modeling
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB Atlas Account** - [Sign up here](https://cloud.mongodb.com/)
- **Git** - [Download here](https://git-scm.com/)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/pritesh0089/Real-Time-Collaborative-Text-Editor.git
cd Real-Time-Collaborative-Text-Editor
```

### 2. Set up MongoDB Atlas

1. Create a MongoDB Atlas account at [cloud.mongodb.com](https://cloud.mongodb.com/)
2. Create a new cluster (free tier is sufficient)
3. Create a database user with read/write permissions
4. Get your connection string (it will look like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
5. **Important**: Add your IP address to the Network Access list, or add `0.0.0.0/0` to allow all IPs

### 3. Configure Environment Variables

Create environment file for the server:

```bash
# In the server directory
cd server
cp .env.example .env  # or create .env file manually
```

Edit `server/.env`:
```env
MONGO_URI=your_mongodb_connection_string_here
PORT=3000
```

Configure the frontend API URL:

```bash
# In the Client directory  
cd ../Client
```

Edit `Client/.env`:
```env
VITE_API_URL=http://localhost:3000
```

### 4. Install Dependencies

Install server dependencies:
```bash
cd server
npm install
```

Install client dependencies:
```bash
cd ../Client
npm install
```

## 🎯 Running the Application

### Start the Backend Server

```bash
cd server
npm start
```

You should see:
```
Server running on port 3000
✅ MongoDB Connected to Cluster0...
```

### Start the Frontend (in a new terminal)

```bash
cd Client
npm run dev
```

You should see:
```
Local: http://localhost:5173/
```

### 🌐 Access the Application

Open your browser and go to: **http://localhost:5173**

## 📖 Usage Guide

### Creating Documents
1. Click **"New Document"** on the homepage
2. Start typing - the document auto-saves every 600ms
3. Use the toolbar for formatting options
4. Edit the document title by clicking on "Untitled document"

### Managing Documents
- **Document List**: View all available documents on the homepage
- **Navigation**: Click "← Back" to return to document list
- **Status Indicators**: Watch for "Saving..." and "Cloud saved" messages

### Sharing & Collaboration
- Share the URL of any document with others
- Multiple people can edit the same document
- All changes are automatically synchronized to the cloud

## 🔧 Development

### Available Scripts

**Server:**
- `npm start` - Start the production server
- `npm run dev` - Start with nodemon for development

**Client:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
Real-Time-Collaborative-Text-Editor/
├── Client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── api/          # API service layer
│   │   ├── App.jsx       # Main app component
│   │   └── DocsMVP.jsx   # Rich text editor
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   └── server.js     # Server entry point
│   └── package.json
└── README.md
```

## 🚀 Deployment

### Deploy Backend (Railway/Render)
1. Sign up for [Railway](https://railway.app) or [Render](https://render.com)
2. Connect your GitHub repository
3. Set environment variables (MONGO_URI)
4. Deploy automatically

### Deploy Frontend (Vercel/Netlify)
1. Sign up for [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
2. Connect your GitHub repository
3. Set build settings:
   - **Root Directory**: `Client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set environment variables (VITE_API_URL=your-backend-url)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👥 Authors

- **Pritesh** - *Initial work* - [@pritesh0089](https://github.com/pritesh0089)
- **Contributors** - Thanks to all contributors who helped build this project

## 🙏 Acknowledgments

- [Slate.js](https://slatejs.org/) for the excellent rich text editor
- [MongoDB Atlas](https://cloud.mongodb.com/) for cloud database hosting
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Claude Code](https://claude.ai/code) for development assistance

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed:**
- Check your MongoDB Atlas IP whitelist
- Verify your connection string
- Ensure your database user has proper permissions

**Frontend Can't Connect to Backend:**
- Make sure backend is running on port 3000
- Check CORS settings
- Verify VITE_API_URL in frontend .env

**Documents Not Saving:**
- Check browser console for error messages
- Verify MongoDB connection
- Ensure proper API endpoints

### Getting Help

If you encounter any issues:
1. Check the [Issues](https://github.com/pritesh0089/Real-Time-Collaborative-Text-Editor/issues) page
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

---

**Made with ❤️ using React, Express.js, and MongoDB**
