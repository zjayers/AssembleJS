import { Blueprint, BlueprintClient, events } from "asmbl";

interface TeamMember {
  name: string;
  position: string;
  experience: string;
  bio?: string;
}

export class MainClient extends Blueprint {
  private benefitCards: HTMLElement[] = [];
  private teamMembers: TeamMember[] = [
    {
      name: "Jane Doe",
      position: "CEO & Founder",
      experience: "15+ years in e-commerce",
      bio: "Jane founded AssembleJS Store with a vision to create an e-commerce platform that demonstrates modern web development practices."
    },
    {
      name: "John Smith",
      position: "CTO",
      experience: "Former tech lead at Major Corp",
      bio: "John brings his extensive tech leadership experience to ensure AssembleJS Store uses cutting-edge technologies efficiently."
    },
    {
      name: "Emily Johnson",
      position: "Head of Customer Relations",
      experience: "Expert in customer satisfaction",
      bio: "Emily ensures our customers receive the best possible service throughout their shopping journey."
    },
    {
      name: "Michael Brown",
      position: "Lead Developer",
      experience: "AssembleJS contributor",
      bio: "As an active contributor to the AssembleJS framework, Michael ensures our store showcases its full capabilities."
    }
  ];

  protected override onMount(): void {
    super.onMount();
    this.initBenefitCards();
    this.attachTeamMemberListeners();
    this.initCtaButton();
  }

  private initBenefitCards(): void {
    this.benefitCards = Array.from(document.querySelectorAll('.benefit-card'));
    
    // Add subtle animation to benefit cards on scroll
    if (window.IntersectionObserver) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = '1';
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      
      this.benefitCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transition = 'opacity 0.5s ease-in-out, transform 0.2s, box-shadow 0.2s';
        observer.observe(card);
      });
    }
  }

  private attachTeamMemberListeners(): void {
    const teamRows = document.querySelectorAll('.about-main table tr:not(:first-child)');
    
    teamRows.forEach((row, index) => {
      row.addEventListener('click', () => {
        const member = this.teamMembers[index];
        if (member && member.bio) {
          events.emit('showTeamMemberBio', { 
            name: member.name,
            position: member.position,
            bio: member.bio
          });
        }
      });
      
      // Add cursor pointer to indicate clickability
      row.classList.add('clickable-row');
    });
  }

  private initCtaButton(): void {
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
      ctaButton.addEventListener('click', (e) => {
        // Add analytics tracking for CTA button clicks
        events.emit('trackEvent', {
          category: 'About Page',
          action: 'CTA Click',
          label: 'Explore Products'
        });
      });
    }
  }
}

BlueprintClient.registerComponentCodeBehind(MainClient);