# Mine-Tube-io

**A backend implementation inspired by YouTube, focusing on managing videos, playlists, and user subscriptions with robust authentication and scalable APIs.**

## Features

- **User Authentication**: Secure login, registration, and session management using JWT.
- **Video Management**: Upload, delete, and organize videos with cloud storage integration via Cloudinary.
- **Playlist Functionality**: Create, update, and manage playlists with real-time updates.
- **Subscriptions**: Follow channels, manage subscriptions, and track subscribers.
- **Scalable APIs**: Designed for performance and scalability, handling large datasets efficiently.

## Technologies Used

- **Node.js**: Server-side JavaScript runtime.
- **Express**: Web framework for creating APIs.
- **MongoDB**: NoSQL database for storing user data, videos, and subscriptions.
- **Mongoose**: ODM for MongoDB, handling data schema and validation.
- **Cloudinary**: Cloud storage for video uploads and management.
- **JWT**: For secure user authentication and authorization.
- **Multer**: For handling file uploads, particularly video files.
- **Nodemailer**: For sending notification emails.
- **bcryptjs**: For password hashing and security.
- **dotenv**: For managing environment variables.
- **cors**: For handling cross-origin requests.
- **cookie-parser**: For parsing and managing cookies.


## Project Structure : 
 
- **controllers**: Contains logic for handling requests and responses.
- **models**: Mongoose schemas for the database.
- **routes**: Defines all API endpoints.
- **middlewares**: Authentication, error handling, and other middleware.
- **utils**: Helper functions and reusable utilities.