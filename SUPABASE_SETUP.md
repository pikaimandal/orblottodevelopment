# ORB Lotto - Supabase Setup Guide

This guide will walk you through setting up Supabase for your ORB Lotto application.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project
3. Choose a name for your project (e.g., "orb-lotto")
4. Choose a secure password for your database
5. Select a region closest to your users
6. Wait for your project to be created (this may take a few minutes)

## 2. Get Your Supabase Credentials

1. Once your project is created, go to the Project Settings > API
2. Copy the `Project URL` and `anon public` key
3. Add these to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 3. Run Database Migrations

The migration files in the `supabase/migrations` directory define the database schema for ORB Lotto. There are several ways to apply these migrations:

### Option 1: Using the Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of each migration file in the `supabase/migrations` directory
4. Paste and run each file in order (starting with `20250409000000_initial_schema.sql`)

### Option 2: Using the Supabase CLI (More Advanced)

1. Install the Supabase CLI by following the [official guide](https://supabase.com/docs/guides/cli)
2. Link your project:

```bash
supabase login
supabase link --project-ref your_project_ref
```

3. Push your migrations:

```bash
supabase db push
```

## 4. Test the Setup

After completing the setup, you should be able to:

1. Connect to your Supabase project from the ORB Lotto application
2. See the tables created in the Supabase Dashboard under the "Table Editor" section
3. Connect with a wallet and see user data stored in the database

## Database Schema

The ORB Lotto database consists of the following tables:

### Users
- Stores user profiles linked to their wallet addresses
- Connected to the Supabase Auth system

### Ticket Types
- Defines the different types of lottery tickets available (Basic, Plus, Super, etc.)
- Includes price information

### Draws
- Stores information about lottery draws
- Includes draw dates, winning numbers, and prize pool amounts

### Tickets
- Records all tickets purchased by users
- Links to users, draws, and ticket types

### Transactions
- Tracks all financial transactions
- Includes ticket purchases and winnings

## Stored Procedures

The database includes the following stored procedures:

### purchase_tickets
- Handles the purchase of lottery tickets in a transaction
- Creates both ticket and transaction records atomically

### increment and increment_by
- Utility functions for incrementing values

## Security

The database uses Row Level Security (RLS) to ensure that:
- Users can only access their own data
- Public views are available for transparency

## Maintenance and Backups

Supabase automatically handles backups of your database. However, it's recommended to:
1. Regularly export important data
2. Monitor database size and performance
3. Set up alerts for any issues

## Getting Help

If you encounter any issues with the Supabase setup:
1. Check the Supabase documentation: https://supabase.com/docs
2. Join the Supabase Discord: https://discord.supabase.com
3. Review the migration files in the `supabase/migrations` directory 