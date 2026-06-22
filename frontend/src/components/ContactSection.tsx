import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ShieldCheck, MessageSquare, MapPin, Send, Check, Loader2 } from "lucide-react";

export default function ContactSection() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: ""
  });

  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Trigger GSAP entrance animations when section comes into view
          if (headingRef.current) {
            const text = headingRef.current.innerText;
            headingRef.current.innerHTML = text
              .split("")
              .map((char) => `<span class="char-span inline-block">${char === " " ? "&nbsp;" : char}</span>`)
              .join("");

            gsap.fromTo(
              headingRef.current.querySelectorAll(".char-span"),
              { opacity: 0, y: 20, rotateX: -45 },
              {
                opacity: 1,
                y: 0,
                rotateX: 0,
                duration: 0.6,
                stagger: 0.02,
                ease: "back.out(1.5)"
              }
            );
          }

          if (cardsRef.current) {
            gsap.fromTo(
              cardsRef.current.children,
              { opacity: 0, y: 30 },
              {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.12,
                ease: "power2.out"
              }
            );
          }

          if (formRef.current) {
            gsap.fromTo(
              formRef.current,
              { opacity: 0, scale: 0.96, y: 30 },
              {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.7,
                ease: "power3.out",
                delay: 0.2
              }
            );
          }

          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setFormSubmitted(true);
    }, 1500);
  };

  return (
    <section 
      ref={sectionRef}
      id="contact-section" 
      className="py-16 lg:py-[120px] px-4 sm:px-margin max-w-[1728px] mx-auto bg-page-bg border-t border-line/20 relative"
    >
      <div className="max-w-[1200px] mx-auto w-full">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-black text-page-bg font-label text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 font-mono">
            Local Safe Channels
          </div>
          <h2
            ref={headingRef}
            className="font-display text-h2 font-black tracking-tight text-text text-balance max-w-2xl mx-auto"
            style={{ perspective: "1000px" }}
          >
            Connect with Data Architects
          </h2>
          <p className="font-body-md text-muted max-w-xl mx-auto mt-4 text-balance">
            Talk to data quality engineers about locally running pipelines, custom validation schemas, and enterprise compliance rules.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Info cards (GSAP Staggered) - Left column */}
          <div ref={cardsRef} className="lg:col-span-5 flex flex-col gap-6">
            {/* Card 1 */}
            <div className="bg-white-card/85 backdrop-blur rounded-[28px] border border-line/35 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-soft-card-2 flex items-center justify-center text-[#3b82f6] mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-h3 text-lg font-bold text-text mb-2">Zero Data Exposure Support</h3>
              <p className="font-body-md text-muted">
                Learn how DATA.READY protects sensitive healthcare, financial, and client datasets by computing metrics fully inside your local environment.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white-card/85 backdrop-blur rounded-[28px] border border-line/35 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-soft-card-2 flex items-center justify-center text-[#8b5cf6] mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-h3 text-lg font-bold text-text mb-2">Developer Channels</h3>
              <p className="font-body-md text-muted">
                Need to customize validation algorithms or link SQL database schemas? Our engineering support is available for integration discussions.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white-card/85 backdrop-blur rounded-[28px] border border-line/35 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-soft-card-2 flex items-center justify-center text-[#10b981] mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-h3 text-lg font-bold text-text mb-2">Local-First Operations</h3>
              <p className="font-body-md text-muted">
                DATA.READY is open source core, powered by local sqlite lineage stores and edge processing pipelines.
              </p>
            </div>
          </div>

          {/* Form Container (Framer Motion + GSAP) - Right column */}
          <div ref={formRef} className="lg:col-span-7">
            <div className="bg-white-card border border-line/45 rounded-[36px] p-8 md:p-10 shadow-lg relative overflow-hidden">
              <AnimatePresence mode="wait">
                {!formSubmitted ? (
                  <motion.form
                    key="contact-form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="font-label text-xs uppercase tracking-wider text-muted font-bold block">
                          Full Name *
                        </label>
                        <motion.input
                          whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(24, 24, 24, 0.08)", borderColor: "#181818" }}
                          transition={{ duration: 0.2 }}
                          type="text"
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-soft-card-2 border border-line/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                          placeholder="Jane Doe"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="font-label text-xs uppercase tracking-wider text-muted font-bold block">
                          Email Address *
                        </label>
                        <motion.input
                          whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(24, 24, 24, 0.08)", borderColor: "#181818" }}
                          transition={{ duration: 0.2 }}
                          type="text"
                          id="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-soft-card-2 border border-line/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                          placeholder="jane@company.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="company" className="font-label text-xs uppercase tracking-wider text-muted font-bold block">
                        Company Name
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(24, 24, 24, 0.08)", borderColor: "#181818" }}
                        transition={{ duration: 0.2 }}
                        type="text"
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full bg-soft-card-2 border border-line/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                        placeholder="Enterprise Corp"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="font-label text-xs uppercase tracking-wider text-muted font-bold block">
                        Message *
                      </label>
                      <motion.textarea
                        whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(24, 24, 24, 0.08)", borderColor: "#181818" }}
                        transition={{ duration: 0.2 }}
                        id="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-soft-card-2 border border-line/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors resize-none"
                        placeholder="Tell us about your data pipeline support needs..."
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full bg-black text-page-bg py-4 rounded-xl font-label text-xs uppercase tracking-widest font-bold hover:bg-black/95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:bg-zinc-800 disabled:cursor-not-allowed group shiny-border-dark"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          Establishing Secure Tunnel...
                        </>
                      ) : (
                        <>
                          <motion.div
                            variants={{
                              hover: { x: 5, y: -5 }
                            }}
                            className="flex items-center group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                          >
                            <Send className="w-4 h-4" />
                          </motion.div>
                          Submit Message
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success-message"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 120 }}
                    className="flex flex-col items-center justify-center py-10 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                      className="w-16 h-16 rounded-full bg-[#10b981] flex items-center justify-center text-white mb-6 shadow"
                    >
                      <Check className="w-8 h-8" />
                    </motion.div>
                    <h3 className="font-display text-xl font-black uppercase text-text tracking-tight mb-2">
                      Secure Channel Established
                    </h3>
                    <p className="font-body-md text-muted max-w-sm mb-6">
                      Thank you! Your message was successfully sent. An architect will reach out shortly.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setFormSubmitted(false);
                        setFormData({ name: "", email: "", company: "", message: "" });
                      }}
                      className="bg-zinc-100 hover:bg-zinc-200 border border-line text-text font-label text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      Send another message
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
