import React from 'react';
import './Features.css';
import InfinityStones from './InfinityStones';

const Features = () => {
  // Define our features data
  const features = [
    {
      title: "Framework Agnostic",
      description: "Use any framework you prefer - React, Vue, Svelte, or simple HTML. Mix and match within the same application.",
      iconClass: "icon-1",
      icon: "⚛️"
    },
    {
      title: "Server-Side Rendering",
      description: "Built-in SSR capabilities for all supported frameworks, with client-side hydration for a seamless experience.",
      iconClass: "icon-2",
      icon: "🖥️"
    },
    {
      title: "Modular Architecture",
      description: "Compose applications from independent, reusable components that can be developed and deployed separately.",
      iconClass: "icon-3",
      icon: "🧩"
    },
    {
      title: "TypeScript Ready",
      description: "First-class TypeScript support with rich type definitions for all APIs, ensuring type safety across your codebase.",
      iconClass: "icon-4",
      icon: "📝"
    },
    {
      title: "Developer Tools",
      description: "Built-in developer experience features including automatic reloading, performance insights, and intuitive debugging.",
      iconClass: "icon-5",
      icon: "🔧"
    },
    {
      title: "Event System",
      description: "Powerful event communication system that enables components to interact while maintaining loose coupling.",
      iconClass: "icon-6",
      icon: "📡"
    }
  ];

  return (
    <section id="features" className="features" aria-labelledby="features-heading">
      <InfinityStones />
      <div className="container">
        <h2 id="features-heading" className="section-title">Features</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <article 
              className="feature-card"
              key={index}
            >
              <div className={`feature-icon ${feature.iconClass}`} aria-hidden="true">
                <span className="feature-emoji">{feature.icon}</span>
              </div>
              <h3 id={`feature-${index + 1}-heading`}>{feature.title}</h3>
              <p id={`feature-${index + 1}-description`} aria-labelledby={`feature-${index + 1}-heading`}>
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;