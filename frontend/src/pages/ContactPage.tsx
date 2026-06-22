import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { Mail, MessageSquare, ShieldCheck, MapPin, ArrowLeft, Send, Check, Loader2 } from "lucide-react";
import Aurora from "../components/Aurora";

interface ContactPageProps {
  onBack: () => void;
}

export default function ContactPage({ onBack }: ContactPageProps) {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: ""
  });

  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  // GSAP animations on load
  useEffect(() => {
    // Stagger character reveal on heading
    if (headingRef.current) {
      const text = headingRef.current.innerText;
      headingRef.current.innerHTML = text
        .split("")
        .map((char) => `<span class="char-span inline-block">${char === " " ? "&nbsp;" : char}</span>`)
        .join("");

      gsap.fromTo(
        headingRef.current.querySelectorAll(".char-span"),
        { opacity: 0, y: 30, rotateX: -60 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.03,
          ease: "back.out(1.7)"
        }
      );
    }

    // Stagger slide-up for info cards
    if (cardsRef.current) {
      gsap.fromTo(
        cardsRef.current.children,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.3
        }
      );
    }

    // Infinite floating animation for decorative badge
    if (badgeRef.current) {
      gsap.fromTo(
        badgeRef.current,
        { y: -8 },
        {
          y: 8,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        }
      );
    }
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
    <div className="relative min-h-[90vh] bg-page-bg text-text overflow-hidden py-12 px-4 sm:px-margin flex flex-col items-center">
      {/* Background Aurora */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 overflow-hidden">
        <Aurora
          colorStops={["#B497CF", "#8b5cf6", "#7cff67"]}
          blend={0.6}
          amplitude={1.2}
          speed={0.4}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-page-bg/60 to-page-bg backdrop-blur-[40px]" />
      </div>
      <div className="max-w-[1200px] w-full z-10 flex flex-col gap-10">
        {/* Back navigation button */}
        <div className="flex justify-start">
          <motion.button
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-muted hover:text-text bg-white-card/80 backdrop-blur border border-line/30 px-4 py-2.5 rounded-full shadow-sm cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to pipeline
          </motion.button>
        </div>

        {/* Page Header */}
        <div className="text-center relative">
          <div
            ref={badgeRef}
            className="inline-block bg-black text-page-bg font-label text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 font-mono"
          >
            Local Safe Channels
          </div>
          <h1
            ref={headingRef}
            className="font-display text-h1 font-black tracking-tight text-text text-balance max-w-2xl mx-auto"
            style={{ perspective: "1000px" }}
          >
            Connect with Data Architects
          </h1>
          <p className="font-body-lg text-muted max-w-xl mx-auto mt-4 text-balance">
            Talk to data quality engineers about locally running pipelines, custom validation schemas, and enterprise compliance rules.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-6">
          {/* Info cards (GSAP Staggered) - Left column */}
          <div ref={cardsRef} className="lg:col-span-5 flex flex-col gap-6">
            {/* Card 1 */}
            <div className="bg-white-card/80 backdrop-blur rounded-[28px] border border-line/35 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-soft-card-2 flex items-center justify-center text-[#3b82f6] mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-h3 text-lg font-bold text-text mb-2">Zero Data Exposure Support</h3>
              <p className="font-body-md text-muted">
                Learn how DATA.READY protects sensitive healthcare, financial, and client datasets by computing metrics fully inside your local environment.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white-card/80 backdrop-blur rounded-[28px] border border-line/35 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-soft-card-2 flex items-center justify-center text-[#8b5cf6] mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-h3 text-lg font-bold text-text mb-2">Developer Channels</h3>
              <p className="font-body-md text-muted">
                Need to customize validation algorithms or link SQL database schemas? Our engineering support is available for integration discussions.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white-card/80 backdrop-blur rounded-[28px] border border-line/35 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-soft-card-2 flex items-center justify-center text-[#10b981] mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-h3 text-lg font-bold text-text mb-2">Local-First Operations</h3>
              <p className="font-body-md text-muted">
                DATA.READY is open source core, powered by local sqlite lineage stores and edge processing pipelines.
              </p>
            </div>
          </div>

          {/* Form Container (Framer Motion Animated) - Right column */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
              className="bg-white-card border border-line/40 rounded-[36px] p-8 md:p-10 shadow-xl relative overflow-hidden"
            >
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
                        <input
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
                        <input
                          type="email"
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
                      <input
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
                      <textarea
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
                      className="w-full bg-black text-page-bg py-4 rounded-xl font-label text-xs uppercase tracking-widest font-bold hover:bg-black/95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:bg-zinc-800 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          Establishing Secure Tunnel...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
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
                      className="w-16 h-16 rounded-full bg-[#10b981] flex items-center justify-center text-white mb-6 shadow animate-pulse"
                    >
                      <Check className="w-8 h-8" />
                    </motion.div>
                    <h3 className="font-display text-xl font-black uppercase text-text tracking-tight mb-2">
                      Secure Channel Established
                    </h3>
                    <p className="font-body-md text-muted max-w-sm mb-6">
                      Thank you! Your inquiry was successfully transmitted locally. A system architect will connect with you via email shortly.
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
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
