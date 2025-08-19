Connectly 🤝
============

A modern, full-stack web application that bridges the gap between community-focused organizations and local volunteers. Connectly serves as a central hub for organizations to post volunteering opportunities and for volunteers to discover and engage with causes they care about.

This project showcases a complete, feature-rich platform with a robust backend and responsive frontend, developed for a competition.

🌟 Features
-----------

### 🏠 **Public Initiative Feed**

-   Beautifully designed homepage accessible to everyone
-   Showcases all upcoming volunteering opportunities
-   Live search functionality to find relevant initiatives

### 👥 **Dual User Roles**

-   **Organizations**: Create and manage volunteering initiatives
-   **Volunteers**: Discover and join meaningful causes
-   Role-based authentication and user experience

### 🎨 **Dynamic Role-Based UI**

-   **Organizations**: Access to dedicated dashboard and initiative creation tools
-   **Volunteers**: "I'm In!" button to join initiatives instantly
-   **Guests**: Browse all initiatives with prompts to register for participation

### 🔐 **Secure Authentication**

-   Session-based authentication system
-   Protects sensitive actions and user data
-   Simple and straightforward user experience

🛠️ Tech Stack
--------------

| Component | Technology |
| --- | --- |
| **Backend** | Ballerina |
| **Frontend** | React (Vite) |
| **Styling** | Tailwind CSS |
| **Database** | MySQL |

📋 Prerequisites
----------------

Before running this application, ensure you have the following installed:

-   [Node.js](https://nodejs.org/) (includes npm)
-   [Ballerina Swan Lake](https://ballerina.io/downloads/) (latest version)
-   [MySQL Server](https://dev.mysql.com/downloads/mysql/)
-   Code editor (recommended: [VS Code](https://code.visualstudio.com/))

🚀 Quick Start
--------------

### 1\. Clone the Repository

```
git clone https://github.com/RashmikaMadaela/connectly.git 
cd connectly
```

### 2\. Database Setup

Connect to your MySQL server and run the following script:

```
-- Create the database
DROP DATABASE IF EXISTS connectly_db;
CREATE DATABASE connectly_db;
USE connectly_db;

-- Users table (stores both volunteers and organizations)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARBINARY(32) NOT NULL,
    role ENUM('organization', 'volunteer') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initiatives table (volunteering opportunities)
CREATE TABLE initiatives (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    event_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Participants table (links volunteers to initiatives)
CREATE TABLE participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    initiative_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (initiative_id, user_id),
    FOREIGN KEY (initiative_id) REFERENCES initiatives(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

```

### 3\. Backend Setup

```
# Navigate to backend directory
cd connectly-backend
```

```
# Create and configure Config.toml
# Replace with your MySQL credentials
[dbOptions]
host="127.0.0.1"
user="your_mysql_user"
password="your_mysql_password"
database="connectly_db"
port=3306
```

```
# Run the backend service
bal run

```

The backend will be available at `http://localhost:9090`

### 4\. Frontend Setup

Open a new terminal window:

```
# Navigate to frontend directory
cd connectly-frontend

# Install dependencies
npm install

# Start development server
npm run dev

```

The frontend will be available at `http://localhost:5173`

📱 Usage
--------

1.  **Browse Initiatives**: Visit the homepage to see all available volunteering opportunities
2.  **Register**: Sign up as either a Volunteer or Organization
3.  **For Organizations**:
    -   Access your dashboard
    -   Create new initiatives
    -   Manage your posted opportunities
4.  **For Volunteers**:
    -   Browse and search initiatives
    -   Click "I'm In!" to join causes you care about
    -   Track your volunteering activities

🏗️ Project Structure
---------------------

```
connectly/
├── connectly-backend/     # Ballerina backend service
│   ├── Config.toml       # Database configuration
│   └── ...
├── connectly-frontend/    # React frontend application
│   ├── src/
│   ├── package.json
│   └── ...
└── README.md

```

🤝 Contributing
---------------

If you'd like to contribute:

1.  Fork the repository
2.  Create a feature branch (`git checkout -b feature/amazing-feature`)
3.  Commit your changes (`git commit -m 'Add some amazing feature'`)
4.  Push to the branch (`git push origin feature/amazing-feature`)
5.  Open a Pull Request


🙏 Acknowledgments
------------------

-   Thanks to the Ballerina and React communities for excellent documentation
-   Inspired by the need to connect communities with meaningful volunteer opportunities


* * * * *

**Made with ❤️ for connecting communities**
