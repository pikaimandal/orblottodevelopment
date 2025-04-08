# ORB Lotto - Worldcoin Mini App

ORB Lotto is a lottery mini app for the Worldcoin WorldApp platform. It allows users to purchase lottery tickets of different values and participate in daily draws.

## Features

- Five lottery tiers: Basic ($1), Plus ($5), Super ($10), Mega ($100), and Jackpot ($500)
- Integrated with Worldcoin WorldApp via MiniKit
- Daily draws with transparent prize distribution
- Dark mode UI optimized for WorldApp

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your Worldcoin app ID:
   ```
   NEXT_PUBLIC_WORLDCOIN_APP_ID=your_app_id_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## WorldApp Integration

This app uses the Worldcoin MiniKit for integration with WorldApp. The app will display a status indicator showing whether it's properly connected to WorldApp.

When testing outside of WorldApp:
- The app will show a warning that it's not running in WorldApp
- A fallback wallet connection is provided for testing

## Ticket Types

- ORB Lotto Basic - $1
- ORB Lotto Plus - $5
- ORB Lotto Super - $10
- ORB Lotto Mega - $100
- ORB Lotto Jackpot - $500

## Prize Distribution

- 60% of ticket sales go to the prize pool
- 10% goes to foundation contribution
- 30% for operational costs

## Building for Production

```bash
npm run build
```

## Deploying to WorldApp

Follow the [Worldcoin Mini App documentation](https://docs.world.org/mini-apps/) for instructions on how to deploy your app to WorldApp. 