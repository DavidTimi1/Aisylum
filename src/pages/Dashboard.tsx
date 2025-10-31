import { FileCheck, MessageSquare, File, Languages, ChevronRight, Shield, BotIcon, HelpCircleIcon, MessageSquareIcon, HomeIcon } from 'lucide-react';
import { CustomTooltip } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RecentActivity } from '@/components/dashboard/RecentActivity';

// Data Layer (Kept the same)
const dashboardData = {
  suggestions: [
    {
      id: 1,
      icon: MessageSquareIcon,
      title: 'Continue your application draft',
      description: "You were working on your asylum application yesterday. Let's finish it!",
      action: 'chat'
    },
    {
      id: 2,
      icon: FileCheck,
      title: 'Translate a new document',
      description: 'Need help understanding official papers? I can translate them for you.',
      action: 'documents'
    },
    {
      id: 3,
      icon: HomeIcon,
      title: 'Ask about local housing',
      description: 'Finding a new home can be tough. I can provide information and resources.',
      action: 'chat'
    }
  ],

  tools: [
    {
      id: 1,
      icon: MessageSquare,
      title: 'AI Chat',
      description: 'Ask questions and get information safely.',
      buttonText: 'Start New Chat',
      action: 'chat'
    },
    {
      id: 2,
      icon: File,
      title: 'Document Helper',
      description: 'Summarize documents or translate them to any language.',
      buttonText: 'Open Documents',
      action: 'documents'
    },
    {
      id: 3,
      icon: Languages,
      title: 'Language Tools',
      description: 'Translate text or practice a new language.',
      buttonText: 'Use Tools',
      action: 'language'
    }
  ],
  // recentActivity: [
  //   {
  //     id: 1,
  //     icon: MessageSquare,
  //     title: 'Conversation about local services',
  //     subtitle: 'AI Chat',
  //     timestamp: '2 hours ago'
  //   },
  //   {
  //     id: 2,
  //     icon: File,
  //     title: 'Draft for Asylum Application',
  //     subtitle: 'Document Helper',
  //     timestamp: '1 day ago'
  //   }
  // ]
};

const SuggestionCard = ({ icon: Icon, title, description, action }) => {
  const navigateTo = useNavigate();

  return (
    <button
      onClick={handleClick}
      className="group w-full cursor-pointer bg-background-alt hover:bg-background-alt-hover rounded-xl p-6 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="w-10 h-10 rounded-lg bg-foreground/10 flex items-center justify-center mb-4">
            <Icon className="w-5 h-5 text-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2 montserrat-font">
            {title}
          </h3>
          <p className="text-sm text-foreground-light leading-relaxed">
            {description}
          </p>
        </div>
        {/* Chevron: text-foreground-light */}
        <ChevronRight className="w-5 h-5 text-foreground-light ml-4 mt-2 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  )

  function handleClick() {
    navigateTo(action)
  }
}

const ToolCard = ({ icon: Icon, title, description, buttonText, destination }) => {
  const navigateTo = useNavigate();

  return (
    <div
      className="bg-background-alt rounded-xl p-6 border border-foreground/10"
    >
      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2 montserrat-font">
        {title}
      </h3>
      <p className="text-sm text-foreground-light mb-6 leading-relaxed">
        {description}
      </p>
      <Button
        onClick={handleClick}
        size="lg"
        className="w-full"
      >
        {buttonText}
      </Button>
    </div>
  )

  function handleClick() {
    navigateTo(destination)
  }
}

// Main Component
const Dashboard = () => {

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">

        <div className="text-center space-y-5 py-14">
          <h1 className="text-5xl font-bold text-foreground montserrat-font">
            Welcome to Aisylum
          </h1>
          <p className="text-md text-foreground">
            Your private AI assistant for support and information.
          </p>
          <div className="w-max mx-auto max-w-full">
            <div className="bg-primary/20 border border-primary/40 rounded-xl p-4 flex items-center gap-3">
              <div className="w-5 h-5 flex items-center justify-center relative">
                <Shield className='w-6 h-6 scale-150 relative' />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <BotIcon className='w-4 h-4' />
                </span>
              </div>
              <p className="text-sm text-foreground">
                <span className="font-semibold">Always Private & Offline.</span> {' '}
                Your data never leaves this device. {' '}
                <CustomTooltip>
                  Using Gemini Nano
                </CustomTooltip>
              </p>
            </div>
          </div>
        </div>

        <RecentActivity />

        {/* Suggestions Section */}
        <section>
          {/* Title: text-foreground */}
          <h2 className="text-2xl font-bold text-foreground mb-2 montserrat-font">
            What can I help you with today?
          </h2>
          {/* Subtitle: text-foreground-light */}
          <p className="text-foreground-light mb-6">
            Here are some suggestions based on your activity and common needs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dashboardData.suggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                icon={suggestion.icon}
                title={suggestion.title}
                description={suggestion.description}
                action={suggestion.action}
              />
            ))}
          </div>
        </section>

        {/* Tools Section */}
        <section>
          {/* Title: text-foreground */}
          <h2 className="text-2xl font-bold text-foreground mb-2 montserrat-font">
            All Aisylum Tools
          </h2>
          {/* Subtitle: text-foreground-light */}
          <p className="text-foreground-light mb-6">
            Explore the full range of features available to help you.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dashboardData.tools.map((tool) => (
              <ToolCard
                key={tool.id}
                icon={tool.icon}
                title={tool.title}
                description={tool.description}
                buttonText={tool.buttonText}
                destination={tool.action}
              />
            ))}
          </div>
        </section>

      </main>

    </div>
  );
};

export default Dashboard;