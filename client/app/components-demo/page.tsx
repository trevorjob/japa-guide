'use client';

import { useState } from 'react';
import {
  Button,
  Input,
  Toggle,
  Select,
  RadioGroup,
  Dialog,
  Tabs,
  Spinner,
  Card,
} from '@/components/ui';

export default function ComponentsShowcase() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toggleEnabled, setToggleEnabled] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('jp');
  const [selectedPurpose, setSelectedPurpose] = useState('study');
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)]">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] bg-clip-text text-transparent">
            Headless UI Components
          </h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            Built with @headlessui/react + Framer Motion
          </p>
        </div>

        {/* Buttons */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="accent">Accent Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="primary" magnetic>
              Magnetic Effect
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
          </div>
        </Card>

        {/* Inputs */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Inputs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              description="Must be at least 8 characters"
            />
            <Input
              label="With Error"
              type="text"
              error="This field is required"
            />
            <Input label="Disabled" type="text" disabled placeholder="Disabled input" />
          </div>
        </Card>

        {/* Toggle Switches */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Toggle Switches</h2>
          <div className="space-y-4">
            <Toggle
              enabled={toggleEnabled}
              onChange={setToggleEnabled}
              label="Email Notifications"
              description="Receive email updates about your visa application"
            />
            <Toggle
              enabled={false}
              onChange={() => {}}
              label="Dark Mode"
              description="Switch to dark theme"
            />
            <Toggle
              enabled={true}
              onChange={() => {}}
              label="Auto Save"
              disabled
            />
          </div>
        </Card>

        {/* Select Dropdown */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Select Dropdown</h2>
          <Select
            value={selectedCountry}
            onChange={setSelectedCountry}
            label="Select Country"
            description="Choose your destination country"
            options={[
              { value: 'jp', label: '🇯🇵 Japan', icon: '🗾' },
              { value: 'ca', label: '🇨🇦 Canada', icon: '🍁' },
              { value: 'de', label: '🇩🇪 Germany', icon: '🍺' },
              { value: 'au', label: '🇦🇺 Australia', icon: '🦘' },
              { value: 'uk', label: '🇬🇧 United Kingdom', icon: '☕' },
            ]}
          />
        </Card>

        {/* Radio Group */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Radio Group</h2>
          <RadioGroup
            value={selectedPurpose}
            onChange={setSelectedPurpose}
            label="Migration Purpose"
            options={[
              {
                value: 'work',
                label: 'Work',
                description: 'Employment and career opportunities',
                icon: '💼',
              },
              {
                value: 'study',
                label: 'Study',
                description: 'Education and academic programs',
                icon: '🎓',
              },
              {
                value: 'family',
                label: 'Family',
                description: 'Family reunification',
                icon: '👨‍👩‍👧‍👦',
              },
            ]}
          />
        </Card>

        {/* Tabs */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Tabs</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4">
                Pills Variant
              </h3>
              <Tabs
                variant="pills"
                tabs={[
                  {
                    label: 'Overview',
                    icon: '📊',
                    content: (
                      <div className="p-4 rounded-xl bg-[var(--bg-secondary)]">
                        <p>Overview content goes here</p>
                      </div>
                    ),
                  },
                  {
                    label: 'Requirements',
                    icon: '📋',
                    content: (
                      <div className="p-4 rounded-xl bg-[var(--bg-secondary)]">
                        <p>Requirements content goes here</p>
                      </div>
                    ),
                  },
                  {
                    label: 'Timeline',
                    icon: '⏱️',
                    content: (
                      <div className="p-4 rounded-xl bg-[var(--bg-secondary)]">
                        <p>Timeline content goes here</p>
                      </div>
                    ),
                  },
                ]}
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4">
                Underline Variant
              </h3>
              <Tabs
                variant="underline"
                tabs={[
                  { label: 'Profile', content: <p>Profile content</p> },
                  { label: 'Settings', content: <p>Settings content</p> },
                  { label: 'Billing', content: <p>Billing content</p> },
                ]}
              />
            </div>
          </div>
        </Card>

        {/* Dialog */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Dialog / Modal</h2>
          <div className="flex gap-4">
            <Button onClick={() => setIsDialogOpen(true)}>Open Dialog</Button>
          </div>
        </Card>

        {/* Loading States */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Loading States</h2>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <Spinner className="text-[var(--primary-from)]" />
              <p className="text-sm mt-2 text-[var(--text-secondary)]">Spinner</p>
            </div>
            <div className="text-center">
              <Spinner className="w-12 h-12 text-[var(--accent-primary)]" />
              <p className="text-sm mt-2 text-[var(--text-secondary)]">Large</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Dialog Example */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Example Dialog"
        description="This is a modal dialog built with Headless UI"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-[var(--text-secondary)]">
            This modal uses Headless UI Dialog component with Framer Motion animations.
            It includes a glassmorphic background and follows your design system.
          </p>
          <Input label="Full Name" placeholder="Enter your name" />
          <Input label="Email" type="email" placeholder="you@example.com" />
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsDialogOpen(false)}>
              Submit
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
