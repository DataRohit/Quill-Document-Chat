# Quill - A Modern Fullstack SaaS-Platform

Built with the Next.js 13.5 App Router, tRPC, TypeScript, Prisma & Tailwind

![Project Image](https://raw.githubusercontent.com/DataRohit/Quill-Document-Chat/master/public/thumbnail.png)

Sure, let's reorganize the list to make it look more attractive and programmatic:

## Features

### Development
- 🛠️ Complete SaaS Built From Scratch
- 💻 Elegant Landing & Pricing Pages Included
- 💳 Flexible Payment Plans with Secure Integration
- 📊 Powerful ORM with 'DataForge'
- 🔤 100% Developed in TypeScript for Superior Quality

### User Interface
- 🎨 Modern UI Design Using 'DesignBloc'
- 🚀 Optimistic UI Updates for Seamless Experience
- ⚡ Lightning-Fast Message Loading for Enhanced Performance
- ✨ Instant Loading States for Effortless Navigation
- 📤 Intuitive Drag and Drop File Uploads

### Functionality
- 📄 Advanced PDF Viewer with Enhanced Functionality
- 🔄 Real-Time Streaming API Responses
- 🔒 Secure Authentication Using 'LockGuard'
- 🧠 Advanced AI Memory Expansion with 'NeuroLink'
- 🌲 Robust Vector Storage with 'VectorVault'

### Data Management
- 🔧 Modern Data Fetching Using 'Fetchify' & 'DataStream'

### Miscellaneous
- 🎁 ...and much more

This way, each section highlights a specific aspect of your product, making it easier for potential users to understand its capabilities.

## Getting started

To get started with this project, run


### Step 1:
```bash
  git clone https://github.com/DataRohit/Quill-Document-Chat
```

### Step 2:
Setup the environment variables in `.env` file
```env
KINDE_CLIENT_ID=c
KINDE_CLIENT_SECRET=
KINDE_ISSUER_URL=
KINDE_SITE_URL=
KINDE_POST_LOGOUT_REDIRECT_URL=
KINDE_POST_LOGIN_REDIRECT_URL=

DATABASE_URL=

UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

PINECONE_INDEX=
PINECONE_API_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

LM_STUDIO_SERVER=

HOSTED_URL=
```


*Note: I used `ssh -R 80:localhost:<PORT> serveo.net` to expose the following ports to network for access over*
- *`3000`: NextJS Web Server*
- *`5555`: Prisma Studio*
- *`5000`: LM-Studio Server*


### Step 3:
Start the following commands in the separate terminals to start the respective servers to test the website

**NextJS Web Server**
```bash
yarn dev
```

**Prisma Studio Server**
```bash
npx prisma studio
```


## Large Language Model Backend

Quill has been implemented using open source large language models hosted using the LM-Studio software.


## Deployment Issues

- The performance of LM-Studio depends on the host computer's RAM, CPU and GPU performance and capacity.
- Vercel / Netlify supports up to 10s of timeout but LM-Studio required higher timeout thus the website runs into issue when producing response.


## License

[MIT](https://raw.githubusercontent.com/DataRohit/Quill-Document-Chat/master/license)