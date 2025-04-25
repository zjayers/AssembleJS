import React from 'react';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import SupportedLanguages from '../components/home/SupportedLanguages';
import Comparison from '../components/home/Comparison';
import { Helmet } from 'react-helmet';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>AssembleJS - Build Modern Micro-Frontend Applications</title>
        <meta name="description" content="AssembleJS is a framework for building modern micro-frontend applications with support for multiple JavaScript frameworks." />
      </Helmet>
      <main role="main">
        <Hero />
        <Features />
        <SupportedLanguages />
        <Comparison />
      </main>
    </>
  );
};

export default HomePage;