import React, { useState } from 'react';

const features = [
  {
    id: 1,
    title: 'Smart search with fuzzy matching and recent searches',
    description: 'Find dependencies quickly with intelligent search that remembers your previous searches and finds close matches even with typos.',
    category: 'usability'
  },
  {
    id: 2,
    title: 'Gamified learning path for dependency management concepts',
    description: 'Learn complex dependency management concepts through interactive exercises and earn badges as you progress.',
    category: 'education'
  },
  {
    id: 3,
    title: 'Accessibility mode with high-contrast and screen reader support',
    description: 'Make JIRA-PINN accessible to all users with enhanced visual options and screen reader compatibility.',
    category: 'accessibility'
  },
  {
    id: 4,
    title: 'One-click feedback and bug reporting system',
    description: 'Report issues or suggest improvements instantly with our streamlined feedback system.',
    category: 'usability'
  },
  {
    id: 5,
    title: 'Interactive onboarding tour with animated tooltips',
    description: 'Get started quickly with a guided tour that shows you how to use all key features.',
    category: 'usability'
  },
  {
    id: 6,
    title: 'Create advanced "What-if" scenario modeling for dependency resequencing',
    description: 'Test different scheduling and sequencing options to find the optimal workflow for your dependencies.',
    category: 'analysis'
  },
  {
    id: 7,
    title: 'Develop automated negotiation system for inter-team dependency resolution',
    description: 'Reduce manual coordination with an AI-powered system that helps teams negotiate dependency priorities.',
    category: 'automation'
  },
  {
    id: 8,
    title: 'Add natural language processing to discover implicit dependencies',
    description: 'Identify hidden dependencies in your documentation and communications that might affect your project.',
    category: 'ai'
  },
  {
    id: 9,
    title: 'Implement full Universal Differential Equations for complex dependency modeling',
    description: 'Utilize cutting-edge scientific machine learning to model the most complex dependency relationships with unprecedented accuracy.',
    category: 'ai'
  }
];

export default function FeaturesRoadmap() {
  const [showAll, setShowAll] = useState(false);
  const displayedFeatures = showAll ? features : features.slice(0, 8);

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-center">Upcoming Features</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedFeatures.map(feature => (
          <div 
            key={feature.id}
            className="bg-primary/5 hover:bg-primary/10 transition-colors duration-200 
                       p-4 rounded-lg border border-primary/20 cursor-pointer"
          >
            <h3 className="font-medium text-primary">{feature.title}</h3>
            <p className="text-sm mt-2 text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 
                     rounded-md transition-colors duration-200 text-primary"
        >
          <span>{showAll ? 'Show less' : 'Show more'}</span>
          <i className="material-icons text-sm">
            {showAll ? 'expand_less' : 'expand_more'}
          </i>
        </button>
      </div>
    </div>
  );
}