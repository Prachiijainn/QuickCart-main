This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Running with Inngest for Background Jobs

This application uses Inngest for handling background jobs like order processing. To run the application with Inngest support:

### Setup

1. Make sure you have a `.env.local` file with the necessary environment variables (see `.env.local.example`)

2. Install ngrok for tunneling (if you don't have it already):
   ```
   npm install -g ngrok
   ```

3. Start your Next.js development server:
   ```
   npm run dev
   ```

4. In a separate terminal, create a tunnel to your local server:
   ```
   ngrok http 3000
   ```

5. Copy the HTTPS URL provided by ngrok (e.g., https://abc123.ngrok.io)

6. In a third terminal, start the Inngest dev server:
   ```
   npm run inngest:dev
   ```

7. In your browser, go to the Inngest dev server (default: http://127.0.0.1:8288)

8. Connect your local server by entering the ngrok URL + `/api/inngest` in the "Dev server URL" field
   (e.g., https://abc123.ngrok.io/api/inngest)

Now your application should be able to send events to Inngest and process them correctly.

### Troubleshooting

If you see "We could not reach your URL":
- Make sure ngrok is running and your Next.js server is also running
- Check that you're using the correct URL in the Inngest dev server
- Verify that the `/api/inngest` route is working by visiting it in your browser

For production, you'll need to sign up for an Inngest account and configure the environment variables accordingly.
