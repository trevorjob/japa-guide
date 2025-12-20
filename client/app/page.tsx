'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui';

// Stunning destinations for the rotating text
const destinations = ['Canada 🇨🇦', 'UK 🇬🇧', 'USA 🇺🇸', 'Germany 🇩🇪', 'Australia 🇦🇺', 'Netherlands 🇳🇱'];

export default function HomePage() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="w-full overflow-x-hidden bg-bg-primary text-text-primary selection:bg-accent-primary selection:text-white">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-accent-primary/20 blur-[120px] rounded-full mix-blend-screen animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-accent-secondary/10 blur-[120px] rounded-full mix-blend-screen animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      <HeroSection y1={y1} opacity={opacity} />
      {/* <StatsSection /> */}
      <FeatureShowcase />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
}

function HeroSection({ y1, opacity }: { y1: any, opacity: any }) {
  return (
    <section className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden">
      {/* Video Background Fallback / Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/80 via-bg-primary/40 to-bg-primary" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="mb-8 w-full flex flex-col items-center"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-sm font-medium mb-6 tracking-wide uppercase">
              ✨ The Ultimate Japa Hack
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
              Move to <span className="inline-block relative px-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary">
                  <RotatingText items={destinations} />
                </span>
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-accent-primary/50 rounded-full blur-sm"></span>
              </span>
              <br />
              <span className="text-white mt-2 inline-block">With Confidence.</span>
            </h1>
            <p className="text-lg md:text-xl text-text-secondary font-light mx-auto leading-relaxed px-4">
              Stop guessing. Start packing. I built this to help you generate a personalized, step-by-step roadmap for your visa, job, and new life abroad.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link href="/explore" className="group">
              <Button size="xl" className="h-16 px-10 text-lg rounded-full shadow-glow-primary hover:shadow-glow-accent transition-all duration-300 transform hover:scale-105">
                Generate My Roadmap
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline" size="xl" className="h-16 px-10 text-lg rounded-full border-white/10 hover:bg-white/5 backdrop-blur-md text-white transition-all duration-300">
                Explore Countries
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Floating Elements 3D Effect */}
      <motion.div style={{ y: y1, opacity }} className="absolute -bottom-20 left-0 right-0 h-64 bg-gradient-to-t from-bg-primary to-transparent z-20 pointer-events-none" />
    </section>
  );
}

function RotatingText({ items }: { items: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [items]);

  return (
    <span className="inline-flex justify-center min-w-[300px] md:min-w-[400px] align-bottom">
      {items.map((item, i) => (
        <motion.span
          key={i}
          initial={{ y: 50, opacity: 0, rotateX: -90 }}
          animate={{
            y: i === index ? 0 : 50,
            opacity: i === index ? 1 : 0,
            rotateX: i === index ? 0 : 90,
            display: i === index ? "inline-block" : "none"
          }}
          transition={{ duration: 0.6, ease: "backOut" }}
          className={`${i === index ? "relative" : "absolute"} whitespace-nowrap`}
        >
          {item}
        </motion.span>
      ))}
    </span>
  );
}

function StatsSection() {
  return (
    <section className="py-10 border-y border-white/5 bg-white/[0.02]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Countries Covered', value: '190+' },
            { label: 'Visa Types', value: '500+' },
            { label: 'Roadmaps Generated', value: '10k+' },
            { label: 'Success Stories', value: '2.5k+' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-1">{stat.value}</span>
              <span className="text-sm text-text-tertiary uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureShowcase() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const features = [
    {
      title: "AI-Powered Roadmaps",
      desc: "Tell us your profile, and our AI builds a personalized timeline for your specific visa and goals.",
      icon: "🤖",
      gradient: "from-blue-500 to-cyan-400"
    },
    {
      title: "Cost Calculator",
      desc: "Calculate the real cost of moving, including hidden fees, flight tickets, and initial rent.",
      icon: "💰",
      gradient: "from-emerald-500 to-teal-400"
    },
    {
      title: "Global Discovery",
      desc: "Explore 196 countries with detailed data on safety, cost of living, and visa difficulty.",
      icon: "🌍",
      gradient: "from-purple-500 to-pink-400"
    }
  ];

  return (
    <section ref={ref} className="py-32 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Everything you need to <span className="text-accent-primary">Japa</span></h2>
          <p className="text-xl text-text-secondary mx-auto">We've combined data from official sources with advanced AI to simplify your migration journey.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="group relative h-full"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500 blur-xl`} />
              <div className="glass h-full p-8 rounded-3xl border border-white/5 relative overflow-hidden group-hover:border-white/10 transition-all duration-300 group-hover:-translate-y-2">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-accent-primary transition-colors">{f.title}</h3>
                <p className="text-text-secondary leading-relaxed">
                  {f.desc}
                </p>

                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { num: '01', title: 'Complete your profile', desc: 'Tell us about your education, budget, and destination goals.' },
    { num: '02', title: 'Get your roadmap', desc: 'Our AI generates a step-by-step plan tailored to your visa type.' },
    { num: '03', title: 'Track progress', desc: 'Check off tasks, unlock achievements, and stay organized.' },
  ];

  return (
    <section className="py-24 bg-bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">Your migration GPS</h2>
            <p className="text-xl text-text-secondary mb-12">No more confusing government websites or outdated blog posts. JapaGuide gives you a clear path forward.</p>

            <div className="space-y-8">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-6"
                >
                  <span className="text-4xl font-bold text-white/10">{step.num}</span>
                  <div>
                    <h4 className="text-xl font-bold mb-2 text-white">{step.title}</h4>
                    <p className="text-text-secondary">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            {/* Abstract Roadmap UI Visualization */}
            <div className="glass-heavy p-8 rounded-3xl border border-white/10 relative z-10 p-6 md:p-10 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="text-xs font-mono text-white/30">PASSPORT_REQ_APPROVED</div>
              </div>

              <div className="space-y-4">
                {[1, 2, 3].map((task) => (
                  <div key={task} className="glass-light p-4 rounded-xl flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${task === 1 ? 'bg-green-500 text-black' : 'border border-white/20'}`}>
                      {task === 1 && '✓'}
                    </div>
                    <div className="flex-1">
                      <div className="h-2 w-3/4 bg-white/20 rounded-full mb-2" />
                      <div className="h-2 w-1/2 bg-white/10 rounded-full" />
                    </div>
                  </div>
                ))}
                <div className="mt-6 p-4 bg-accent-primary/10 rounded-xl border border-accent-primary/20 text-sm">
                  <span className="text-accent-primary font-bold">AI Tip:</span> Dont forget to certify your bank statements 3 months in advance!
                </div>
              </div>
            </div>

            <div className="absolute inset-0 bg-accent-primary/20 blur-[100px] -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-accent-primary/10" />
      <div className="container mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass-heavy p-12 rounded-[3rem]"
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight py-4">
            Ready to <span className="text-accent-primary">Fly?</span>
          </h2>
          <p className="text-xl md:text-2xl text-text-secondary mb-8 mx-auto">
            Join thousands of others who turned their "what if" into "here I am".
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/explore">
              <Button size="xl" magnetic className="h-16 px-12 text-lg rounded-full shadow-glow-primary">
                Start My Journey 🚀
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 border-t border-white/5 text-center text-text-tertiary">
      <div className="container mx-auto px-4">
        <p className="mb-4">© {new Date().getFullYear()} JapaGuide. All rights reserved.</p>
        <div className="flex justify-center gap-6">
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
