# 📝 Fundoo Notes

**Fundoo Notes** is a full-featured note-taking application inspired by **Google Keep**, designed to provide a seamless and intuitive experience for creating, organizing, and collaborating on notes.
It supports all core functionalities of Google Keep, including authentication, labels, collaborators, reminders, archive, trash, and more.

---

## 🚀 Features

### 🔐 Authentication & Authorization

* Secure user registration and login
* JWT-based authentication
* Password encryption and validation
* Role-based access control

### 🗒️ Notes Management

* Create, edit, delete notes
* Pin / unpin notes
* Archive and restore notes
* Trash and permanent delete
* Color-coded notes
* Add titles and rich text descriptions

### 🏷️ Labels

* Create, update, and delete labels
* Assign multiple labels to notes
* Filter notes by labels

### 👥 Collaborators

* Add collaborators to notes
* Share notes securely with other users
* Real-time collaborative access

### ⏰ Reminders

* Set date & time reminders
* Get notified for scheduled notes
* Update or remove reminders

### 🔍 Search & Filter

* Search notes by title or content
* Filter by labels, reminders, archived, or trashed notes

### ☁️ Additional Features

* Responsive UI (desktop & mobile friendly)
* Cloud-ready architecture
* Clean and intuitive user experience

---

## 🛠️ Tech Stack

### Frontend

* Angular
* TypeScript
* HTML5
* CSS3
* Bootstrap / Material UI

### Backend

* .NET (ASP.NET Core)
* Entity Framework Core
* RESTful APIs

### Database

* SQL Server

### Authentication

* JWT (JSON Web Tokens)

### Tools & Platforms

* Git & GitHub
* Visual Studio Code / Visual Studio
* Postman

---

## 📁 Project Structure

```
FundooNotes/
│
├── Frontend/
│   ├── src/
│   ├── components/
│   ├── services/
│   └── modules/
│
├── Backend/
│   ├── Controllers/
│   ├── Models/
│   ├── Services/
│   ├── Repositories/
│   └── Middleware/
│
├── Database/
│   └── Migrations/
│
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

* Node.js & npm
* Angular CLI
* .NET SDK
* SQL Server

### Backend Setup

```bash
cd Backend
dotnet restore
dotnet build
dotnet run
```

### Frontend Setup

```bash
cd Frontend
npm install
ng serve
```

Access the application at:

```
http://localhost:4200
```

---

## 🔑 API Functionalities

* User Authentication APIs
* Notes CRUD APIs
* Label Management APIs
* Collaborator APIs
* Reminder APIs
* Archive & Trash APIs

---

## 🎯 Future Enhancements

* Real-time notifications
* Drag and drop notes
* Dark mode
* Advanced search filters
* Mobile application

⭐ If you like this project, don’t forget to **star** the repository!
