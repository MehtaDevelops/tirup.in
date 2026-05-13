export const projectsData = {
  "trace-guard": {
    title: "Trace Guard",
    description: "Production-grade behavioral security engine to block sophisticated AI agents and Vision-Language Model (VLM) bots.",
    fullDescription: "Trace Guard silently intercepts HTTP requests to inject behavioral telemetry and block bots—specifically targeting agentic browsers driven by VLMs (Claude Computer Use, Playwright, Puppeteer). It relies on physical truths that cannot be spoofed.",
    liveUrl: "https://www.npmjs.com/package/trace-guard",
    github: "github.com/tirupmehta/trace-guard",
    techStack: ["Node.js", "TypeScript", "Edge Runtime", "CDP Detection"],
    engine: "Hardware Truth Engine (v3.7.0)",
    stats: {
      version: "v3.7.0",
      stars: "4",
      commits: "16",
    },
    details: [
      {
        title: "The Challenge",
        content: "Modern AI agents (VLMs) take screenshots and calculate pixel coordinates to click directly, bypassing traditional behavioral math because they don't physically move mice.",
      },
      {
        title: "The Solution",
        content: "Implemented 'Pre-Flight Teleport Traps' and physiological analysis like Acceleration Asymmetry—detecting the biomechanical difference in how humans push upward vs. downward.",
      },
      {
        title: "Key Innovations",
        content: "VLM Jamming, Ghost Mouse Payload detection, and Native Prototype Integrity checks to neutralize stealth plugins hiding navigator.webdriver.",
      },
      {
        title: "Deployment",
        content: "A zero-configuration 'setupHook' that globally patches http.createServer or integrates natively as Next.js Edge Middleware.",
      },
    ],
  },
  "peace": {
    title: "Peace",
    description: "An AI-powered therapist offering compassionate mental health support in English and Gujarati.",
    fullDescription: "Peace is an AI-powered therapy assistant designed to provide accessible, judgment-free mental health support. Uniquely supporting both English and Gujarati, it brings critical mental health resources to a broader demographic.",
    liveUrl: "https://peace.tirup.in",
    techStack: ["Next.js", "OpenAI API", "Vercel AI SDK", "Supabase"],
    stats: {
      languages: "English/Gujarati",
      focus: "Mental Health",
      interface: "AI Chat",
    },
    details: [
      {
        title: "The Challenge",
        content: "Mental health resources are often inaccessible due to cost, stigma, or language barriers, particularly for non-English speakers like the Gujarati community.",
      },
      {
        title: "The Solution",
        content: "Created a conversational AI therapist that is empathetic, culturally aware, and bilingual. It offers a safe space for users to articulate their feelings and receive constructive, supportive feedback.",
      },
    ],
  },
  "vectorize-ai-api": {
    title: "Vectorize AI API",
    description: "AI API service for small companies to integrate powerful AI capabilities into their websites with zero setup.",
    fullDescription: "Vectorize AI API provides a simple, powerful way for small companies to integrate AI capabilities into their websites without complex setup or API key management. Just send a request and get intelligent responses instantly.",
    liveUrl: "https://vectorize.in",
    documentationUrl: "https://github.com/TirupMehta/BeginsAI-v2",
    techStack: ["Node.js", "Redis", "Cloudflare Workers", "Python"],
    stats: {
      service: "AI Proxy",
      integration: "Zero-Setup",
      uptime: "24/7",
    },
    details: [
      {
        title: "The Challenge",
        content: "Small companies want to add AI features to their websites but are often overwhelmed by complex API setups and key management.",
      },
      {
        title: "The Solution",
        content: "Vectorize AI API eliminates complexity with a proxy service that handles all the technical details, allowing AI integration via simple HTTP requests.",
      },
    ],
  },
  "quott": {
    title: "QUOTT",
    description: "Daily inspiration Android app with hand-picked quotes on life, success, and love—beautifully presented and shareable.",
    fullDescription: "Get inspired every day with QUOTT. Now available as an Android app, discover hand-picked quotes on life, success, love, and more—beautifully presented and easy to share.",
    github: "github.com/TirupMehta/QUOTT",
    liveUrl: "https://quott.tirup.in",
    techStack: ["Android SDK", "Kotlin", "Java", "Firebase"],
    stats: {
      platform: "Android/Web",
      rating: "4.8/5",
      type: "Open Source",
    },
    details: [
      {
        title: "The Challenge",
        content: "People seek daily inspiration but often encounter cluttered quote apps with poor design and intrusive advertising.",
      },
      {
        title: "The Solution",
        content: "QUOTT curates high-quality quotes and presents them in a clean, elegant interface focused on user experience.",
      },
    ],
  },
  "typing-challenge": {
    title: "Typing Challenge",
    description: "A fast-paced typing challenge web application inspired by MonkeyType to test and improve typing speed.",
    fullDescription: "Typing Challenge is a sleek and interactive web application designed to help users test and improve their typing speed and accuracy. Featuring real-time feedback and dynamic tests, it offers a MonkeyType-like experience.",
    liveUrl: "https://typing-challenge.tirup.in/",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    stats: {
      peakWpm: "200+",
      feedback: "Real-time",
      layout: "Minimalist",
    },
    details: [
      {
        title: "The Challenge",
        content: "Users want a distraction-free, minimalist environment to practice typing and track their words-per-minute (WPM).",
      },
      {
        title: "The Solution",
        content: "Developed a responsive typing test platform with real-time statistics, customizable durations, and immediate visual feedback.",
      },
    ],
  },
  "discuss": {
    title: "Discuss",
    description: "An AI-moderated group discussion platform where users can engage in debates on any given topic.",
    fullDescription: "Discuss is an innovative platform that brings AI into group discussions. Users provide a topic, and the system facilitates an intelligent, multi-perspective debate, ensuring structured and insightful conversations.",
    liveUrl: "https://discuss.tirup.in",
    techStack: ["OpenAI API", "React", "Socket.io", "Node.js"],
    stats: {
      moderation: "AI-Powered",
      debate: "Multi-persona",
      realtime: "Socket.io",
    },
    details: [
      {
        title: "The Challenge",
        content: "Online discussions often lack structure or diverse viewpoints, easily devolving into echo chambers.",
      },
      {
        title: "The Solution",
        content: "By integrating AI personas into the discussion, Discuss provides balanced arguments and moderates the flow of conversation.",
      },
    ],
  },
  "devgathering": {
    title: "DevGathering",
    description: "A community platform for developers focusing on AI, Cybersecurity, and programming event updates.",
    fullDescription: "DevGathering is the ultimate community hub for developers, tech enthusiasts, and professionals. It provides curated updates, event listings, and networking opportunities in the fields of Artificial Intelligence, Cybersecurity, and general programming.",
    github: "github.com/TirupMehta/DevGathering",
    liveUrl: "https://devgathering.in",
    techStack: ["React", "Next.js", "Firebase", "Tailwind"],
    stats: {
      focus: "AI/Security",
      type: "Open Source",
      reliability: "99.9%",
    },
    details: [
      {
        title: "The Challenge",
        content: "Developers often struggle to find a centralized, high-quality source for relevant tech events and community meetups.",
      },
      {
        title: "The Solution",
        content: "Created DevGathering as a dedicated portal to aggregate event information and connect like-minded tech professionals.",
      },
    ],
  },
  "aperture": {
    title: "Aperture",
    description: "A fun cryptographic challenge featuring custom encryption methods. Decrypt the message to prove your expertise.",
    fullDescription: "Aperture is a unique cryptographic puzzle that challenges users to decrypt messages secured by a custom-built encryption algorithm. Prove your cybersecurity skills, solve the puzzle, and you might win a prize.",
    liveUrl: "https://aperture.tirup.in",
    techStack: ["JavaScript", "Web Crypto API", "Node.js", "Express"],
    stats: {
      difficulty: "Advanced",
      verification: "Instant",
      mode: "Challenge",
    },
    details: [
      {
        title: "The Challenge",
        content: "Creating a cryptographic puzzle that is difficult enough to challenge experts but structured in a way that is fun and engaging.",
      },
      {
        title: "The Solution",
        content: "Developed a proprietary encryption method and packaged it into an interactive web challenge with a verification system.",
      },
    ],
  },
  "startcrypt": {
    title: "StartCrypt",
    description: "A cybersecurity tool for encrypting startup data with military-grade protection.",
    fullDescription: "StartCrypt is a comprehensive encryption solution designed specifically for startups handling sensitive data. It provides military-grade protection using advanced encryption algorithms while maintaining an intuitive user interface.",
    github: "github.com/TirupMehta/StartCrypt",
    techStack: ["AES-256", "JavaScript", "Web Crypto", "Node.js"],
    stats: {
      encryption: "AES-256",
      speed: "Fast",
      type: "Open Source",
    },
    details: [
      {
        title: "The Challenge",
        content: "Startups often handle sensitive data but lack the resources for enterprise-grade security solutions.",
      },
      {
        title: "The Solution",
        content: "Developed a lightweight encryption tool that integrates seamlessly with common startup workflows using AES-256 encryption.",
      },
    ],
  },
  "jarvis": {
    title: "Jarvis",
    description: "Advanced AI-powered personal assistant with desktop system integration for intelligent automation.",
    fullDescription: "Jarvis is an advanced AI-powered personal assistant that tightly integrates with your desktop system to provide a powerful layer of intelligent automation. It combines natural language processing with system-level access.",
    github: "github.com/TirupMehta/jarvis",
    techStack: ["Python", "NLP", "PyQt5", "AI/ML"],
    stats: {
      commands: "Voice/Text",
      type: "Open Source",
      integration: "Native",
    },
    details: [
      {
        title: "The Challenge",
        content: "Modern desktop environments lack intelligent automation that can understand natural language commands and execute system operations.",
      },
      {
        title: "The Solution",
        content: "Jarvis provides a sophisticated AI interface that can understand natural language commands and execute system-level operations.",
      },
    ],
  },
  "localvault": {
    title: "LocalVault",
    description: "Secure, browser-based file storage solution that prioritizes privacy with local IndexedDB storage.",
    fullDescription: "LocalVault is a secure, browser-based file storage solution that prioritizes privacy. It stores your files locally in the browser using IndexedDB—no cloud, no tracking.",
    github: "github.com/TirupMehta/LocalVault",
    techStack: ["IndexedDB", "React", "File API", "CSS Grid"],
    stats: {
      storage: "Local Only",
      type: "Open Source",
      status: "Production",
    },
    details: [
      {
        title: "The Challenge",
        content: "Users need secure file storage without compromising privacy by uploading to cloud services.",
      },
      {
        title: "The Solution",
        content: "LocalVault stores files entirely in the browser using IndexedDB, ensuring complete privacy with no data leaving the device.",
      },
    ],
  },
  "portal": {
    title: "Portal",
    description: "Lightweight Electron app displaying real-time system, browser, and network details with built-in speed test.",
    fullDescription: "Portal System Info is a lightweight Electron app that displays real-time system, browser, and network details in a sleek, dark UI. It features smooth animations and a built-in speed test, with all data collected locally to ensure user privacy.",
    github: "github.com/tirupmehta/Portal",
    techStack: ["Electron", "Node.js", "JavaScript", "System APIs"],
    stats: {
      stars: "2",
      commits: "15",
      type: "Open Source",
    },
    details: [
      {
        title: "The Challenge",
        content: "Users need quick access to comprehensive system information without installing heavy monitoring software or compromising privacy.",
      },
      {
        title: "The Solution",
        content: "Portal provides a lightweight, privacy-focused system monitoring solution with real-time data collection and network speed testing.",
      },
    ],
  },
  "visitorip": {
    title: "VisitorIP",
    description: "Advanced IP tracking and analytics for enterprise security solutions.",
    fullDescription: "VisitorIP is an enterprise-grade security tool that provides real-time IP tracking, analysis, and threat detection. It helps organizations monitor network traffic and identify potential security threats.",
    github: "github.com/TirupMehta/Begins/blob/main/visitorip.html",
    techStack: ["JavaScript", "Particles.js", "PHP", "Fetch API"],
    stats: {
      tracking: "Real-time",
      analysis: "Advanced",
      status: "Active",
    },
    details: [
      {
        title: "The Challenge",
        content: "Enterprise networks face constant security threats from unknown IP addresses and lack real-time visualization of threats.",
      },
      {
        title: "The Solution",
        content: "VisitorIP provides real-time monitoring with advanced analytics and visualization to flag suspicious activity.",
      },
    ],
  },
  "linkharvest": {
    title: "LinkHarvest",
    description: "AI-powered web scraping tool for cybersecurity researchers.",
    fullDescription: "LinkHarvest is an intelligent web scraping tool designed specifically for cybersecurity researchers. It uses AI to identify, collect, and analyze links across the web to discover potential vulnerabilities.",
    github: "github.com/TirupMehta/LinkHarvest",
    techStack: ["JavaScript", "ML Algorithms", "Fetch API", "DOMParser"],
    stats: {
      scraping: "AI-Powered",
      type: "Open Source",
      status: "Active",
    },
    details: [
      {
        title: "The Challenge",
        content: "Cybersecurity researchers need to efficiently collect and analyze large numbers of web links to identify potential vulnerabilities.",
      },
      {
        title: "The Solution",
        content: "LinkHarvest automates the process of discovering and analyzing web links using machine learning algorithms.",
      },
    ],
  },
  "enigmabegins": {
    title: "Enigma Begins",
    description: "Modern cryptography learning platform with interactive challenges.",
    fullDescription: "Enigma Begins is an interactive learning platform focused on modern cryptography. It combines theoretical knowledge with practical challenges to help users understand cryptographic principles.",
    github: "github.com/TirupMehta/Begins/tree/main/projects/enigma-begins",
    techStack: ["HTML5", "CSS3", "JavaScript", "Google Fonts"],
    stats: {
      platform: "Web/Desktop",
      interactivity: "High",
      status: "Active",
    },
    details: [
      {
        title: "The Challenge",
        content: "Cryptography is a complex field that's difficult to learn through traditional methods lacking hands-on practice.",
      },
      {
        title: "The Solution",
        content: "Enigma Begins provides an engaging, interactive learning experience with progressive challenges to build practical skills.",
      },
    ],
  },
}
