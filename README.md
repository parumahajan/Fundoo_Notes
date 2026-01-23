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

### Backend

* .NET (ASP.NET Core)
* Entity Framework Core
* RESTful APIs

### Database

* Microsoft SQL Server

### Authentication

* JWT (JSON Web Tokens)

### Tools & Platforms

* Git & GitHub
* Visual Studio Code / Visual Studio
* Swagger

---

## 📁 Project Structure

```
Directory structure:
└── parumahajan-fundoo_notes/
    ├── Backend/
    │   ├── FundooNotes.slnx
    │   ├── BusinessLayer/
    │   │   ├── BusinessLayer.csproj
    │   │   ├── Exceptions/
    │   │   │   ├── NotFoundException.cs
    │   │   │   ├── UnauthorizedException.cs
    │   │   │   └── ValidationException.cs
    │   │   └── Interfaces/
    │   │       └── Services/
    │   │           ├── IAuthService.cs
    │   │           ├── ICollaboratorService.cs
    │   │           └── ILabelService.cs
    │   ├── DataBaseLayer/
    │   │   ├── Configurations/
    │   │   │   └── LabelConfiguration.cs
    │   │   ├── Entities/
    │   │   │   ├── Collaborator.cs
    │   │   │   ├── Label.cs
    │   │   │   ├── Note.cs
    │   │   │   └── NoteLabel.cs
    │   │   ├── Enums/
    │   │   │   └── PermissionLevel.cs
    │   │   ├── Interfaces/
    │   │   │   ├── ICollaboratorRepository.cs
    │   │   │   ├── ILabelRepository.cs
    │   │   │   ├── INoteRepository.cs
    │   │   │   └── IUserRepository.cs
    │   │   └── Migrations/
    │   │       ├── 20260118133948_InitialCreate.cs
    │   │       ├── 20260118134520_InitialCreate1.cs
    │   │       ├── 20260120085249_Migration1.cs
    │   │       ├── 20260121100210_UpdateLabelDeleteBehaviorToCascade.cs
    │   │       └── 20260123050728_AddDisplayOrderToNotes.cs
    │   ├── FundooNotes/
    │   │   ├── FundooNotes.http
    │   │   ├── Helpers/
    │   │   │   ├── PasswordHasher.cs
    │   │   │   └── ResponseHelper.cs
    │   │   └── Properties/
    │   │       └── launchSettings.json
    │   ├── ModelLayer/
    │   │   ├── ModelLayer.csproj
    │   │   ├── Configuration/
    │   │   │   ├── AppSettings.cs
    │   │   │   ├── CorsSettings.cs
    │   │   │   ├── JwtSettings.cs
    │   │   │   ├── SecuritySettings.cs
    │   │   │   └── SmtpSettings.cs
    │   │   ├── Domain/
    │   │   │   ├── CollaboratorModel.cs
    │   │   │   ├── LabelModel.cs
    │   │   │   ├── NoteModel.cs
    │   │   │   └── UserModel.cs
    │   │   ├── DTOs/
    │   │   │   ├── Auth/
    │   │   │   │   ├── AuthResponseDto.cs
    │   │   │   │   ├── ForgotPasswordDto.cs
    │   │   │   │   ├── LoginRequestDto.cs
    │   │   │   │   ├── LoginResultDto.cs
    │   │   │   │   ├── LogoutRequestDto.cs
    │   │   │   │   ├── RefreshTokenDto.cs
    │   │   │   │   ├── RegisterRequestDto.cs
    │   │   │   │   ├── ResetPasswordDto.cs
    │   │   │   │   └── VerifyOtpRequestDto.cs
    │   │   │   ├── Collaborators/
    │   │   │   │   ├── AddCollaboratorDto.cs
    │   │   │   │   ├── CollaboratorResponseDto.cs
    │   │   │   │   └── UpdatePermissionDto.cs
    │   │   │   ├── Labels/
    │   │   │   │   ├── CreateLabelDto.cs
    │   │   │   │   ├── LabelResponseDto.cs
    │   │   │   │   └── UpdateLabelDto.cs
    │   │   │   └── Notes/
    │   │   │       ├── BulkDeleteDto.cs
    │   │   │       ├── CreateNoteDto.cs
    │   │   │       ├── NoteResponseDto.cs
    │   │   │       ├── ReorderNotesDto.cs
    │   │   │       ├── SearchNotesDto.cs
    │   │   │       ├── UpdateNoteColorDto.cs
    │   │   │       └── UpdateNoteDto.cs
    │   │   ├── Enums/
    │   │   │   └── PermissionLevel.cs
    │   │   └── Responses/
    │   │       ├── ApiResponse.cs
    │   │       ├── ErrorResponse.cs
    │   │       ├── PaginationRequest.cs
    │   │       └── SearchRequest.cs
    │   └── Testing/
    │       └── Properties/
    │           └── launchSettings.json
    └── Frontend/
        ├── tsconfig.app.json
        ├── tsconfig.json
        ├── tsconfig.spec.json
        ├── .editorconfig
        └── src/
            ├── index.html
            ├── main.server.ts
            ├── main.ts
            ├── app/
            │   ├── app.config.server.ts
            │   ├── app.config.ts
            │   ├── app.html
            │   ├── app.routes.server.ts
            │   ├── app.scss
            │   ├── app.spec.ts
            │   ├── app.ts
            │   ├── core/
            │   │   ├── guards/
            │   │   │   └── auth.guard.ts
            │   │   ├── interceptors/
            │   │   │   └── auth.interceptor.ts
            │   │   ├── models/
            │   │   │   ├── api-response.model.ts
            │   │   │   ├── index.ts
            │   │   │   ├── label.model.ts
            │   │   │   └── note.model.ts
            │   │   └── services/
            │   │       └── index.ts
            │   └── features/
            │       ├── auth/
            │       │   └── pages/
            │       │       ├── login/
            │       │       │   └── login.spec.ts
            │       │       └── register/
            │       │           └── register.spec.ts
            │       └── dashboard/
            │           ├── components/
            │           │   ├── main-content/
            │           │   │   └── main-content.spec.ts
            │           │   ├── navbar/
            │           │   │   └── navbar.spec.ts
            │           │   ├── note-card/
            │           │   │   └── note-card.spec.ts
            │           │   ├── sidebar/
            │           │   │   └── sidebar.spec.ts
            │           │   └── take-note/
            │           │       └── take-note.spec.ts
            │           └── pages/
            │               ├── home/
            │               │   ├── home.html
            │               │   └── home.spec.ts
            │               ├── loading/
            │               │   ├── loading.html
            │               │   ├── loading.scss
            │               │   ├── loading.spec.ts
            │               │   └── loading.ts
            │               └── pagenotfound/
            │                   ├── pagenotfound.html
            │                   ├── pagenotfound.scss
            │                   ├── pagenotfound.spec.ts
            │                   └── pagenotfound.ts
            └── environments/
                ├── environment.prod.ts
                └── environment.ts

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
cd .\Backend\
cd .\FundooNotes\
dotnet build
dotnet run
```

### Frontend Setup

```bash
cd .\Frontend\
npm install (Just once)
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
