import React, { useState, useEffect } from "react";
import Aurora from "../components/Aurora";
import ContactSection from "../components/ContactSection";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
  onGetStarted: () => void;
  onLoadDemo: () => void;
}

export default function LandingPage({ onGetStarted, onLoadDemo }: LandingPageProps) {
  const [activeRole, setActiveRole] = useState<"engineers" | "scientists" | "mlops" | "compliance">("engineers");

  useEffect(() => {
    // Only animate on screen sizes where desktop absolute layout is visible
    if (window.innerWidth < 1024) return;

    // Card 1: Top-Left (Initial: shifted right/down. Final: shifted left/up - prolonging)
    gsap.fromTo(".collage-card-1",
      { x: 50, y: 30, opacity: 0.9 },
      {
        x: -70,
        y: -50,
        opacity: 1,
        scrollTrigger: {
          trigger: "#collage-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      }
    );

    // Card 2: Top-Right (Initial: shifted left/down. Final: shifted right/up - prolonging)
    gsap.fromTo(".collage-card-2",
      { x: -50, y: 30, opacity: 0.9 },
      {
        x: 70,
        y: -50,
        opacity: 1,
        scrollTrigger: {
          trigger: "#collage-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      }
    );

    // Card 3: Left-Middle (Initial: shifted right/down. Final: shifted left/up - prolonging)
    gsap.fromTo(".collage-card-3",
      { x: 60, y: 20, opacity: 0.9 },
      {
        x: -90,
        y: -40,
        opacity: 1,
        scrollTrigger: {
          trigger: "#collage-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      }
    );

    // Card 4: Right-Middle (Initial: shifted left/down. Final: shifted right/up - prolonging)
    gsap.fromTo(".collage-card-4",
      { x: -60, y: 20, opacity: 0.9 },
      {
        x: 90,
        y: -40,
        opacity: 1,
        scrollTrigger: {
          trigger: "#collage-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      }
    );

    // Card 5: Center-Lower (Initial: shifted up. Final: shifted down - prolonging)
    gsap.fromTo(".collage-card-5",
      { y: -40, opacity: 0.9 },
      {
        y: 80,
        opacity: 1,
        scrollTrigger: {
          trigger: "#collage-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      }
    );

    // Card 6: Comment bubble (Initial: shifted up/left. Final: shifted down/right - prolonging)
    gsap.fromTo(".collage-card-6",
      { y: -30, x: -10, opacity: 0.9 },
      {
        y: 60,
        x: 20,
        opacity: 1,
        scrollTrigger: {
          trigger: "#collage-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      }
    );

    // Card 7: Bottom-Left (Initial: shifted right/up. Final: shifted left/down - prolonging)
    gsap.fromTo(".collage-card-7",
      { x: 50, y: -40, opacity: 0.9 },
      {
        x: -80,
        y: 80,
        opacity: 1,
        scrollTrigger: {
          trigger: "#collage-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      }
    );

    // Card 8: Bottom-Right (Initial: shifted left/up. Final: shifted right/down - prolonging)
    gsap.fromTo(".collage-card-8",
      { x: -50, y: -40, opacity: 0.9 },
      {
        x: 80,
        y: 80,
        opacity: 1,
        scrollTrigger: {
          trigger: "#collage-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      }
    );

    // Latest Updates Section: header fade-slide in
    gsap.fromTo(".updates-header",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#updates-section",
          start: "top 85%"
        }
      }
    );

    // Latest Updates Section: cards slide-in stagger
    gsap.fromTo(".update-card",
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: "#updates-section",
          start: "top 80%"
        }
      }
    );
  }, []);



  return (
    <div className="text-text font-body-lg min-h-screen antialiased selection:bg-black selection:text-white bg-page-bg relative overflow-x-hidden">
      
      {/* Dynamic WebGL Aurora backdrop glow */}
      <div className="absolute inset-x-0 top-0 h-[1100px] z-0 pointer-events-none opacity-30 overflow-hidden">
        <Aurora
          colorStops={["#7cff67", "#B497CF", "#5227FF"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-page-bg/40 to-page-bg backdrop-blur-[60px]" />
      </div>


      <main>
        {/* 2. Hero Section */}
        <section className="pt-[120px] lg:pt-[240px] px-4 sm:px-margin max-w-[1728px] mx-auto flex flex-col items-center text-center relative overflow-visible bg-page-bg h-auto min-h-screen py-12 lg:h-[1100px]">
          <h1 className="font-display text-3xl sm:text-5xl lg:text-display text-balance max-w-4xl mb-lg text-text tracking-tighter">
            Bring every dataset into focus
          </h1>
          <p className="font-body-lg text-sm sm:text-lg lg:text-body-lg text-muted max-w-2xl mb-lg block">
            Decode your raw dataset anomalies. Bring absolute clarity and schema readiness to your enterprise data assets with a platform designed for local-first precision.
          </p>
          <button 
            onClick={onGetStarted}
            className="bg-black text-page-bg font-label text-label px-8 py-4 rounded-full hover:bg-black/90 transition-opacity mb-[40px] lg:mb-[80px]"
          >
            Get started
          </button>
          
          {/* Main Visual mock frame */}
          <div className="w-full max-w-[1492px] bg-panel-bg overflow-hidden shadow-2xl relative z-10 rounded-[40px] h-[250px] sm:h-[400px] md:h-[550px] lg:h-[800px] border border-line/20">
            <img 
              alt="Vibrant abstract gradient" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZfadtPwCaL7GcKGqde5_m46RsgQuGHyvmFJKZWsW5jfFqnNirmZPOdmGitXGSosoyvd2ARpUMWjjL8IEKefG6Ke85eAGiFMBHIfFA02wVwfcf75CnI7Zlw-OjEat9LRRuqHbfAWLeBZeTEUbVQRAoPIjSlWUOZmW8R32Bk0XUblejaVIpv6gSC4cngTCtp7tXSmIz5jJIUVZIPoKSyGDhck_ulpZZnIfCQmxw2h73JqSgD__x2T1wiMf4Q_TQCvHgDTzQ3sY3JjqV" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </section>

        {/* 3. Trust Strip (Ticker) */}
        <section className="py-8 lg:py-xl px-4 sm:px-margin border-t border-line/30 max-w-[1728px] mx-auto flex flex-col items-center bg-page-bg relative z-0 pt-[40px]">
          <p className="font-label text-label text-muted mb-md uppercase tracking-widest text-center">
            Built for modern data architecture
          </p>
          <div className="flex justify-center items-center opacity-[0.72] text-muted-light w-full">
            <div className="marquee-container">
              <div className="marquee-content flex gap-[100px] items-center text-muted-light">
                <span className="font-h3 text-h3 font-semibold tracking-tight opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-default">Databricks</span>
                <span className="font-h3 text-h3 font-semibold tracking-tight opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-default">Snowflake</span>
                <span className="font-h3 text-h3 font-semibold tracking-tight opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-default">dbt Labs</span>
                <span className="font-h3 text-h3 font-semibold tracking-tight opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-default">Fivetran</span>
                <span className="font-h3 text-h3 font-semibold tracking-tight opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-default">Apache Spark</span>
                
                {/* Duplicate for seamless loop */}
                <span className="font-h3 text-h3 font-semibold tracking-tight opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-default">Databricks</span>
                <span className="font-h3 text-h3 font-semibold tracking-tight opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-default">Snowflake</span>
                <span className="font-h3 text-h3 font-semibold tracking-tight opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-default">dbt Labs</span>
                <span className="font-h3 text-h3 font-semibold tracking-tight opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-default">Fivetran</span>
                <span className="font-h3 text-h3 font-semibold tracking-tight opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-default">Apache Spark</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Floating Visual Collage */}
        <section id="collage-section" className="min-h-auto lg:min-h-[1400px] w-full max-w-[1728px] mx-auto relative overflow-visible bg-page-bg py-8 lg:py-xl">
          
          {/* Mobile & Tablet Layout (below lg) */}
          <div className="lg:hidden flex flex-col items-center gap-8 px-4 sm:px-margin">
            {/* Central Anchor */}
            <h2 className="font-display text-[48px] sm:text-[64px] font-bold text-text tracking-tighter leading-[0.9] text-center">
              Data<br/>Readiness
            </h2>
            
            {/* Grid of cards */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              {/* 1. Top-left card */}
              <div className="rounded-[24px] overflow-hidden bg-panel-bg shadow-lg border border-line/10 h-[210px]">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGxwLNMP2KVAWtuqvWXiFZkBm5YgSXjM45PkkRPvB3NsuAPX4Nse6nAySmOSPxXiaWvlTk0fB0Pagx0EkNf1L8x3CFyxgAWpQbdP2z4ZXhaiVorAeLCKBcI2qvs9oG9HqdMdiJrUYvBgL1Dr8nKNzygffqFMIlgWyshucf41s65I_hV3kCGtjFYShml4zOn9O6MuvVW54WVcjP7bBLEAYguBfutmc0Yq73HP9-yBiY6b98be0hC6KYAZFesHH3FkL4Gx0Yks2fyrpu" 
                  alt="Telemetry graph mockup"
                />
              </div>
              
              {/* 2. Top-right card */}
              <div className="rounded-[24px] overflow-hidden bg-panel-bg shadow-lg border border-line/10 h-[210px]">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRI6ZfedfqJ42Kz8fkZTlqC5CbQ5Q_0kVkLxIu7Xh8-ABjTl2K4v_yJEBQE1wi3AZMYD9IMvFxFOJyc86piFVAfQ0g6nyc1fRoYl7wB1_YDB3zlrCqOGtEow28qlTRV6LL9s1-rRPvAYojJgQhjJ9ERQ7Jf-IhHeg0bAcA4QWd3YKyDnVxSjTGeJ--ir7xqCghMtZPJ5OjvBwWSTiw7xPHbFrwOa_f5RTQGV6WOEWxuC-xwV7Ayb1q0kBzYF_oQHCxP3Dn3PL-aewa" 
                  alt="Data matrix layout mockup"
                />
              </div>
              
              {/* 3. Left-middle card */}
              <div className="rounded-[24px] overflow-hidden bg-panel-bg shadow-lg border border-line/10 h-[200px] relative">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCI3qPhz21Acw0AbNlBUPm0zvO8i2YhSwVSCeymxT8B-DK9LFeue5NmI6rZOMlmi63aYlpF6sctE4Z6nVQyKbzDNPzBxfmlYqn2sWwM4Ny41RsY8lWjp6XZq3EQaQ9OBTiCr79ffpaxFDfCaLYUR_NhJjMvSs6pgYKjdGmA9O9HWagTsoARXVgOdEH9uqNqZ5TYj0Y8BD5hIPyCHuYCQjYIaw57IB3NGZEOsWhia-h5PqmPglOurG6z4WNi6G5lFjSulfIHvqLLGmVd" 
                  alt="Database schema table visual"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-line/30">
                  <span className="font-label text-xs font-semibold text-text">Schema Constraints</span>
                </div>
              </div>
              
              {/* 4. Right-middle card */}
              <div className="rounded-[24px] overflow-hidden bg-panel-bg shadow-lg border border-line/10 h-[210px]">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRd7pAyBrUx31zx6klyDiCWD04EiIaiDfNYNdGO8HozSTYH3bTc4IhWoBbOh4CpW4jAmMk2H_ecdJwzZL71ta4NvHIyMqapKo2BK36h0hn674xlIS0FoLhl6jQwDTwu_Idk9ZLj6MN8k5s-VrWMSox9J5YNpnlpqVlAVnzCXtAeDkwyvNWzXtGXt76wUk85CfXUmdE9Vi6RxqxkyBORzc1__OdpVEqiYNrMD1dKFJIU7gC874F--k_Kf5C1_yMSnhoytWkS9XWPwsm" 
                  alt="Quality metrics chart"
                />
              </div>
              
              {/* 5. Center-lower card & AI correction box */}
              <div className="rounded-[24px] overflow-hidden bg-panel-bg shadow-lg border border-line/10 h-[210px] relative">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1JNPrOdnXlUzdJF3xsLHezyvtNiP-I2bNeN_ZmsjulJHHaMG8LFiwvg-ClLM09DHJPdktxAX9r8PlmDv2NT_xVXzDoCYQba-d-TPIUmGe_PnNytjbr2Z4jVDeLoGmqiYo2PI1blrti6KE4pK6yB_4qWY7eZNwxowZQz_0BTlcMJHpztmUsLT2F9XkjhbDv25Q8Ag077NWSsE93fCPUqdP7LhQkrTUTIBa6EQb3Eu3idHTuhFW2qbca7jUO2GLP6aa7Pauo0aJi8Ef" 
                  alt="Data mapping visualization"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-xl flex items-center gap-2.5 px-3 py-2 border border-white/50 shadow-md">
                  <div className="w-6 h-6 rounded-full bg-soft-card overflow-hidden shrink-0">
                    <img 
                      className="w-full h-full object-cover" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxUZpAK7kBAK1H5Anlz-i_nh19XyaGUt1hLDC6ZASnuBK2vRcwFDP46vx7HodMWCGvWJVA3aKLfp00pDRGNPsH0LVYvOGBSQ1KJIx2wTCxFcEJMNlnv9DHJKT0wyVelxRunXJN3d41Z2MPDK4poxQF_iybQaYL4ebVjC52RWnq9U6Y-VA7k5seZ7Z4c1n3nq7ply6CwSNm8-OH_B6wae1-h-Zmn2y3jh9urDyal2zhahuy408MHHCcPTmA9TNKUOA7WEsjuEy1iMvC" 
                      alt="AI bot avatar"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-label text-[8px] text-text font-bold leading-none">db_admin</span>
                    <span className="font-body-md text-[11px] text-muted leading-tight mt-0.5">zero anomalies! 1h</span>
                  </div>
                </div>
              </div>
              
              {/* 7. Bottom-left card */}
              <div className="rounded-[24px] overflow-hidden bg-panel-bg shadow-lg border border-line/10 h-[200px] relative">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJHfj4_xGj0yuLj8FKt6X72bCIskF-kJl3LA3T3_1-Qfv6mfKwCLXqKuU41nv1J3p_M1VLaKyUwt7jymaxu9IqrMBeOZwhDvKB2NclDw7qctzcy_CAPxlD6DRpxJ5uMf6G4nCRrvnMp59n2r2y9HaRxoemHYv9Vm4p_TMdRUwKitMvWXTR13rOY5umPLmIVd6L5RMbQMm1ZFC8-WMQdUrzWugK5J4Eh0Ph9XOn2e4G84KG4Az4KXAh3-n2Y52A1ycQ8Ow3OGXHosuz" 
                  alt="Data profile statistics"
                />
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-line/30">
                  <span className="font-label text-xs font-semibold text-text">Data Profile</span>
                </div>
              </div>
              
              {/* 8. Bottom-right card */}
              <div className="rounded-[24px] overflow-hidden bg-panel-bg shadow-lg border border-line/10 h-[210px] sm:col-span-2">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbheL8VQt2V3qxmEXBukkZcNptuzepd42MEKEg9-qDVlpepWCcPZIR5s9MzcSFv4FH-6IuiF9uWjjxSWg2IQ-A_CdbSU7IbdGFdbRPcFqz1DyoSSA1w-kOaLoqdLsFYVQuBBDENJ0aa2OHfgIFFJ1Y7GClriULppWYz7d7fGuv-GPC_YjW-mQfwtuP1rbtxhAb-IzFfX6o7nj41jI_XdcVGj6on-6bwuQl_W5NMa4g3MvEW_sVCeo4Tgf1W3QkrnYFQKfSyl3ScLps" 
                  alt="Clean data lineage graph flow"
                />
              </div>
            </div>
          </div>

          {/* Desktop Layout (lg and above) */}
          <div className="hidden lg:block absolute inset-0 w-full h-full">
            {/* Central Anchor */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <h2 className="font-display text-[120px] font-bold text-text tracking-tighter leading-[0.9] text-center">
                Data<br/>Readiness
              </h2>
            </div>
            
            {/* 1. Top-left card */}
            <div className="collage-card collage-card-1 absolute rounded-[24px] overflow-hidden bg-panel-bg shadow-xl border border-line/10" style={{ left: "8%", top: "5%", width: "270px", height: "210px" }}>
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGxwLNMP2KVAWtuqvWXiFZkBm5YgSXjM45PkkRPvB3NsuAPX4Nse6nAySmOSPxXiaWvlTk0fB0Pagx0EkNf1L8x3CFyxgAWpQbdP2z4ZXhaiVorAeLCKBcI2qvs9oG9HqdMdiJrUYvBgL1Dr8nKNzygffqFMIlgWyshucf41s65I_hV3kCGtjFYShml4zOn9O6MuvVW54WVcjP7bBLEAYguBfutmc0Yq73HP9-yBiY6b98be0hC6KYAZFesHH3FkL4Gx0Yks2fyrpu" 
                alt="Telemetry graph mockup"
              />
            </div>
            
            {/* 2. Top-right card */}
            <div className="collage-card collage-card-2 absolute rounded-[24px] overflow-hidden bg-panel-bg shadow-xl border border-line/10" style={{ right: "8%", top: "2%", width: "290px", height: "260px" }}>
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRI6ZfedfqJ42Kz8fkZTlqC5CbQ5Q_0kVkLxIu7Xh8-ABjTl2K4v_yJEBQE1wi3AZMYD9IMvFxFOJyc86piFVAfQ0g6nyc1fRoYl7wB1_YDB3zlrCqOGtEow28qlTRV6LL9s1-rRPvAYojJgQhjJ9ERQ7Jf-IhHeg0bAcA4QWd3YKyDnVxSjTGeJ--ir7xqCghMtZPJ5OjvBwWSTiw7xPHbFrwOa_f5RTQGV6WOEWxuC-xwV7Ayb1q0kBzYF_oQHCxP3Dn3PL-aewa" 
                alt="Data matrix layout mockup"
              />
            </div>
            
            {/* 3. Left-middle card */}
            <div className="collage-card collage-card-3 absolute rounded-[24px] overflow-hidden bg-panel-bg shadow-xl border border-line/10" style={{ left: "5%", top: "35%", width: "330px", height: "200px" }}>
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCI3qPhz21Acw0AbNlBUPm0zvO8i2YhSwVSCeymxT8B-DK9LFeue5NmI6rZOMlmi63aYlpF6sctE4Z6nVQyKbzDNPzBxfmlYqn2sWwM4Ny41RsY8lWjp6XZq3EQaQ9OBTiCr79ffpaxFDfCaLYUR_NhJjMvSs6pgYKjdGmA9O9HWagTsoARXVgOdEH9uqNqZ5TYj0Y8BD5hIPyCHuYCQjYIaw57IB3NGZEOsWhia-h5PqmPglOurG6z4WNi6G5lFjSulfIHvqLLGmVd" 
                alt="Database schema table visual"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-line/30">
                <span className="font-label text-xs font-semibold text-text">Schema Constraints</span>
              </div>
            </div>
            
            {/* 4. Right-middle card */}
            <div className="collage-card collage-card-4 absolute rounded-[24px] overflow-hidden bg-panel-bg shadow-xl border border-line/10" style={{ right: "2%", top: "25%", width: "250px", height: "330px" }}>
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRd7pAyBrUx31zx6klyDiCWD04EiIaiDfNYNdGO8HozSTYH3bTc4IhWoBbOh4CpW4jAmMk2H_ecdJwzZL71ta4NvHIyMqapKo2BK36h0hn674xlIS0FoLhl6jQwDTwu_Idk9ZLj6MN8k5s-VrWMSox9J5YNpnlpqVlAVnzCXtAeDkwyvNWzXtGXt76wUk85CfXUmdE9Vi6RxqxkyBORzc1__OdpVEqiYNrMD1dKFJIU7gC874F--k_Kf5C1_yMSnhoytWkS9XWPwsm" 
                alt="Quality metrics chart"
              />
            </div>
            
            {/* 5. Center-lower card */}
            <div className="collage-card collage-card-5 absolute rounded-[24px] overflow-hidden bg-black z-0 shadow-2xl border border-line/10" style={{ left: "55%", top: "70%", width: "370px", height: "250px" }}>
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1JNPrOdnXlUzdJF3xsLHezyvtNiP-I2bNeN_ZmsjulJHHaMG8LFiwvg-ClLM09DHJPdktxAX9r8PlmDv2NT_xVXzDoCYQba-d-TPIUmGe_PnNytjbr2Z4jVDeLoGmqiYo2PI1blrti6KE4pK6yB_4qWY7eZNwxowZQz_0BTlcMJHpztmUsLT2F9XkjhbDv25Q8Ag077NWSsE93fCPUqdP7LhQkrTUTIBa6EQb3Eu3idHTuhFW2qbca7jUO2GLP6aa7Pauo0aJi8Ef" 
                alt="Data mapping visualization"
              />
            </div>
            
            {/* 6. Floating Comment (AI correction box) */}
            <div className="collage-card collage-card-6 absolute bg-white/80 backdrop-blur-lg rounded-full flex items-center gap-3 px-4 py-3 shadow-lg border border-white/50 z-20" style={{ left: "35%", top: "78%", width: "305px", height: "62px" }}>
              <div className="w-8 h-8 rounded-full bg-soft-card overflow-hidden">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxUZpAK7kBAK1H5Anlz-i_nh19XyaGUt1hLDC6ZASnuBK2vRcwFDP46vx7HodMWCGvWJVA3aKLfp00pDRGNPsH0LVYvOGBSQ1KJIx2wTCxFcEJMNlnv9DHJKT0wyVelxRunXJN3d41Z2MPDK4poxQF_iybQaYL4ebVjC52RWnq9U6Y-VA7k5seZ7Z4c1n3nq7ply6CwSNm8-OH_B6wae1-h-Zmn2y3jh9urDyal2zhahuy408MHHCcPTmA9TNKUOA7WEsjuEy1iMvC" 
                  alt="AI bot avatar"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-label text-[10px] text-text font-bold">db_admin</span>
                <span className="font-body-md text-[13px] text-muted leading-tight">zero anomalies detected! 1h</span>
              </div>
            </div>
            
            {/* 7. Bottom-left card */}
            <div className="collage-card collage-card-7 absolute rounded-[24px] overflow-hidden bg-panel-bg shadow-xl border border-line/10" style={{ left: "4%", top: "75%", width: "340px", height: "250px" }}>
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJHfj4_xGj0yuLj8FKt6X72bCIskF-kJl3LA3T3_1-Qfv6mfKwCLXqKuU41nv1J3p_M1VLaKyUwt7jymaxu9IqrMBeOZwhDvKB2NclDw7qctzcy_CAPxlD6DRpxJ5uMf6G4nCRrvnMp59n2r2y9HaRxoemHYv9Vm4p_TMdRUwKitMvWXTR13rOY5umPLmIVd6L5RMbQMm1ZFC8-WMQdUrzWugK5J4Eh0Ph9XOn2e4G84KG4Az4KXAh3-n2Y52A1ycQ8Ow3OGXHosuz" 
                alt="Data profile statistics"
              />
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-line/30">
                <span className="font-label text-xs font-semibold text-text">Data Profile</span>
              </div>
            </div>
            
            {/* 8. Bottom-right card */}
            <div className="collage-card collage-card-8 absolute rounded-[24px] overflow-hidden bg-panel-bg shadow-xl border border-line/10" style={{ right: "5%", top: "72%", width: "410px", height: "300px" }}>
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbheL8VQt2V3qxmEXBukkZcNptuzepd42MEKEg9-qDVlpepWCcPZIR5s9MzcSFv4FH-6IuiF9uWjjxSWg2IQ-A_CdbSU7IbdGFdbRPcFqz1DyoSSA1w-kOaLoqdLsFYVQuBBDENJ0aa2OHfgIFFJ1Y7GClriULppWYz7d7fGuv-GPC_YjW-mQfwtuP1rbtxhAb-IzFfX6o7nj41jI_XdcVGj6on-6bwuQl_W5NMa4g3MvEW_sVCeo4Tgf1W3QkrnYFQKfSyl3ScLps" 
                alt="Clean data lineage graph flow"
              />
            </div>
          </div>
        </section>

        {/* 5. Manifesto Section */}
        <section className="py-16 lg:py-[200px] px-4 sm:px-margin max-w-[1728px] mx-auto relative flex flex-col items-center text-center bg-page-bg border-t border-line/20">
          <div className="absolute top-0 right-[10%] w-[400px] h-[400px] opacity-10 pointer-events-none">
            <svg className="w-full h-full" fill="none" stroke="url(#manifesto-grad)" strokeWidth="0.5" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="manifesto-grad" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#1B1B1B"></stop>
                  <stop offset="100%" stopColor="#8C8880"></stop>
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="48"></circle>
              <ellipse cx="50" cy="50" rx="24" ry="48"></ellipse>
              <ellipse cx="50" cy="50" rx="48" ry="24"></ellipse>
              <line x1="2" x2="98" y1="50" y2="50"></line>
              <line x1="50" x2="50" y1="2" y2="98"></line>
            </svg>
          </div>
          <h2 className="font-display text-[49px] leading-[1.1] text-balance max-w-[1200px] font-bold tracking-tight text-text relative z-10">
            As AI agents expand across the enterprise, the need for clean, reliable data has never been more critical. DATA.READY unifies your dataset quality.
          </h2>
        </section>

        {/* 6. Brand OS (Data OS) Section */}
        <section id="features" className="py-16 lg:py-[120px] px-4 sm:px-margin max-w-[1728px] mx-auto bg-page-bg border-t border-line/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-[100px] items-center">
            
            {/* Left Card: File List Mockup */}
            <div className="bg-gradient-to-br from-soft-card-2 to-soft-card rounded-[40px] p-8 h-[450px] sm:h-[600px] lg:h-[700px] flex items-center justify-center relative overflow-hidden border border-line/30 shadow-sm">
              <div className="w-full max-w-md bg-white-card rounded-2xl shadow-xl border border-line/20 p-6">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-label font-bold text-sm text-text">Dataset Registry</span>
                  <span className="material-symbols-outlined text-muted">more_horiz</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 hover:bg-soft-card rounded-xl transition-colors cursor-pointer" onClick={onGetStarted}>
                    <span className="material-symbols-outlined text-[#FF4B2B]">folder</span>
                    <span className="font-body-md font-medium text-text">customer_registry.csv</span>
                  </div>
                  <div className="flex items-center gap-4 p-3 hover:bg-soft-card rounded-xl transition-colors cursor-pointer" onClick={onGetStarted}>
                    <span className="material-symbols-outlined text-[#8A2387]">description</span>
                    <span className="font-body-md font-medium text-text">revenue_audit_2026.csv</span>
                  </div>
                  <div className="flex items-center gap-4 p-3 hover:bg-soft-card rounded-xl transition-colors cursor-pointer" onClick={onGetStarted}>
                    <span className="material-symbols-outlined text-[#E94057]">image</span>
                    <span className="font-body-md font-medium text-text">product_inventory.xlsx</span>
                  </div>
                  <div className="flex items-center gap-4 p-3 hover:bg-soft-card rounded-xl transition-colors cursor-pointer" onClick={onGetStarted}>
                    <span className="material-symbols-outlined text-[#F27121]">analytics</span>
                    <span className="font-body-md font-medium text-text">user_activity_logs.db</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Text Info */}
            <div className="flex flex-col justify-center h-full max-w-lg">
              <h3 className="font-display text-h2 mb-12 font-bold tracking-tight text-text">The intelligent foundation for your data.</h3>
              
              <div className="relative pl-8 border-l-[3px] border-line space-y-12">
                <div className="absolute left-[-3px] top-0 w-[3px] h-1/3 bg-gradient-to-b from-[#181818] to-[#8C8880]"></div>
                
                <div>
                  <h4 className="font-h3 text-xl font-bold mb-3 text-text">Centralized Profiling</h4>
                  <p className="font-body-md text-muted leading-relaxed">
                    Bring all your disparate datasets, spreadsheets, and database tables into one cohesive, searchable environment.
                  </p>
                </div>
                
                <div className="opacity-50 hover:opacity-100 transition-opacity">
                  <h4 className="font-h3 text-xl font-bold mb-3 text-text">Local Remediation</h4>
                  <p className="font-body-md text-muted leading-relaxed">
                    Our engine maps schema types, highlights missing distributions, and runs AI-powered spelling and standardization rules.
                  </p>
                </div>
                
                <div className="opacity-50 hover:opacity-100 transition-opacity">
                  <h4 className="font-h3 text-xl font-bold mb-3 text-text">Audit Trail Lineage</h4>
                  <p className="font-body-md text-muted leading-relaxed">
                    Track every single transformation in a transactional SQLite log, generating clean CSVs and PDF audit reports.
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        </section>

        {/* 7. Remediation Studio (Lumio Studio Rebuild) */}
        <section className="py-16 lg:py-[120px] px-4 sm:px-margin max-w-[1728px] mx-auto bg-page-bg border-t border-line/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[100px] items-center">
            
            {/* Left Card: Title */}
            <div className="flex flex-col justify-center h-full max-w-lg order-2 lg:order-1">
              <h3 className="font-display text-h2 mb-6 font-bold tracking-tight text-text">
                Remediate dirty datasets in seconds.
              </h3>
              <p className="font-body-md text-muted mb-8">
                Clean and format datasets using automated rules or context-aware LLM processing. Fix state code abbreviations, restore missing zip codes, and impute numerical null values with precision.
              </p>
              <button 
                onClick={onGetStarted}
                className="bg-black text-page-bg font-label text-sm px-6 py-3 rounded-full w-fit hover:bg-black/90 transition-opacity shadow"
              >
                Launch workspace
              </button>
            </div>

            {/* Right Card: Studio UI Frame */}
            <div className="bg-gradient-to-tr from-[#E0EAFC] to-[#CFDEF3] rounded-[40px] p-8 h-[450px] sm:h-[600px] lg:h-[700px] flex items-center justify-center relative overflow-hidden border border-line/30 shadow-inner order-1 lg:order-2">
              <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-[24px] h-[24px] rounded-full border border-black flex items-center justify-center shrink-0">
                    <span className="text-black font-bold text-[10px] leading-none font-mono">D</span>
                  </div>
                  <span className="font-label text-xs font-bold text-muted">REMEDIATION STUDIO</span>
                </div>
                
                <div className="bg-white/60 backdrop-blur-md rounded-xl p-4 mb-6 border border-white/50 shadow-sm">
                  <p className="font-body-md text-text">
                    Clean the 'state' column. Standardise all abbreviations to their full name e.g., 'cali', 'ca' {"->"} 'California'.
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#181818] to-[#8C8880] flex items-center justify-center shadow-md animate-pulse">
                    <span className="material-symbols-outlined text-white text-sm">auto_awesome</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </section>

        {/* 8. Role Use Cases */}
        <section id="usecases" className="py-16 lg:py-[160px] px-4 sm:px-margin max-w-[1728px] mx-auto flex flex-col items-center bg-page-bg border-t border-line/20">
          <h2 className="font-display text-h2 mb-12 font-bold tracking-tight text-center text-text">
            Built for every data role.
          </h2>
          
          {/* Role filter buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            <button 
              onClick={() => setActiveRole("engineers")}
              className={`px-6 py-2 rounded-full font-label text-sm transition-all duration-300 ${
                activeRole === "engineers" ? "bg-black text-page-bg shadow-md" : "bg-white text-text hover:bg-gray-50 shadow-sm"
              }`}
            >
              Data Engineers
            </button>
            <button 
              onClick={() => setActiveRole("scientists")}
              className={`px-6 py-2 rounded-full font-label text-sm transition-all duration-300 ${
                activeRole === "scientists" ? "bg-black text-page-bg shadow-md" : "bg-white text-text hover:bg-gray-50 shadow-sm"
              }`}
            >
              Data Scientists
            </button>
            <button 
              onClick={() => setActiveRole("mlops")}
              className={`px-6 py-2 rounded-full font-label text-sm transition-all duration-300 ${
                activeRole === "mlops" ? "bg-black text-page-bg shadow-md" : "bg-white text-text hover:bg-gray-50 shadow-sm"
              }`}
            >
              MLOps Teams
            </button>
            <button 
              onClick={() => setActiveRole("compliance")}
              className={`px-6 py-2 rounded-full font-label text-sm transition-all duration-300 ${
                activeRole === "compliance" ? "bg-black text-page-bg shadow-md" : "bg-white text-text hover:bg-gray-50 shadow-sm"
              }`}
            >
              Compliance Leads
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            
            {/* Card 1 */}
            <div className={`bg-white h-[400px] rounded-[32px] p-8 flex flex-col justify-between group overflow-hidden relative shadow-sm border border-line/20 transition-all duration-300 ${
              activeRole === "engineers" ? "ring-2 ring-black" : "opacity-75"
            }`}>
              <div className="relative z-10">
                <h4 className="font-h3 text-xl font-bold mb-2 text-text">Quality Profiling</h4>
                <p className="font-body-md text-muted">Generate comprehensive statistical profiles of uploaded CSVs.</p>
              </div>
              <div className="absolute bottom-[-20px] right-[-20px] w-2/3 h-2/3 bg-white-card rounded-tl-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-line/10 p-6 transform group-hover:-translate-y-2 group-hover:-translate-x-2 transition-transform duration-500">
                <div className="h-3 w-1/2 bg-gradient-to-r from-[#181818] to-[#8C8880] rounded-full mb-4"></div>
                <div className="h-2 w-full bg-line/50 rounded-full mb-3"></div>
                <div className="h-2 w-5/6 bg-line/50 rounded-full mb-3"></div>
              </div>
            </div>

            {/* Card 2 */}
            <div className={`bg-gradient-to-br from-[#FFDEE9] to-[#B5FFFC] h-[400px] rounded-[32px] p-8 flex flex-col justify-between group overflow-hidden relative shadow-sm transition-all duration-300 ${
              activeRole === "scientists" ? "ring-2 ring-black" : "opacity-75"
            }`}>
              <div className="relative z-10">
                <h4 className="font-h3 text-xl font-bold mb-2 text-text">AI Standardisation</h4>
                <p className="font-body-md text-muted">Reconcile inconsistent spelling anomalies with Gemini semantic checks.</p>
              </div>
              <div className="absolute bottom-[-20px] right-[-20px] w-2/3 h-2/3 bg-panel-bg rounded-tl-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 overflow-hidden transform group-hover:-translate-y-2 group-hover:-translate-x-2 transition-transform duration-500">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuABa0q5BJ_DreMgIZGB-8at3sYpuFks_tT431tznVrVWB2C49LzdUC651wzXTj9LD-7VYCWRRpo9bqyyAQ_b54KnjtoPjXSRfeIXbBgjwHXIr8Ojo51Y8MG8CC0mGtvupgQSf4RnLcvReiqPWlUs5L2KkemFlhV-MfAQAzfyxIvGWfFM2Orh3ChuU5A6sOS2VBQbJyPWAQcwMlr6YWpCbln_V8DC4Yo90e6mK4QAINc-FrScaJ_KPin-t6UJ12p4Dnl5CbWpvGS2GiO" 
                  alt="AI standardisation flow"
                />
              </div>
            </div>

            {/* Card 3 */}
            <div className={`bg-white h-[400px] rounded-[32px] p-8 flex flex-col justify-between group overflow-hidden relative border border-line/20 shadow-sm transition-all duration-300 ${
              activeRole === "mlops" ? "ring-2 ring-black" : "opacity-75"
            }`}>
              <div className="relative z-10">
                <h4 className="font-h3 text-xl font-bold mb-2 text-text">Database Syncing</h4>
                <p className="font-body-md text-muted">Sync tables back to SQLite database schemas safely and instantly.</p>
              </div>
              <div className="absolute bottom-[-20px] right-[-20px] w-2/3 h-2/3 bg-page-bg rounded-tl-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-line/10 p-6 transform group-hover:-translate-y-2 group-hover:-translate-x-2 transition-transform duration-500 flex flex-col gap-3">
                <div className="w-full h-1/2 bg-gradient-to-r from-[#181818] to-[#8C8880] rounded-lg"></div>
                <div className="w-full h-1/2 bg-soft-card rounded-lg flex gap-2">
                  <div className="w-1/2 h-full bg-line/30 rounded-md"></div>
                  <div className="w-1/2 h-full bg-line/30 rounded-md"></div>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className={`bg-[#181818] h-[400px] rounded-[32px] p-8 flex flex-col justify-between group overflow-hidden relative shadow-lg transition-all duration-300 ${
              activeRole === "compliance" ? "ring-2 ring-white" : "opacity-75"
            }`}>
              <div className="relative z-10">
                <h4 className="font-h3 text-xl font-bold mb-2 text-white">Audit Logs & PDF Reports</h4>
                <p className="font-body-md text-white/70">Ensure compliance with downloadable PDF data lineage audit trails.</p>
              </div>
              <div className="absolute bottom-[20px] right-[20px] w-1/2 h-1/2 bg-gradient-to-br from-[#181818] to-[#8C8880] rounded-2xl shadow-xl p-6 transform group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[48px]">record_voice_over</span>
              </div>
            </div>

          </div>
        </section>

        {/* 9. Testimonial Section */}
        <section className="py-16 lg:py-[160px] px-4 sm:px-margin max-w-[1200px] mx-auto flex flex-col items-center text-center bg-page-bg border-t border-line/20">
          <div className="mb-12 opacity-35 text-text">
            <span className="material-symbols-outlined text-[64px]">format_quote</span>
          </div>
          <h2 className="font-display text-[28px] sm:text-[40px] md:text-[56px] leading-[1.1] font-bold tracking-tight text-text mb-16 text-balance">
            "DATA.READY was built with the desire to liberate data scientists from menial cleaning tasks, allowing them to focus on true model training and analysis."
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-line overflow-hidden shadow-md">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_dQOYUXm-9ocUk-1cRA5ZyP6tu7OdWwNIU7SRhouWt3u89anzj3A5_pr7FGCCICOiz6a2FoSpC-bN53AYbiVQ-spgKPawBtGZtLq-9c6QyNclym7oEuOsCnQllJenEGuMkAeM3mwnTOLdgJakEE63ozCYcDA2l-C2EQnZiozAakUbDrwJG_jxTwrvV9I5p2oiVPXIDBv-rltdG9P0TX6X2OUHQcwckpskXXJEawplcI8ff_rzn1YnIDgrniF27Vjc0Lz4LKcazue9" 
                alt="Alex Morgan"
              />
            </div>
            <div className="text-left">
              <p className="font-label text-sm font-bold text-text">Alex Morgan</p>
              <p className="font-label text-xs text-muted">VP of Data Operations, Northline</p>
              <p className="font-label text-xs text-muted">VP of Data Operations, Northline</p>
            </div>
          </div>
        </section>

        {/* 10. Updates Section */}
        <section id="updates-section" className="py-16 lg:py-[120px] px-4 sm:px-margin max-w-[1728px] mx-auto bg-page-bg border-t border-line/20">
          <div className="updates-header flex justify-between items-end mb-12">
            <h2 className="font-display text-h2 font-bold tracking-tight text-text">Latest Updates</h2>
            <button className="font-label text-sm font-bold border-b border-black text-text pb-1 hover:text-[#8C8880] hover:border-[#8C8880] transition-colors">
              View All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="update-card group cursor-pointer" onClick={onGetStarted}>
              <div className="w-full h-[250px] sm:h-[350px] md:h-[450px] bg-panel-bg rounded-[32px] mb-6 overflow-hidden shadow-md">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSO7q5jBNOT3hqLKDm3SBl2gq1FNkbf3A6w7XGvW-FczLOWzsAngi8ITvcu3ZVz8p1PlS2O8BLLcKUcYY3CKY63FLoeynerMHqQUW1679c6oPyUe-ZT7m5zc5uDN9f-3BQLDY9Z7b73BTUzr4SmYNxUrw3XFXzKSbTz-_6dpzkjmI40NML8wW37GAhFhQKr6JYxr2EPsuNY8KoBwVPVrs0HJaDY6amCLg5iO1GmiVcZvL41NWY2Bn0LZNm-lk3Yt6Vk0N6SGuriNbj" 
                  alt="Gemini update"
                />
              </div>
              <p className="font-label text-xs text-muted mb-3">Product Update • Oct 12</p>
              <h4 className="font-h3 text-xl font-bold text-text group-hover:text-[#8C8880] transition-colors">
                Introducing Gemini Semantic Profiling v2
              </h4>
            </div>

            <div className="update-card group cursor-pointer" onClick={onGetStarted}>
              <div className="w-full h-[250px] sm:h-[350px] md:h-[450px] bg-soft-card rounded-[32px] mb-6 overflow-hidden shadow-md">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpG6adVPxKZeeK9eJ2dK9tUanRlhk8_krZDoEDsafUQ9gt2Yyc3YsfqK4_I23s6a-cqJRRE4Y6kyCMgihqtNrrwvRDs2u9N5xn3Vmo77U2yYOslnbl8oALfBx2hQnDRcw2t-epqcBs21ooh_k46gNLaJs7-fK4J6qNNMW5ScFLhb5EL12iPGYhQEirD7se3PkbCfglYnhMqf-zCubvEnv_dINqdjLPj_S13Fr0HeMXaxhn9AqfDqqdGC7Bl-2OYqfwfbyoyRGodLCY" 
                  alt="Modern data framework"
                />
              </div>
              <p className="font-label text-xs text-muted mb-3">Guide • Sep 28</p>
              <h4 className="font-h3 text-xl font-bold text-text group-hover:text-[#8C8880] transition-colors">
                The Modern Data Quality Framework
              </h4>
            </div>

            <div className="update-card group cursor-pointer" onClick={onGetStarted}>
              <div className="w-full h-[250px] sm:h-[350px] md:h-[450px] bg-panel-bg rounded-[32px] mb-6 overflow-hidden shadow-md">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJaqzd1zJdXX1EdZhbTwql0mVIvsGXueArpb4dyIw4esyXpBY8wHK5JFAojAFJUPAIhbjpuOoYEDNE8l605KW6euYmMCfS48bPI1HvdevuWn7Nz8VwfPIiJOMHuDVxrM6Y3W-iETid73M2yg3TIIPdazulPFgqx1UguSzfxU_s4S-q4mEvXX9AZ4hWtDx_vyn_dBZnS5o9AAuLJYnkmY-AjcFw3apWVyaF23rST8wE9U0w261HX2sRI4MBqiquoRVKZrNvFj0BbpTe" 
                  alt="Company updates"
                />
              </div>
              <p className="font-label text-xs text-muted mb-3">Company • Sep 15</p>
              <h4 className="font-h3 text-xl font-bold text-text group-hover:text-[#8C8880] transition-colors">
                DATA.READY reaches 10k local deployments
              </h4>
            </div>
            
          </div>
        </section>

        {/* 11. Demo CTA Section */}
        <section className="py-16 lg:py-[160px] px-4 sm:px-margin max-w-[1728px] mx-auto flex flex-col items-center text-center bg-page-bg border-t border-line/20">
          <div className="w-[120px] h-[120px] rounded-full border border-black flex items-center justify-center mb-12">
            <span className="text-black font-bold text-[64px] leading-none font-mono">D</span>
          </div>
          <h2 className="font-display text-[56px] leading-[1.1] font-bold tracking-tight text-text mb-8 max-w-3xl text-balance">
            Get a personalized demo of DATA.READY.
          </h2>
          <button 
            onClick={onLoadDemo}
            className="bg-black text-page-bg font-label text-sm px-10 py-5 rounded-full hover:bg-black/80 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-300"
          >
            Launch Demo Pipeline
          </button>
        </section>

        {/* Contact Section */}
        <ContactSection />
      </main>

      {/* 12. Dark Footer */}
      <footer className="bg-gradient-to-b from-[#181818] to-[#0a0a0a] text-page-bg font-body-md text-body-md w-full pt-12 pb-8 lg:pb-xl px-4 sm:px-margin flex flex-col items-center rounded-t-[40px] mt-section relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="max-w-[1728px] mx-auto w-full relative z-10">
          
          {/* Inverted Capsule Nav */}
          <div className="w-full max-w-[700px] mx-auto h-[72px] flex items-center justify-between bg-white/10 backdrop-blur-md rounded-full px-xs py-xs mb-[120px] shadow-lg border border-white/10">
            <div className="flex items-center gap-md pl-xs">
              <div className="w-[34px] h-[34px] rounded-full border border-white flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm leading-none font-mono">D</span>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <button onClick={onGetStarted} className="font-label text-label text-white/80 hover:text-white transition-colors duration-300">
                  Workspace
                </button>
                <button onClick={onLoadDemo} className="font-label text-label text-white/80 hover:text-white transition-colors duration-300">
                  Demo
                </button>
                <a href="#features" className="font-label text-label text-white/80 hover:text-white transition-colors duration-300">
                  Features
                </a>
                <a href="#usecases" className="font-label text-label text-white/80 hover:text-white transition-colors duration-300">
                  Roles
                </a>
              </nav>
            </div>
            
            <button 
              onClick={onGetStarted}
              className="bg-white text-black font-label text-label h-full px-8 rounded-full hover:bg-gray-100 transition-colors duration-300 scale-95 hover:scale-100 shrink-0 flex items-center shadow-sm"
            >
              Get started
            </button>
          </div>

          <div className="flex flex-col items-center mb-[120px]">
            <div className="w-[180px] h-[180px] rounded-full border border-white/40 flex items-center justify-center mb-8">
              <span className="text-white font-bold text-[96px] leading-none font-mono">D</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-lg w-full mb-xl text-left border-t border-white/10 pt-16 text-white">
            <div className="flex flex-col gap-4">
              <h4 className="font-label text-label text-white/50 uppercase mb-2">Product</h4>
              <button onClick={onGetStarted} className="hover:text-white text-left transition-colors text-white/80">Profiling</button>
              <button onClick={onGetStarted} className="hover:text-white text-left transition-colors text-white/80">Remediation</button>
              <button onClick={onGetStarted} className="hover:text-white text-left transition-colors text-white/80">Readiness Report</button>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-label text-label text-white/50 uppercase mb-2">Solutions</h4>
              <button onClick={onGetStarted} className="hover:text-white text-left transition-colors text-white/80">Data Engineers</button>
              <button onClick={onGetStarted} className="hover:text-white text-left transition-colors text-white/80">Data Scientists</button>
              <button onClick={onGetStarted} className="hover:text-white text-left transition-colors text-white/80">MLOps Pipelines</button>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-label text-label text-white/50 uppercase mb-2">Company</h4>
              <a className="hover:text-white transition-colors text-white/80" href="#">About Us</a>
              <a className="hover:text-white transition-colors text-white/80" href="#">Careers</a>
              <a className="hover:text-white transition-colors text-white/80" href="#">Blog</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-label text-label text-white/50 uppercase mb-2">Legal</h4>
              <a className="hover:text-white transition-colors text-white/80" href="#">Privacy Policy</a>
              <a className="hover:text-white transition-colors text-white/80" href="#">Terms of Service</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-label text-label text-white/50 uppercase mb-2">Social</h4>
              <a className="hover:text-white transition-colors text-white/80" href="#">Twitter / X</a>
              <a className="hover:text-white transition-colors text-white/80" href="#">LinkedIn</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-label text-label text-white/50 uppercase mb-2">Support</h4>
              <a className="hover:text-white transition-colors text-white/80" href="#">Help Center</a>
              <a className="hover:text-white transition-colors text-white/80" href="#">API Docs</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-label text-label text-white/50 uppercase mb-2">Security</h4>
              <a className="hover:text-white transition-colors text-white/80" href="#">Trust Center</a>
              <div className="flex items-center gap-2 text-white/80 hover:text-white transition-colors cursor-pointer">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                <span className="">Local Safe</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between w-full pt-8 text-white/50 text-sm border-t border-white/10">
            <p className="">© 2026 DATA.READY. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
