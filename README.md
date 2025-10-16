# Bean Jam Bot

## Project info

**URL**: https://lovable.dev/projects/92c0885e-76cd-4f39-b3ea-ddd91c262af9

Bean Jam Bot is a minimalist brutalist AI chatbot interface with animated blob reactions, weather integration, and voice input support.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/92c0885e-76cd-4f39-b3ea-ddd91c262af9) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Set up your environment variables.
# Copy .env.example to .env and add your Google Gemini API key
cp .env.example .env
# Then edit .env and add your API key from https://aistudio.google.com/app/apikey

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Configuration

### Google Gemini API Setup

Bean Jam Bot uses Google Gemini AI to generate responses. To set it up:

1. Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a `.env` file in the project root (copy from `.env.example`)
3. Add your API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```
4. Restart the dev server if it's running

Bean Jam Bot will automatically use the language preference (English or Japanese) from the language toggle button in its prompts to Gemini.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/92c0885e-76cd-4f39-b3ea-ddd91c262af9) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
