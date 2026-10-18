# Tirup Mehta Portfolio

A modern, responsive portfolio website built with cutting-edge web technologies. This project showcases professional work, projects, and skills with a beautiful, interactive user interface.

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) - React framework for production
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript (`npm run lint` = `tsc --noEmit`)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Icons**: [Lucide React](https://lucide.dev/) - Beautiful, consistent SVG icons
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics) - Web performance monitoring
- **Blog source**: Convex (read-only mirror of blogs.tirup.in, `CONVEX_API_URL`, ISR 60s)

> NOTE: Radix / react-hook-form / zod / recharts / sonner / date-fns / embla /
> vaul / cmdk / next-themes remain in `package.json` as unused deps (cleanup
> pending: see `npm ls`). Do not import them in new code.

## 📁 Project Structure

```
tirup.in/
├── app/                    # Next.js app directory
├── components/             # Reusable React components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and helpers
├── public/                 # Static assets
├── styles/                 # Global styles
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── next.config.mjs         # Next.js configuration
```

## 🛠️ Development

### Prerequisites
- Node.js 18+ or later
- pnpm (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install
```

### Running Locally

```bash
# Start development server
pnpm dev
```

The site will be available at `http://localhost:3000`

### Build for Production

```bash
# Create optimized production build
pnpm build

# Start production server
pnpm start
```

### Linting

```bash
# Run ESLint to check code quality
pnpm lint
```

## 🌐 Deployment

This project is deployed at [tirup.in](https://tirup.in)

Built and deployed with [Vercel](https://vercel.com) for optimal performance and automatic deployments.

## ✨ Features

- **Responsive Design** - Works seamlessly across all devices
- **Dark Mode Support** - Built-in theme switching capability
- **Performance Optimized** - Fast load times with Next.js optimization
- **Accessible** - Built with accessibility best practices using Radix UI
- **Type-Safe** - Full TypeScript support for robust code
- **Modern UI** - Beautiful component system with Shadcn/ui
- **Analytics** - Integrated Vercel Analytics for performance tracking

## 📝 License

This project is private. All rights reserved.

## 👤 Author

**Tirup Mehta**

- GitHub: [@TirupMehta](https://github.com/TirupMehta)
- Website: [tirup.in](https://tirup.in)

---

Built with ❤️ using Next.js and React
