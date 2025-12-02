'use client';

import { Tab as HeadlessTab, TabGroup, TabList, TabPanels, TabPanel } from '@headlessui/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TabItem {
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultIndex?: number;
  onChange?: (index: number) => void;
  variant?: 'pills' | 'underline';
  className?: string;
}

export const Tabs = ({
  tabs,
  defaultIndex = 0,
  onChange,
  variant = 'pills',
  className,
}: TabsProps) => {
  return (
    <TabGroup defaultIndex={defaultIndex} onChange={onChange}>
      <TabList
        className={cn(
          'flex gap-2',
          variant === 'underline' && 'border-b border-[var(--bg-tertiary)]',
          className
        )}
      >
        {tabs.map((tab, index) => (
          <HeadlessTab
            key={index}
            className={({ selected }) =>
              cn(
                'relative px-4 py-2.5 text-sm font-medium transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-from)] focus-visible:ring-offset-2',
                variant === 'pills' && [
                  'rounded-full',
                  selected
                    ? 'bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] text-white shadow-glow-primary'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]',
                ],
                variant === 'underline' && [
                  'border-b-2',
                  selected
                    ? 'border-[var(--primary-from)] text-[var(--primary-from)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                ]
              )
            }
          >
            {({ selected }) => (
              <div className="flex items-center gap-2">
                {tab.icon}
                <span>{tab.label}</span>
                {variant === 'underline' && selected && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary-from)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
            )}
          </HeadlessTab>
        ))}
      </TabList>

      <TabPanels className="mt-4">
        {tabs.map((tab, index) => (
          <TabPanel
            key={index}
            as={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="focus:outline-none"
          >
            {tab.content}
          </TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
};

Tabs.displayName = 'Tabs';
