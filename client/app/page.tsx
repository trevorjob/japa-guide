'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button, Card } from '@/components/ui';

const countries = ['Canada', 'Germany', 'UK', 'Australia', 'Netherlands', 'USA'];

export default function HomePage() {
  return (
    <div className="w-full overflow-hidden">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
}

function RotatingText({ items }: { items: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setCurrentIndex(prev => (prev + 1) % items.length), 2000);
    return () => clearInterval(interval);
  }, [items.length]);
  return (
    <motion.span key={currentIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-block">
      {items[currentIndex]}
    </motion.span>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] opacity-50" />
      <motion.div className="absolute top-1/4 left-1/4 text-6xl opacity-20" animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}>
        📖
      </motion.div>
      <motion.div className="absolute top-1/3 right-1/4 text-6xl opacity-20" animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}>
        ✈️
      </motion.div>
      <motion.div className="absolute bottom-1/4 left-1/3 text-6xl opacity-20" animate={{ y: [0, -15, 0], x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}>
        🌍
      </motion.div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-6">
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              Your Journey to <span className="gradient-text"><RotatingText items={countries} /></span> Starts Here
            </h1>
            <p className="text-xl md:text-2xl text-[var(--text-secondary)] font-light">
              Plan. Prepare. Pack. Prosper. ✈️
            </p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/roadmap/generate">
              <Button size="lg" magnetic>Start Your Roadmap →</Button>
            </Link>
            <Link href="/countries">
              <Button size="lg" variant="secondary">Explore Countries</Button>
            </Link>
          </motion.div>
          
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-sm text-[var(--text-tertiary)]">
            Join 10,000+ people planning their move 🌟
          </motion.p>
        </div>
      </div>
      
      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
        <div className="w-6 h-10 border-2 border-[var(--primary-from)] rounded-full flex justify-center pt-2">
          <motion.div className="w-1 h-3 bg-[var(--primary-from)] rounded-full" animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} />
        </div>
      </motion.div>
    </section>
  );
}

function FeaturesSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const features = [
    { title: 'AI Roadmap Generator', description: 'Get a personalized migration plan in seconds. Choose your AI guide\'s personality.', icon: '🤖', size: 'large' },
    { title: 'Cost Calculator', description: 'Know exactly what you need to save. No hidden surprises.', icon: '💰', size: 'medium' },
    { title: 'Document Builder', description: 'Generate visa applications, cover letters, and more.', icon: '📄', size: 'medium' },
    { title: 'Timeline Planner', description: 'Track your progress with visual timelines and milestones.', icon: '📅', size: 'medium' },
    { title: 'Country Comparison', description: 'Compare costs, visa difficulty, and quality of life across countries.', icon: '🌍', size: 'wide' },
  ];
  
  return (
    <section ref={ref} className="py-24 px-4 bg-[var(--bg-secondary)]">
      <div className="container mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to <span className="gradient-text">Make it Happen</span>
          </h2>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            Powerful tools designed to take the stress out of migration planning
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const sizeClasses: Record<string, string> = {
              large: 'md:col-span-1 md:row-span-2',
              medium: 'md:col-span-1',
              wide: 'md:col-span-2',
            };
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={sizeClasses[feature.size]}
              >
                <Card variant="feature" hover tilt className="h-full">
                  <div className="flex flex-col h-full">
                    <motion.div className="text-6xl mb-4" whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}>
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)]">
                      {feature.title}
                    </h3>
                    <p className="text-[var(--text-secondary)] mb-4">{feature.description}</p>
                    <div className="mt-auto">
                      <button className="text-[var(--primary-from)] hover:underline flex items-center group">
                        Learn more
                        <motion.span className="ml-1" animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                          →
                        </motion.span>
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-from)] to-[var(--accent-to)] opacity-10" />
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to Start Your <span className="gradient-text">Journey</span>?
          </h2>
          <p className="text-xl text-[var(--text-secondary)] mb-8">
            Join thousands who've turned their migration dreams into reality
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/roadmap/generate">
              <Button size="lg" magnetic>Generate Your Roadmap 🚀</Button>
            </Link>
            <Link href="/calculator">
              <Button size="lg" variant="secondary">Calculate Costs 💰</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
