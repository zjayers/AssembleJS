import React from 'react';
import './SupportedLanguages.css';

const SupportedLanguages = () => {
  const frameworks = [
    {
      name: 'HTML',
      url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
      logo: (
        <i className="devicon-html5-plain colored" aria-hidden="true"></i>
      ),
      color: '#E44D26'
    },
    {
      name: 'JavaScript',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      logo: (
        <i className="devicon-javascript-plain colored" aria-hidden="true"></i>
      ),
      color: '#F7DF1E'
    },
    {
      name: 'TypeScript',
      url: 'https://www.typescriptlang.org/',
      logo: (
        <i className="devicon-typescript-plain colored" aria-hidden="true"></i>
      ),
      color: '#3178C6'
    },
    {
      name: 'CSS',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
      logo: (
        <i className="devicon-css3-plain colored" aria-hidden="true"></i>
      ),
      color: '#1572B6'
    },
    {
      name: 'SASS',
      url: 'https://sass-lang.com',
      logo: (
        <i className="devicon-sass-original colored" aria-hidden="true"></i>
      ),
      color: '#CC6699'
    },
    {
      name: 'Markdown',
      url: 'https://daringfireball.net/projects/markdown',
      logo: (
        <i className="devicon-markdown-original colored" aria-hidden="true"></i>
      ),
      color: '#000000'
    },
    {
      name: 'React',
      url: 'https://react.dev',
      logo: (
        <i className="devicon-react-original colored" aria-hidden="true"></i>
      ),
      color: '#61DAFB'
    },
    {
      name: 'Vue',
      url: 'https://vuejs.org',
      logo: (
        <i className="devicon-vuejs-plain colored" aria-hidden="true"></i>
      ),
      color: '#4FC08D'
    },
    {
      name: 'Svelte',
      url: 'https://svelte.dev',
      logo: (
        <i className="devicon-svelte-plain colored" aria-hidden="true"></i>
      ),
      color: '#FF3E00'
    },
    {
      name: 'Many More',
      url: 'https://github.com/zjayers/assemblejs',
      logo: (
        <div className="more-icon">
          <span>+</span>
        </div>
      ),
      color: 'var(--primary-color)'
    }
  ];

  return (
    <section className="languages" aria-labelledby="languages-heading">
      <div className="container">
        <h2 id="languages-heading" className="section-title">Supported Languages & Frameworks</h2>
        <div className="language-description">
          <p>
            AssembleJS supports multiple frontend frameworks and template languages, allowing you to use the best tool for each component.
            Mix and match these technologies within the same application without compatibility issues.
          </p>
        </div>
        <div className="languages-grid">
          {frameworks.map((framework, index) => (
            <a 
              href={framework.url} 
              className="language-card" 
              key={index} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label={`${framework.name} (opens in a new tab)`}
            >
              <div className="language-icon" style={{ color: framework.color }} aria-hidden="true">
                {framework.logo}
              </div>
              <h3 id={`language-${index + 1}`}>{framework.name}</h3>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SupportedLanguages;