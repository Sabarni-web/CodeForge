import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import "./LandingHero.css";

const COMMAND_CYCLES = [
  {
    cmd: "codeforge create my-app --ai",
    lines: [
      "> analyzing prompt...",
      "> generating layout.jsx",
      "> writing styles.css",
      "> build complete ✓",
    ]
  },
  {
    cmd: "codeforge clone starter-kit",
    lines: [
      "> fetching repository...",
      "> resolving dependencies...",
      "> installing packages...",
      "> ready to forge ✓",
    ]
  },
  {
    cmd: "codeforge deploy --prod",
    lines: [
      "> building production bundle...",
      "> uploading assets...",
      "> configuring routing...",
      "> deployed successfully ✓",
    ]
  }
];

const RECENT_REPOS = [
  { name: "ai-dashboard", color: "#f7df1e" }, // JS yellow
  { name: "e-commerce-api", color: "#3178c6" }, // TS blue
  { name: "personal-blog", color: "#e34c26" }, // HTML red
  { name: "finance-tracker", color: "#41b883" }, // Vue green
  { name: "chat-app-realtime", color: "#3178c6" },
  { name: "crypto-wallet", color: "#f7df1e" },
];

export default function LandingHero() {
  const [typed, setTyped] = useState("");
  const [showLines, setShowLines] = useState(0);
  const [forged, setForged] = useState(false);
  const [cycleIndex, setCycleIndex] = useState(0);
  const [reposCount, setReposCount] = useState(2438);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const particlesRef = useRef(null);

  // Parallax tracking
  const handleMouseMove = useCallback((e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 2; // -1 to 1
    const y = (clientY / innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  }, []);

  // Magnetic button effect
  const handleMagneticMove = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  };
  const handleMagneticLeave = (e) => {
    const btn = e.currentTarget;
    btn.style.transform = `translate(0px, 0px)`;
  };

  // Ticking stats
  useEffect(() => {
    const tickTimer = setInterval(() => {
      if (Math.random() > 0.4) {
        setReposCount(prev => prev + Math.floor(Math.random() * 3) + 1);
      }
    }, 3500);
    return () => clearInterval(tickTimer);
  }, []);

  // Terminal typing animation logic
  useEffect(() => {
    let typeTimer;
    let lineTimer;
    let resetTimer;

    const runCycle = () => {
      setTyped("");
      setShowLines(0);
      setForged(false);

      const currentCycle = COMMAND_CYCLES[cycleIndex];
      const cmdStr = currentCycle.cmd;
      let charIdx = 0;

      typeTimer = setInterval(() => {
        charIdx++;
        setTyped(cmdStr.slice(0, charIdx));
        if (charIdx === cmdStr.length) {
          clearInterval(typeTimer);
          
          let lineIdx = 0;
          lineTimer = setInterval(() => {
            lineIdx++;
            setShowLines(lineIdx);
            
            if (lineIdx === currentCycle.lines.length) {
              clearInterval(lineTimer);
              setTimeout(() => setForged(true), 500);
              
              // Reset and move to next cycle after showing preview for a bit
              resetTimer = setTimeout(() => {
                setCycleIndex((prev) => (prev + 1) % COMMAND_CYCLES.length);
              }, 4000);
            }
          }, 380);
        }
      }, 55);
    };

    runCycle();

    return () => {
      clearInterval(typeTimer);
      clearInterval(lineTimer);
      clearTimeout(resetTimer);
    };
  }, [cycleIndex]);

  // Generate ember particles once
  const embers = useRef(
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 7 + Math.random() * 8,
      size: 2 + Math.random() * 4,
    }))
  ).current;

  const currentCycle = COMMAND_CYCLES[cycleIndex];

  return (
    <section 
      className="cf-hero" 
      aria-label="CodeForge introduction"
      onMouseMove={handleMouseMove}
    >
      <div className="cf-noise" aria-hidden="true" />
      
      <div className="cf-hero__bg" aria-hidden="true">
        <div 
          className="cf-orb cf-orb--violet" 
          style={{ transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px) scale(1.1)` }}
        />
        <div 
          className="cf-orb cf-orb--pink" 
          style={{ transform: `translate(${mousePos.x * 12}px, ${mousePos.y * 12}px) scale(1)` }}
        />
        <div 
          className="cf-orb cf-orb--blue" 
          style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px) scale(0.9)` }}
        />
        <div className="cf-grid" />
        <div className="cf-embers" ref={particlesRef}>
          {embers.map((e) => (
            <span
              key={e.id}
              className="cf-ember"
              style={{
                left: `${e.left}%`,
                width: `${e.size}px`,
                height: `${e.size}px`,
                animationDelay: `${e.delay}s`,
                animationDuration: `${e.duration}s`,
              }}
            />
          ))}
        </div>
      </div>

      <nav className="cf-nav">
        <Link to="/" className="cf-nav__brand">
          <span className="cf-nav__mark">{"<>"}</span>
          CodeForge
        </Link>
        <div className="cf-nav__links">
          <Link to="/repos" className="cf-btn cf-btn--ghost">
            Repositories
          </Link>
          <Link to="/ai-generator" className="cf-btn cf-btn--ghost">
            AI Generator
          </Link>
          <Link to="/repos/new" className="cf-btn cf-btn--solid">
            New
          </Link>
        </div>
      </nav>

      <div className="cf-hero__content">
        <div className="cf-content-left">
          <p className="cf-eyebrow">
            <span className="cf-eyebrow__dot" />
            MERN stack · Gemini AI
          </p>

          <h1 className="cf-headline">
            <span className="cf-headline__line cf-reveal cf-reveal--1">
              Where ideas
            </span>
            <span className="cf-headline__line cf-reveal cf-reveal--2">
              become <span className="cf-gradient-text">code</span>.
            </span>
          </h1>

          <p className="cf-sub cf-reveal cf-reveal--3">
            A full-stack GitHub alternative with a built-in AI website
            generator. Push repos, review diffs, and forge entire sites
            from a single prompt.
          </p>

          <div className="cf-cta-row cf-reveal cf-reveal--4">
            <Link 
              to="/repos" 
              className="cf-btn cf-btn--primary magnetic-btn"
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              My repositories
            </Link>
            <Link 
              to="/ai-generator" 
              className="cf-btn cf-btn--secondary magnetic-btn"
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
            >
              Try the AI generator
              <span className="cf-btn__arrow">&rarr;</span>
            </Link>
          </div>

          <div className="cf-stats cf-reveal cf-reveal--5">
            <div className="cf-stat">
              <span className="cf-stat__num cf-stat-tick">{reposCount.toLocaleString()}</span>
              <span className="cf-stat__label">Repos forged</span>
            </div>
            <div className="cf-stat-divider" />
            <div className="cf-stat">
              <span className="cf-stat__num">98%</span>
              <span className="cf-stat__label">Build success</span>
            </div>
            <div className="cf-stat-divider" />
            <div className="cf-stat">
              <span className="cf-stat__num">&lt;30s</span>
              <span className="cf-stat__label">Avg. generation</span>
            </div>
          </div>
          
          <div className="cf-tech-marquee cf-reveal cf-reveal--6">
            <div className="cf-marquee-content">
              <span>React</span><span className="cf-marquee-dot" />
              <span>Node.js</span><span className="cf-marquee-dot" />
              <span>MongoDB</span><span className="cf-marquee-dot" />
              <span>Express</span><span className="cf-marquee-dot" />
              <span>Gemini AI</span><span className="cf-marquee-dot" />
              <span>Tailwind CSS</span><span className="cf-marquee-dot" />
              {/* Duplicate for infinite loop */}
              <span>React</span><span className="cf-marquee-dot" />
              <span>Node.js</span><span className="cf-marquee-dot" />
              <span>MongoDB</span><span className="cf-marquee-dot" />
              <span>Express</span><span className="cf-marquee-dot" />
              <span>Gemini AI</span><span className="cf-marquee-dot" />
              <span>Tailwind CSS</span><span className="cf-marquee-dot" />
            </div>
          </div>
        </div>

        <div className="cf-content-right cf-reveal cf-reveal--6">
          <div className={`cf-terminal cf-tilt-enter ${forged ? "is-forged" : "is-building"}`}>
            <div className="cf-terminal__bar">
              <span className="cf-dot cf-dot--red" />
              <span className="cf-dot cf-dot--yellow" />
              <span className="cf-dot cf-dot--green" />
              <span className="cf-terminal__title">forge.sh</span>
            </div>

            <div className="cf-terminal__body">
              <div className="cf-terminal__row">
                <span className="cf-prompt">$</span>
                <span className="cf-typed">{typed}</span>
                <span className="cf-cursor" aria-hidden="true" />
              </div>
              {currentCycle.lines.slice(0, showLines).map((line, idx) => (
                <div
                  key={idx}
                  className="cf-terminal__line cf-line-in"
                >
                  {line}
                </div>
              ))}
            </div>

            <div className="cf-forged-preview" aria-hidden={!forged}>
              <div className="cf-forged-preview__bar">
                <span className="cf-dot cf-dot--red" />
                <span className="cf-dot cf-dot--yellow" />
                <span className="cf-dot cf-dot--green" />
                <span className="cf-terminal__title">preview: success</span>
              </div>
              <div className="cf-forged-preview__body">
                <div className="cf-fp-nav" />
                <div className="cf-fp-hero">
                  <div className="cf-fp-title" />
                  <div className="cf-fp-sub" />
                  <div className="cf-fp-btn" />
                </div>
              </div>
            </div>

            <div className="cf-spark-burst" aria-hidden="true">
              <span /><span /><span /><span /><span /><span />
            </div>
          </div>
        </div>
      </div>
      
      <div className="cf-recently-forged cf-reveal cf-reveal--6">
        <span className="cf-recently-forged__label">Recently Forged</span>
        <div className="cf-recent-carousel">
          <div className="cf-recent-track">
            {RECENT_REPOS.concat(RECENT_REPOS).map((repo, i) => (
              <div key={i} className="cf-recent-card">
                <svg className="cf-repo-icon" viewBox="0 0 16 16" width="14" height="14">
                  <path fill="currentColor" fillRule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"></path>
                </svg>
                <span className="cf-repo-name">{repo.name}</span>
                <span className="cf-repo-lang" style={{ backgroundColor: repo.color }}></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cf-scroll-cue" aria-hidden="true">
        <span className="cf-scroll-cue__line" />
      </div>
    </section>
  );
}
