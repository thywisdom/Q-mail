# Q-Mail

## Overview

Q-Mail is a secure and modern mailing application built using **Nest.js**, **Node.js**, **ShadCN**, **Tailwind CSS**, and **TypeScript**. It uses **Supabase** for database management and authentication services. The application offers universal mail features such as **Inbox, Sent, Trash, Delete, Archive, and Profile Management** while also incorporating an advanced feature of **message encryption and decryption using user-specific keys**.

---

## Features

- **Authentication & User Management:** Secure login and signup using Supabase authentication with two options:
  - **Google Sign-In:** Retrieves Name, Email ID, and profile details from the Google account.
  - **Manual Sign-Up:** Users enter their Name, Email ID, and profile details with a profile image. A verification email is triggered to the user's email ID, requiring confirmation before accessing the application.
- **Inbox:** View received emails.
- **Sent Mail:** View sent emails.
- **Trash:** Deleted emails are stored here.
- **Archive:** Move important emails to the archive for future reference.
- **Delete Permanently:** Remove emails permanently from the system.
- **Profile Management:** Update user details and settings.
- **End-to-End Encryption:** Users can **encrypt messages** before sending and **decrypt received messages** using their specific keys.
- **Unique UI & Animations:** A creative and user-friendly UI with smooth animations for:
  - Successful encryption/decryption
  - Sign-in process
  - Profile updates
  - Wrong key alert

---

## Tech Stack

- **Frontend:** Nest.js, ShadCN, Tailwind CSS, TypeScript
- **Backend:** Node.js, Supabase
- **Encryption Algorithm:** CRYSTALS-Kyber for post-quantum security

---

## Installation & Setup

### Prerequisites

Ensure you have the following installed:

- Node.js (>= 16.x)
- npm or yarn
- Supabase Account

### Clone the Repository

```sh
git clone https://github.com/yourusername/q-mail.git
cd q-mail
```

### Install Dependencies

```sh
npm install  # or yarn install
```

### Setup Environment Variables

Create a `.env.local` file in the root directory and add the following:

```env
NEST_PUBLIC_SUPABASE_URL=your_supabase_url
NEST_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEST_PUBLIC_SUPABASE_GOOGLE_CLIENT_ID=your_google_client_id
NEST_PUBLIC_SUPABASE_GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Start the Development Server

```sh
npm run dev  # or yarn dev
```

The application will be running at `http://localhost:3000`

---

---

## Authentication & Database Setup

### Supabase Authentication Queries

#### Create Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    profile_image TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Trigger Email Verification

```sql
CREATE FUNCTION send_verification_email()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM supabase.auth.sign_up(
        email := NEW.email,
        password := 'temp_password',
        data := json_build_object('name', NEW.name, 'profile_image', NEW.profile_image)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_send_email
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION send_verification_email();
```

---

## Encryption & Decryption

The application includes a dedicated `encryption` directory for handling secure communication. Each message is encrypted using a **user-specified key** before sending and decrypted upon receiving.

### Example Encryption Workflow using CRYSTALS-Kyber

```ts
import { encryptKyber, decryptKyber } from '../encryption/kyber';

export function encryptMessage(message: string, userKey: string): string {
  return encryptKyber(message, userKey);
}
```

### Example Decryption Workflow using CRYSTALS-Kyber

```ts
export function decryptMessage(encryptedMessage: string, userKey: string): string {
  return decryptKyber(encryptedMessage, userKey);
}
```

These functions are called whenever an email is sent or received, ensuring post-quantum security.

---

## Automatic Email Triggers

Q-Mail includes an automated email notification system for various events. Each email type has a preset message format.

### **Triggers and Events**
- **Verification Email:** Sent after signup to confirm the user's email.
- **Successful Login:** Sends an email notifying the user of a successful login.
- **New Mail Notification:** Alerts the recipient when a new email is received.
- **Inactivity Alert:** Sent after 30 days of inactivity.

### **Implementation**
#### **Using Nodemailer for Email Notifications**
```ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendEmail(to: string, subject: string, text: string) {
  const mailOptions = {
    from: 'no-reply@qmail.com',
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
}
```

#### **Preset Email Messages**
- **Verification Email:** "Thank you for signing up. Please verify your email to access Q-Mail."
- **Login Alert:** "You have successfully logged in. If this wasn't you, change your password immediately."
- **New Mail Alert:** "You have received a new encrypted message in Q-Mail. Please log in to view it."
- **Inactivity Reminder:** "You have been inactive for 30 days. Log in now to stay updated."

This setup ensures automatic email notifications for key user interactions.

---

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user and send a verification email
- `POST /api/auth/login` - Log in user
- `POST /api/auth/logout` - Log out user
- `POST /api/auth/google-login` - Authenticate via Google OAuth

