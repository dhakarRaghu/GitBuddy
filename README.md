# AI-Powered Collaboration and Analysis Tool

This is a **T3 Stack** project designed to simplify project management, enhance collaboration, and provide AI-powered insights for developers. Built with cutting-edge technologies, the application analyzes repositories, summarizes commits, processes meeting audio, and offers chatbot-powered solutions for project-related queries.

## Key Features 🛠️

1. **Git Repository Analysis**  
   - Accepts Git repository URLs from users.  
   - Summarizes commit history for a quick project overview.

2. **AI Chatbot Assistance**  
   - Offers a chatbot to resolve project-related questions.  
   - Provides detailed insights into the repository and codebase.

3. **Meeting Audio Analysis**  
   - Upload meeting audio files for transcription and summarization.  
   - Identifies issues discussed during meetings and generates actionable summaries.

4. **Multi-Project Management**  
   - Users can manage multiple projects.  
   - Save summaries, analytics, and insights in one place.

5. **Collaborative Platform**  
   - Invite friends or teammates to collaborate on projects.  
   - Share insights, summaries, and project details.

## Technologies Used 💻

This project leverages the **T3 Stack** for a modern, full-stack web application:

- **[Next.js](https://nextjs.org)**: Framework for server-side rendering and static site generation.
- **[NextAuth.js](https://next-auth.js.org)**: For secure authentication.
- **[Prisma](https://prisma.io)**: ORM for database interaction.
- **[Drizzle](https://orm.drizzle.team)**: A lightweight, flexible ORM.
- **[Tailwind CSS](https://tailwindcss.com)**: Utility-first CSS framework for responsive and customizable designs.
- **[tRPC](https://trpc.io)**: End-to-end typesafe APIs.

## Getting Started 🚀

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo-name.git
cd your-repo-name
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory with the following:

```env
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_SECRET=your-nextauth-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
ASSEMBLY_AI_API_KEY=your-assembly-ai-key
```

### 4. Run Locally

Start the development server:

```bash
yarn dev
```

Access the app at https://git-buddy-69w18hzyp-raghvendra-singh-dhakars-projects.vercel.app

## Deployment 📦

This app is deployable on popular platforms like:

- [Vercel](https://vercel.com)  
- [Netlify](https://netlify.com)  
- [Docker](https://www.docker.com)  

Follow the respective guides for deployment.

## How It Works 🧑‍💻

1. **Input Git Repository**  
   - Users provide a Git repository URL.  
   - The app analyzes the repository, summarizes commits, and provides a chatbot for questions.

2. **Upload Meeting Audio**  
   - Meeting audio files are processed using AI-powered transcription.  
   - Summaries of discussions and identified issues are generated.

3. **Collaborate**  
   - Users can invite teammates, share summaries, and jointly manage projects.

4. **Insights & Summaries**  
   - All analytics and insights are saved for future reference.  
   - Seamlessly switch between projects and access historical data.

## Challenges Solved 🧩

- Centralized platform for project collaboration and AI-powered analysis.
- Quick access to actionable insights from code repositories and meetings.
- Real-time collaboration with friends or teammates.

## Future Enhancements 🔮

- **Enhanced AI Models**: Improve the accuracy of commit summaries and meeting transcriptions.
- **Additional Integrations**: Support for more repository platforms like GitLab and Bitbucket.
- **Performance Optimization**: Faster processing of audio files and larger repositories.
- **Custom Chatbot Models**: Personalized chatbots trained on specific project data.

## Contributing 🤝

We welcome contributions! Follow these steps:

1. Fork the repo.
2. Create a feature branch: `git checkout -b feature-name`.
3. Commit changes: `git commit -m "Add feature-name"`.
4. Push to the branch: `git push origin feature-name`.
5. Open a pull request.

---

