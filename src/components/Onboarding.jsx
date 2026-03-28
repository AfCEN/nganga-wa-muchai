import { useState } from 'react';
import { X, GitBranch, PlusCircle, Users, MessageCircle } from 'lucide-react';

const STEPS = [
  {
    icon: GitBranch,
    title: 'Welcome to the Family Archive',
    description: 'This is a living record of the Nganga wa Muchai family. Explore the family tree, read stories, and discover your heritage.',
  },
  {
    icon: Users,
    title: 'Explore the Family Tree',
    description: 'Click on any person in the graph to see their details, connections, and stories. Zoom and pan to navigate.',
  },
  {
    icon: PlusCircle,
    title: 'Contribute to the Tree',
    description: 'Sign in to add people, stories, events, and connections. Every contribution helps preserve our family history.',
  },
  {
    icon: MessageCircle,
    title: 'Invite Family Members',
    description: 'Use the invite button to generate a link and share it with family members via WhatsApp or any messenger.',
  },
];

export default function Onboarding() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('onboarding_done') === 'true'
  );
  const [step, setStep] = useState(0);

  if (dismissed) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  const finish = () => {
    localStorage.setItem('onboarding_done', 'true');
    setDismissed(true);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={finish} />

      <div className="relative w-full max-w-md bg-[#1a1a2e] border border-[#e2c275]/15 rounded-2xl shadow-2xl overflow-hidden">
        {/* Close */}
        <button
          onClick={finish}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all z-10"
        >
          <X size={16} />
        </button>

        {/* Content */}
        <div className="px-8 pt-10 pb-6 text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#e2c275]/20 to-[#e2c275]/5 flex items-center justify-center">
            <Icon size={28} className="text-[#e2c275]" />
          </div>
          <h2
            className="text-xl text-white mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {current.title}
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            {current.description}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 pb-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? 'bg-[#e2c275] w-6' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-8 pb-8">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-2.5 text-sm text-gray-400 border border-white/10 rounded-lg hover:border-white/20 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={isLast ? finish : () => setStep(step + 1)}
            className="flex-1 py-2.5 bg-[#e2c275] text-[#1a1a2e] rounded-lg font-semibold text-sm hover:bg-[#f0d68a] transition-all"
          >
            {isLast ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
