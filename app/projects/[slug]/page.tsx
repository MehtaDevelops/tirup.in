"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import InteractiveText from "@/components/interactive-text"
import TextWithBlur from "@/components/text-with-blur"
import { ArrowLeft } from "lucide-react"

// Project data with updated GitHub links
const projectsData = {
  "trace-guard": {
    title: "Trace Guard",
    description: "An advanced, bot-resistant behavioral security engine and NPM package.",
    fullDescription: "Trace Guard is a production-grade behavioral security system designed to detect and block sophisticated AI agents and bots. It operates with zero false positives for human users by analyzing multi-dimensional interaction signals.",
    liveUrl: "https://www.npmjs.com/package/trace-guard",
    details: [
      {
        title: "The Challenge",
        content: "Modern bots and AI scraping agents have become incredibly sophisticated, easily bypassing traditional CAPTCHAs and IP blocks by mimicking human behavior.",
      },
      {
        title: "The Solution",
        content: "Developed a behavioral analysis engine that tracks advanced non-kinematic detection vectors like Event-Loop Clumping and WebGL footprints, successfully separating true human interactions from synthetic bot patterns.",
      },
      {
        title: "Key Features",
        content: "Zero false-positive human tracking, multi-dimensional bot detection, kinematic symmetry analysis, and a perfect supply chain security score.",
      },
      {
        title: "How to Try",
        content: "You can install the package using: npm i trace-guard. Note: This project is currently in the active development phase.",
      },
    ],
  },
  "peace": {
    title: "Peace",
    description: "An AI-powered therapist offering compassionate mental health support in English and Gujarati.",
    fullDescription: "Peace is an AI-powered therapy assistant designed to provide accessible, judgment-free mental health support. Uniquely supporting both English and Gujarati, it brings critical mental health resources to a broader demographic.",
    liveUrl: "https://peace.tirup.in",
    isPrivate: true,
    details: [
      {
        title: "The Challenge",
        content: "Mental health resources are often inaccessible due to cost, stigma, or language barriers, particularly for non-English speakers like the Gujarati community.",
      },
      {
        title: "The Solution",
        content: "Created a conversational AI therapist that is empathetic, culturally aware, and bilingual. It offers a safe space for users to articulate their feelings and receive constructive, supportive feedback.",
      },
      {
        title: "Key Features",
        content: "Bilingual support (English & Gujarati), empathetic NLP conversational flows, privacy-first architecture, and 24/7 accessibility.",
      },
    ],
  },
  "vectorize-ai-api": {
    title: "Vectorize AI API",
    description: "Free AI API service for small companies to integrate powerful AI capabilities into their websites with zero setup.",
    fullDescription: "Vectorize AI API provides a simple, powerful way for small companies to integrate AI capabilities into their websites without complex setup or API key management. Just send a request and get intelligent responses instantly.",
    liveUrl: "https://vectorize.in",
    documentationUrl: "https://github.com/TirupMehta/BeginsAI-v2",
    isPrivate: true,
    details: [
      {
        title: "The Challenge",
        content: "Small companies want to add AI features to their websites but are often overwhelmed by complex API setups, key management, and configuration requirements. Traditional AI APIs require technical expertise that many small businesses lack.",
      },
      {
        title: "The Solution",
        content: "Vectorize AI API eliminates complexity with a proxy service that handles all the technical details. Companies can integrate AI with simple HTTP requests, no API keys or complex configuration required.",
      },
      {
        title: "Key Features",
        content: "Zero-setup integration, automatic key rotation, load balancing, rate limiting, instant usage, and smart routing for optimal performance.",
      },
    ],
  },
  "quott": {
    title: "QUOTT",
    description: "Daily inspiration Android app with hand-picked quotes on life, success, and love—beautifully presented and shareable.",
    fullDescription: "Get inspired every day with QUOTT. Now available as an Android app, discover hand-picked quotes on life, success, love, and more—beautifully presented and easy to share. Simple. Elegant. Uplifting.",
    github: "github.com/TirupMehta/QUOTT",
    liveUrl: "https://quott.tirup.in",
    details: [
      {
        title: "The Challenge",
        content: "People seek daily inspiration but often encounter cluttered quote apps with poor design and intrusive advertising. Quality content deserves quality presentation.",
      },
      {
        title: "The Solution",
        content: "QUOTT curates high-quality quotes and presents them in a clean, elegant interface. The focus is on the content and user experience, making inspiration accessible and shareable across platforms.",
      },
      {
        title: "Technologies Used",
        content: "Android, Java/Kotlin, HTML5, CSS3, JavaScript, Responsive design",
      },
    ],
  },
  "typing-challenge": {
    title: "Typing Challenge",
    description: "A fast-paced typing challenge web application inspired by MonkeyType to test and improve typing speed.",
    fullDescription: "Typing Challenge is a sleek and interactive web application designed to help users test and improve their typing speed and accuracy. Featuring real-time feedback and dynamic tests, it offers a MonkeyType-like experience.",
    liveUrl: "https://typing-challenge.tirup.in/",
    isPrivate: true,
    details: [
      {
        title: "The Challenge",
        content: "Users want a distraction-free, minimalist environment to practice typing, track their words-per-minute (WPM), and identify areas for improvement.",
      },
      {
        title: "The Solution",
        content: "Developed a responsive typing test platform with real-time statistics, customizable durations, and immediate visual feedback for errors and correct keystrokes.",
      },
      {
        title: "Key Features",
        content: "Real-time WPM calculation, accuracy tracking, clean minimalist UI, dynamic text generation.",
      },
    ],
  },
  "discuss": {
    title: "Discuss",
    description: "An AI-moderated group discussion platform where users can engage in debates on any given topic.",
    fullDescription: "Discuss is an innovative platform that brings AI into group discussions. Users provide a topic, and the system facilitates an intelligent, multi-perspective debate, ensuring structured and insightful conversations.",
    liveUrl: "https://discuss.tirup.in",
    isPrivate: true,
    details: [
      {
        title: "The Challenge",
        content: "Online discussions often lack structure or diverse viewpoints, easily devolving into echo chambers or chaotic threads.",
      },
      {
        title: "The Solution",
        content: "By integrating AI personas into the discussion, Discuss provides balanced arguments, moderates the flow of conversation, and introduces thought-provoking angles to the user's chosen topic.",
      },
      {
        title: "Key Features",
        content: "AI-driven personas, real-time topic analysis, structured debate formats, and intuitive chat interfaces.",
      },
    ],
  },
  "devgathering": {
    title: "DevGathering",
    description: "A community platform for developers focusing on AI, Cybersecurity, and programming event updates.",
    fullDescription: "DevGathering is the ultimate community hub for developers, tech enthusiasts, and professionals. It provides curated updates, event listings, and networking opportunities in the fields of Artificial Intelligence, Cybersecurity, and general programming.",
    liveUrl: "https://devgathering.in",
    isPrivate: true,
    details: [
      {
        title: "The Challenge",
        content: "Developers often struggle to find a centralized, high-quality source for relevant tech events, hackathons, and community meetups in fast-moving fields like AI and security.",
      },
      {
        title: "The Solution",
        content: "Created DevGathering as a dedicated portal to aggregate event information, foster community discussions, and connect like-minded tech professionals.",
      },
      {
        title: "Key Features",
        content: "Event aggregator, community forums, tech news feeds, and professional networking tools.",
      },
    ],
  },
  "aperture": {
    title: "Aperture",
    description: "A fun cryptographic challenge featuring custom encryption methods. Decrypt the message to prove your expertise.",
    fullDescription: "Aperture is a unique cryptographic puzzle that challenges users to decrypt messages secured by a custom-built encryption algorithm. Prove your cybersecurity skills, solve the puzzle, and you might win a prize.",
    liveUrl: "https://aperture.tirup.in",
    isPrivate: true,
    details: [
      {
        title: "The Challenge",
        content: "Creating a cryptographic puzzle that is difficult enough to challenge experts but structured in a way that is fun and engaging to solve.",
      },
      {
        title: "The Solution",
        content: "Developed a proprietary encryption method and packaged it into an interactive web challenge, complete with hints and a verification system for successful decryptions.",
      },
      {
        title: "Technologies Used",
        content: "Custom Cryptography, JavaScript, Web Crypto API, interactive UI.",
      },
    ],
  },
  "startcrypt": {
    title: "StartCrypt",
    description: "A cybersecurity tool for encrypting startup data with military-grade protection.",
    fullDescription: "StartCrypt is a comprehensive encryption solution designed specifically for startups handling sensitive data. It provides military-grade protection using advanced encryption algorithms while maintaining an intuitive user interface that doesn't require deep technical knowledge.",
    github: "github.com/TirupMehta/startcrypt",
    details: [
      {
        title: "The Challenge",
        content: "Startups often handle sensitive data but lack the resources for enterprise-grade security solutions. StartCrypt addresses this gap by providing affordable, accessible encryption that doesn't compromise on security.",
      },
      {
        title: "The Solution",
        content: "I developed a lightweight encryption tool that integrates seamlessly with common startup workflows. The system uses AES-256 encryption with a user-friendly interface that makes security accessible to non-technical team members.",
      },
      {
        title: "Technologies Used",
        content: "HTML5, CSS3, JavaScript (ES6), Google Fonts API (Roboto), Caesar cipher, base64",
      },
    ],
  },
  "jarvis": {
    title: "Jarvis",
    description: "Advanced AI-powered personal assistant with desktop system integration for intelligent automation.",
    fullDescription: "Jarvis is an advanced AI-powered personal assistant that tightly integrates with your desktop system to provide a powerful layer of intelligent automation. It combines natural language processing with system-level access to create a truly intelligent desktop companion.",
    github: "github.com/TirupMehta/jarvis",
    details: [
      {
        title: "The Challenge",
        content: "Modern desktop environments lack intelligent automation that can understand natural language commands and execute complex system operations. Users need a more intuitive way to interact with their computers.",
      },
      {
        title: "The Solution",
        content: "Jarvis provides a sophisticated AI interface that can understand natural language commands and execute system-level operations. It bridges the gap between human communication and computer functionality.",
      },
      {
        title: "Technologies Used",
        content: "Python, Natural Language Processing, System APIs, Desktop Integration, AI/ML frameworks",
      },
    ],
  },
  "localvault": {
    title: "LocalVault",
    description: "Secure, browser-based file storage solution that prioritizes privacy with local IndexedDB storage.",
    fullDescription: "LocalVault is a secure, browser-based file storage solution that prioritizes privacy. It stores your files locally in the browser using IndexedDB—no cloud, no tracking. With a clean and modern interface, you can upload, manage, and preview files effortlessly.",
    github: "github.com/TirupMehta/LocalVault",
    details: [
      {
        title: "The Challenge",
        content: "Users need secure file storage without compromising privacy by uploading to cloud services. Traditional solutions often require account creation and expose data to third parties.",
      },
      {
        title: "The Solution",
        content: "LocalVault stores files entirely in the browser using IndexedDB, ensuring complete privacy. No data leaves the user's device, providing security without sacrificing functionality.",
      },
      {
        title: "Technologies Used",
        content: "HTML5, CSS3, JavaScript (ES6), IndexedDB API, File API, Modern browser technologies",
      },
    ],
  },
  "portal": {
    title: "Portal",
    description: "Lightweight Electron app displaying real-time system, browser, and network details with built-in speed test.",
    fullDescription: "Portal System Info is a lightweight Electron app that displays real-time system, browser, and network details in a sleek, dark UI. It features smooth animations, a responsive card layout, and includes a built-in speed test. All data is collected locally to ensure user privacy.",
    github: "github.com/TirupMehta/Portal",
    details: [
      {
        title: "The Challenge",
        content: "System administrators and power users need quick access to comprehensive system information without installing heavy monitoring software or compromising privacy.",
      },
      {
        title: "The Solution",
        content: "Portal provides a lightweight, privacy-focused system monitoring solution with real-time data collection, network speed testing, and an intuitive interface—all while keeping data local.",
      },
      {
        title: "Technologies Used",
        content: "Electron, Node.js, HTML5, CSS3, JavaScript, System APIs, Network monitoring",
      },
    ],
  },
  "visitorip": {
    title: "VisitorIP",
    description: "Advanced IP tracking and analytics for enterprise security solutions.",
    fullDescription: "VisitorIP is an enterprise-grade security tool that provides real-time IP tracking, analysis, and threat detection. It helps organizations monitor network traffic, identify potential security threats, and protect their digital assets.",
    github: "github.com/TirupMehta/Begins/blob/main/visitorip.html",
    details: [
      {
        title: "The Challenge",
        content: "Enterprise networks face constant security threats from unknown IP addresses. Traditional solutions often lack real-time capabilities and intuitive visualization of potential threats.",
      },
      {
        title: "The Solution",
        content: "VisitorIP provides real-time monitoring with advanced analytics and visualization. The system automatically flags suspicious activity and provides actionable intelligence for security teams.",
      },
      {
        title: "Technologies Used",
        content: "HTML5, CSS3, JavaScript (ES6), Google Fonts API (Inter), Particles.js, Fetch API, PHP (server-side)",
      },
    ],
  },
  "linkharvest": {
    title: "LinkHarvest",
    description: "AI-powered web scraping tool for cybersecurity researchers.",
    fullDescription: "LinkHarvest is an intelligent web scraping tool designed specifically for cybersecurity researchers. It uses AI to identify, collect, and analyze links across the web, helping researchers discover potential vulnerabilities and security threats.",
    github: "github.com/TirupMehta/linkharvest",
    details: [
      {
        title: "The Challenge",
        content: "Cybersecurity researchers need to efficiently collect and analyze large numbers of web links to identify potential vulnerabilities, but manual collection is time-consuming and error-prone.",
      },
      {
        title: "The Solution",
        content: "LinkHarvest automates the process of discovering, categorizing, and analyzing web links using machine learning algorithms. It provides researchers with a powerful tool to uncover hidden connections and potential security issues.",
      },
      {
        title: "Technologies Used",
        content: "HTML5, CSS3, JavaScript (ES6), Google Fonts API (Inter), JetBrains Mono, Fetch API, DOMParser, AllOrigins API",
      },
    ],
  },
  "cyberdesk": {
    title: "CyberDesk",
    description: "All-in-one dashboard for monitoring network security threats in real-time.",
    fullDescription: "CyberDesk is a comprehensive security monitoring dashboard that provides real-time visibility into network threats and vulnerabilities. It consolidates data from multiple security tools into a single, intuitive interface.",
    github: "github.com/TirupMehta/Begins/tree/main/projects/cyberdesk",
    details: [
      {
        title: "The Challenge",
        content: "Security teams often struggle with tool sprawl, monitoring multiple dashboards and interfaces to maintain network security. This fragmentation leads to inefficiency and potential blind spots.",
      },
      {
        title: "The Solution",
        content: "CyberDesk integrates data from various security tools into a unified dashboard, providing real-time threat intelligence, vulnerability assessments, and actionable insights in one place.",
      },
      {
        title: "Technologies Used",
        content: "HTML5, CSS3, JavaScript (ES6), DOM manipulation, Event handling",
      },
    ],
  },
  "enigmabegins": {
    title: "Enigma Begins",
    description: "Modern cryptography learning platform with interactive challenges.",
    fullDescription: "Enigma Begins is an interactive learning platform focused on modern cryptography. It combines theoretical knowledge with practical challenges to help users understand and apply cryptographic principles.",
    github: "github.com/TirupMehta/Begins/tree/main/projects/enigma-begins",
    details: [
      {
        title: "The Challenge",
        content: "Cryptography is a complex field that's difficult to learn through traditional methods. Existing resources often lack the hands-on practice needed to truly understand cryptographic concepts.",
      },
      {
        title: "The Solution",
        content: "Enigma Begins provides an engaging, interactive learning experience with progressive challenges that build practical cryptography skills. Users can experiment with different algorithms and see real-time results.",
      },
      {
        title: "Technologies Used",
        content: "HTML5, CSS3, ES6 JavaScript, Google Fonts API (Inter), LocalStorage API, DOM API, EventTarget API",
      },
    ],
  },
}

export default function ProjectPage() {
  const { slug } = useParams()
  const [project, setProject] = useState<any>(null)
  const [nextProject, setNextProject] = useState<any>(null)
  const [nextSlug, setNextSlug] = useState<string>("")

  // Improve scroll smoothness
  useEffect(() => {
    // Add smooth scrolling with higher quality
    document.documentElement.style.scrollBehavior = "smooth"

    return () => {
      document.documentElement.style.scrollBehavior = ""
    }
  }, [])

  // Get project data based on slug
  useEffect(() => {
    if (slug) {
      const projectSlug = Array.isArray(slug) ? slug[0] : slug
      const foundProject = projectsData[projectSlug as keyof typeof projectsData]
      setProject(foundProject)

      // Determine next project
      const projectKeys = Object.keys(projectsData)
      const currentIndex = projectKeys.indexOf(projectSlug)
      const nextIndex = (currentIndex + 1) % projectKeys.length
      setNextSlug(projectKeys[nextIndex])
      setNextProject(projectsData[projectKeys[nextIndex] as keyof typeof projectsData])
    }
  }, [slug])

  // Loading state
  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-black/50">Loading...</p>
      </div>
    )
  }

  return (
    <main className="relative min-h-screen">
      {/* Back button */}
      <div className="fixed top-8 left-8 z-50">
        <TextWithBlur>
          <Link href="/" className="flex items-center text-sm text-black/70 hover:text-accent transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Link>
        </TextWithBlur>
      </div>

      {/* Hero Section */}
      <section className="section min-h-screen flex flex-col justify-center px-6 md:px-20 py-20">
        <div className="max-w-5xl mx-auto">
          <InteractiveText className="text-6xl md:text-7xl font-light tracking-tight mb-8">
            {project.title}
          </InteractiveText>
          <TextWithBlur>
            <p className="text-xl md:text-2xl font-light text-black/70 max-w-3xl mb-6">{project.fullDescription}</p>
          </TextWithBlur>
          <TextWithBlur>
            <div className="flex flex-wrap gap-4">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm font-light text-black/80 pb-1 link-hover"
                >
                  View Live Demo
                </a>
              )}
              {project.github && !project.isPrivate && (
                <a
                  href={`https://${project.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm font-light text-black/80 pb-1 link-hover"
                >
                  View Source on GitHub
                </a>
              )}
              {project.documentationUrl && (
                <a
                  href={project.documentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm font-light text-black/80 pb-1 link-hover"
                >
                  View Documentation
                </a>
              )}
            </div>
          </TextWithBlur>
        </div>
      </section>

      {/* Project Details */}
      <section className="section px-6 md:px-20 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {project.details.map((detail: any, index: number) => (
              <TextWithBlur key={index} delay={index * 100}>
                <div className="space-y-4 card-hover p-8 border border-black/5 rounded-sm">
                  <InteractiveText className="text-2xl font-light">{detail.title}</InteractiveText>
                  <p className="text-lg font-light text-black/70 leading-relaxed">{detail.content}</p>
                </div>
              </TextWithBlur>
            ))}
          </div>
        </div>
      </section>

      {/* Next Project */}
      <section className="section min-h-screen flex flex-col justify-center items-center px-6 md:px-20 py-20">
        <InteractiveText className="text-4xl md:text-5xl font-light tracking-tight mb-6 text-center">
          Next Project
        </InteractiveText>
        <TextWithBlur>
          <p className="text-xl font-light text-center max-w-2xl text-black/70 mb-12">Continue exploring my work</p>
        </TextWithBlur>

        {nextProject && (
          <TextWithBlur>
            <Link
              href={`/projects/${nextSlug}`}
              className="group flex flex-col items-center p-8 border border-black/5 rounded-sm card-hover"
            >
              <span className="text-2xl font-light group-hover:text-accent transition-colors">{nextProject.title}</span>
              <span className="text-sm text-black/50 mt-2">{nextProject.description}</span>
            </Link>
          </TextWithBlur>
        )}
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 text-center border-t border-black/10">
        <p className="text-black/50">© {new Date().getFullYear()} Tirup Mehta. All rights reserved.</p>
      </footer>
    </main>
  )
}
