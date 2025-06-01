import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export const initHomeAnimations = () => {
  // Hero animations
  const heroTl = gsap.timeline();
  heroTl.fromTo('.hero-title', 
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
  )
  .fromTo('.hero-description', 
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
    "-=0.6"
  )
  .fromTo('.hero-cta',
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.2 },
    "-=0.6"
  )
  .fromTo('.hero-stat',
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.2 },
    "-=0.4"
  );
  
  // About section
  gsap.fromTo('#about .section-title', 
    { y: 30, opacity: 0 },
    { 
      scrollTrigger: {
        trigger: '#about',
        start: 'top 80%'
      },
      y: 0, 
      opacity: 1, 
      duration: 0.8, 
      ease: "power3.out" 
    }
  );
  
  gsap.fromTo('#about .section-description', 
    { y: 30, opacity: 0 },
    { 
      scrollTrigger: {
        trigger: '#about',
        start: 'top 75%'
      },
      y: 0, 
      opacity: 1, 
      duration: 0.8, 
      ease: "power3.out",
      delay: 0.2
    }
  );
  
  // Features section
  const features = document.querySelectorAll('.feature-card');
  features.forEach((feature, index) => {
    gsap.fromTo(feature,
      { y: 30, opacity: 0 },
      {
        scrollTrigger: {
          trigger: feature,
          start: 'top 85%'
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        delay: index * 0.2
      }
    );
  });
  
  // How it works section
  const steps = document.querySelectorAll('.step-card');
  steps.forEach((step, index) => {
    gsap.fromTo(step,
      { y: 30, opacity: 0 },
      {
        scrollTrigger: {
          trigger: step,
          start: 'top 85%'
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        delay: index * 0.2
      }
    );
  });
  
  // Roadmap section
  const roadmapItems = document.querySelectorAll('.roadmap-item');
  roadmapItems.forEach((item, index) => {
    gsap.fromTo(item,
      { x: index % 2 === 0 ? -30 : 30, opacity: 0 },
      {
        scrollTrigger: {
          trigger: item,
          start: 'top 85%'
        },
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        delay: index * 0.2
      }
    );
  });
}; 