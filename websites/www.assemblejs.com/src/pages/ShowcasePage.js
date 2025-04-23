import React from 'react';
import { Helmet } from 'react-helmet';

const ShowcasePage = () => {
  // Sample showcase projects (this would come from a real API or data source in a production app)
  const showcaseProjects = [
    {
      id: 1,
      title: 'E-commerce Storefront',
      description: 'A high-performance e-commerce storefront built with AssembleJS components.',
      image: 'https://via.placeholder.com/600x300',
      url: 'https://github.com/zjayers/assemblejs',
      tags: ['E-commerce', 'React', 'SSR']
    },
    {
      id: 2,
      title: 'Marketing Landing Page',
      description: 'Fast, SEO-optimized landing page with minimal JavaScript.',
      image: 'https://via.placeholder.com/600x300',
      url: 'https://github.com/zjayers/assemblejs',
      tags: ['Marketing', 'Static', 'SEO']
    },
    {
      id: 3,
      title: 'Blog Platform',
      description: 'Content-focused blog with Markdown support and partial hydration.',
      image: 'https://via.placeholder.com/600x300',
      url: 'https://github.com/zjayers/assemblejs',
      tags: ['Blog', 'Content', 'Markdown']
    },
    {
      id: 4,
      title: 'Dashboard Application',
      description: 'Data-rich dashboard with interactive visualizations and admin controls.',
      image: 'https://via.placeholder.com/600x300',
      url: 'https://github.com/zjayers/assemblejs',
      tags: ['Dashboard', 'Interactive', 'Data Viz']
    },
    {
      id: 5,
      title: 'Portfolio Site',
      description: 'Personal portfolio showcasing projects with minimal JavaScript.',
      image: 'https://via.placeholder.com/600x300',
      url: 'https://github.com/zjayers/assemblejs',
      tags: ['Portfolio', 'Static', 'Personal']
    },
    {
      id: 6,
      title: 'Documentation Portal',
      description: 'Technical documentation with search, navigation, and code syntax highlighting.',
      image: 'https://via.placeholder.com/600x300',
      url: 'https://github.com/zjayers/assemblejs',
      tags: ['Documentation', 'Markdown', 'Search']
    },
  ];

  return (
    <>
      <Helmet>
        <title>Showcase | AssembleJS</title>
        <meta name="description" content="Browse examples of real-world projects built with our framework." />
      </Helmet>
      <div className="container">
        <main className="showcase" role="main">
          <h1 className="section-title" id="showcase-heading">Showcase</h1>
          <p className="showcase-intro" aria-labelledby="showcase-heading">
            Discover what's possible with AssembleJS. Browse examples of real-world projects built with our framework.
          </p>
          
          <div className="showcase-grid" role="region" aria-label="Showcase projects">
            {showcaseProjects.map(project => (
              <article className="showcase-card" key={project.id}>
                <img 
                  src={project.image} 
                  alt={`Screenshot of ${project.title}`} 
                  className="showcase-image" 
                />
                <div className="showcase-content">
                  <h2 className="showcase-title" id={`project-${project.id}-title`}>{project.title}</h2>
                  <p className="showcase-description" id={`project-${project.id}-description`} aria-labelledby={`project-${project.id}-title`}>
                    {project.description}
                  </p>
                  <div 
                    className="showcase-tags" 
                    aria-label={`Technologies used in ${project.title}`}
                  >
                    {project.tags.map((tag, index) => (
                      <span className="showcase-tag" key={index}>{tag}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default ShowcasePage;