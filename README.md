# JRKC Bookstore Management System - CTU

## DEMO

   Vercel: <https://jrkc-bookstore.vercel.app>

### TODO

- Landing page

## Local Setup and Development

This project is designed for local development and demonstration purposes. Follow these steps to set up and run the JRKC Bookstore Management System locally:

1. **Clone the Repository:**

   ```bash
   git clone [YOUR_REPOSITORY_URL]
   cd hrkc-bookstore-management-system

2. **Install Dependencies:**

   ```bash
    npm install

3. **Environment Configuration:**

   - Rename `.env.local.example` to `.env.local`
   - Update the following variables in `.env.local`:
  
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[INSERT SUPABASE PROJECT API ANON KEY]
   NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY=[INSERT YOUR GOOGLE BOOKS API KEY]
   NEXT_PUBLIC_GOOGLE_BOOKS_API_URL=[INSERT GOOGLE BOOKS API URL]

4. Run the Development Server:

   ```bash
   npm run dev

## Technologies Used

- NEXT.js - <https://nextjs.org/>
- React - <https://react.dev/>
- NextUI - <https://nextui.org>
- Supabase - <https://supabase.com>
- Mookoon - <https://mockoon.com/mock-samples/category/payment/>

The application should now be running on <https://localhost:3000>

## FOR CONTRIBUTORS LISTED BELOW

- Please follow the coding standards of the project: industries best practices
- submit pull requests in a separate branch instead of pushing to the main branch.

---

This project is developed as part of the CTU curriculum and is intended for educational purposes only.

Powered by the following:

- Joshua Castillo
- Ricky Holder
- Javon Kelley
- Thomas Cayne
