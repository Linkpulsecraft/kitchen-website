// ======================
// MAIN DOCUMENT READY
// ======================
document.addEventListener('DOMContentLoaded', function() {
  // Hide preloader when everything is loaded
  window.addEventListener('load', function() {
    document.querySelector('.preloader').style.opacity = '0';
    document.querySelector('.preloader').style.visibility = 'hidden';
    initAllAnimations();
  });

  // Mobile menu toggle
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      document.querySelector('.nav-links').classList.toggle('active');
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });

  // Initialize animations that don't need full page load
  initParticleCanvas();
  initClientMarquee();
});

// ======================
// INITIALIZE ALL ANIMATIONS
// ======================
function initAllAnimations() {
  initScrollAnimations();
  initCountingAnimation();
  initProcessArrowAnimation();
  initFormHandler();
}

// ======================
// PARTICLE CANVAS ANIMATION
// ======================
function initParticleCanvas() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight * 0.8;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Particle class
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3 + 1;
      this.speedX = Math.random() * 3 - 1.5;
      this.speedY = Math.random() * 3 - 1.5;
      this.color = `rgba(255, 255, 255, ${Math.random() * 0.6 + 0.1})`;
      this.originalX = this.x;
      this.originalY = this.y;
      this.density = Math.random() * 30 + 1;
    }

    update(mouse) {
      // Mouse interaction
      if (mouse.x && mouse.y) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const maxDistance = 100;
        const force = (maxDistance - distance) / maxDistance;
        const directionX = forceDirectionX * force * this.density * 0.6;
        const directionY = forceDirectionY * force * this.density * 0.6;

        if (distance < maxDistance) {
          this.x -= directionX;
          this.y -= directionY;
        } else {
          if (this.x !== this.originalX) {
            const dx = this.originalX - this.x;
            this.x += dx / 10;
          }
          if (this.y !== this.originalY) {
            const dy = this.originalY - this.y;
            this.y += dy / 10;
          }
        }
      }

      // Boundary check
      if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
      if (this.y > canvas.height || this.y < 0) this.speedY *= -1;

      this.x += this.speedX;
      this.y += this.speedY;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  // Create particles
  const particles = [];
  const particleCount = window.innerWidth < 768 ? 30 : 100;
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Mouse interaction
  const mouse = {
    x: null,
    y: null
  };

  window.addEventListener('mousemove', function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
  });

  window.addEventListener('mouseout', function() {
    mouse.x = undefined;
    mouse.y = undefined;
  });

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update(mouse);
      particles[i].draw();
    }
    
    // Connect particles
    connectParticles();
    requestAnimationFrame(animate);
  }

  // Connect particles with lines
  function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance/100})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  // Handle resize
  function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.8;
  }

  window.addEventListener('resize', handleResize);
  animate();
}

// ======================
// CLIENTS MARQUEE ANIMATION
// ======================
function initClientMarquee() {
  const marqueeTrack = document.querySelector('.marquee-track');
  if (!marqueeTrack) return;

  // Duplicate items for seamless looping
  const items = marqueeTrack.querySelectorAll('.marquee-item');
  items.forEach(item => {
    const clone = item.cloneNode(true);
    marqueeTrack.appendChild(clone);
  });

  // Animation
  let position = 0;
  const speed = 1;

  function animateMarquee() {
    position -= speed;
    if (position <= -marqueeTrack.scrollWidth / 2) {
      position = 0;
    }
    marqueeTrack.style.transform = `translateX(${position}px)`;
    requestAnimationFrame(animateMarquee);
  }

  animateMarquee();
}

// ======================
// SCROLL ANIMATIONS OBSERVER
// ======================
function initScrollAnimations() {
  const animateOnScroll = (elements, animationClass) => {
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(animationClass);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    elements.forEach(element => {
      observer.observe(element);
    });
  };

  // Animate service cards
  const serviceCards = document.querySelectorAll('.service-card');
  animateOnScroll(serviceCards, 'animate-fade-up');

  // Animate process steps
  const processSteps = document.querySelectorAll('.process-step');
  animateOnScroll(processSteps, 'animate-fade-in');

  // Animate testimonials
  const testimonials = document.querySelectorAll('.testimonial-card');
  animateOnScroll(testimonials, 'animate-scale-in');
}

// ======================
// COUNTING ANIMATION FOR RESULTS
// ======================
function initCountingAnimation() {
  const resultCards = document.querySelectorAll('.result-card');
  if (!resultCards.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const valueElement = entry.target.querySelector('.result-value');
        const targetValue = parseInt(valueElement.textContent);
        const suffix = valueElement.textContent.match(/\D+$/)?.[0] || '';
        const duration = 2000; // 2 seconds
        const startTime = performance.now();

        function updateCount(currentTime) {
          const elapsedTime = currentTime - startTime;
          const progress = Math.min(elapsedTime / duration, 1);
          const easedProgress = easeOutQuad(progress);
          const currentValue = Math.floor(easedProgress * targetValue);
          
          valueElement.textContent = currentValue + suffix;
          
          if (progress < 1) {
            requestAnimationFrame(updateCount);
          }
        }

        requestAnimationFrame(updateCount);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  resultCards.forEach(card => {
    observer.observe(card);
  });

  // Easing function for smooth animation
  function easeOutQuad(t) {
    return t * (2 - t);
  }
}

// ======================
// ENHANCED PROCESS ARROW ANIMATION
// ======================
function initProcessArrowAnimation() {
  const processSection = document.querySelector('.process');
  if (!processSection) return;

  // Create SVG container
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute('class', 'process-arrow-svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.position = 'absolute';
  svg.style.top = '0';
  svg.style.left = '0';
  svg.style.zIndex = '0';
  svg.style.overflow = 'visible';
  processSection.appendChild(svg);

  // Add glow filter definition
  const defs = document.createElementNS(svgNS, "defs");
  
  // Arrow glow filter
  const arrowGlow = document.createElementNS(svgNS, "filter");
  arrowGlow.setAttribute('id', 'arrow-glow');
  arrowGlow.setAttribute('x', '-30%');
  arrowGlow.setAttribute('y', '-30%');
  arrowGlow.setAttribute('width', '160%');
  arrowGlow.setAttribute('height', '160%');
  
  const feGaussianBlur = document.createElementNS(svgNS, "feGaussianBlur");
  feGaussianBlur.setAttribute('stdDeviation', '4');
  feGaussianBlur.setAttribute('result', 'blur');
  
  const feComposite = document.createElementNS(svgNS, "feComposite");
  feComposite.setAttribute('in', 'SourceGraphic');
  feComposite.setAttribute('in2', 'blur');
  feComposite.setAttribute('operator', 'over');
  
  arrowGlow.appendChild(feGaussianBlur);
  arrowGlow.appendChild(feComposite);
  defs.appendChild(arrowGlow);

  // Circle gradient animation
  const circleGradient = document.createElementNS(svgNS, "linearGradient");
  circleGradient.setAttribute('id', 'circle-gradient');
  circleGradient.setAttribute('x1', '0%');
  circleGradient.setAttribute('y1', '0%');
  circleGradient.setAttribute('x2', '100%');
  circleGradient.setAttribute('y2', '100%');
  
  const stop1 = document.createElementNS(svgNS, "stop");
  stop1.setAttribute('offset', '0%');
  stop1.setAttribute('stop-color', '#00F5D4');
  stop1.setAttribute('stop-opacity', '1');
  
  const stop2 = document.createElementNS(svgNS, "stop");
  stop2.setAttribute('offset', '50%');
  stop2.setAttribute('stop-color', '#FF4D4D');
  stop2.setAttribute('stop-opacity', '1');
  
  const stop3 = document.createElementNS(svgNS, "stop");
  stop3.setAttribute('offset', '100%');
  stop3.setAttribute('stop-color', '#00F5D4');
  stop3.setAttribute('stop-opacity', '1');
  
  circleGradient.appendChild(stop1);
  circleGradient.appendChild(stop2);
  circleGradient.appendChild(stop3);
  defs.appendChild(circleGradient);

  svg.appendChild(defs);

  // Get step positions
  const steps = document.querySelectorAll('.process-step');
  if (steps.length < 4) return;

  // Store step positions and elements
  const stepData = [];
  steps.forEach((step, index) => {
    const numberElement = step.querySelector('.step-number');
    if (numberElement) {
      const rect = numberElement.getBoundingClientRect();
      const sectionRect = processSection.getBoundingClientRect();
      
      // Center of the step number circle
      const x = rect.left + rect.width / 2 - sectionRect.left;
      const y = rect.top + rect.height / 2 - sectionRect.top;
      const radius = rect.width / 2;
      
      stepData.push({
        element: numberElement,
        x,
        y,
        radius,
        index: index + 1
      });
    }
  });

  // Create guiding arrow path
  const arrowPath = document.createElementNS(svgNS, "path");
  arrowPath.setAttribute('class', 'arrow-path');
  arrowPath.setAttribute('stroke', 'url(#circle-gradient)');
  arrowPath.setAttribute('stroke-width', '4');
  arrowPath.setAttribute('fill', 'none');
  arrowPath.setAttribute('stroke-linecap', 'round');
  arrowPath.setAttribute('stroke-linejoin', 'round');
  arrowPath.setAttribute('stroke-dasharray', '10,5');
  arrowPath.style.filter = 'url(#arrow-glow)';
  svg.appendChild(arrowPath);

  // Create animated arrowhead
  const arrowhead = document.createElementNS(svgNS, "polygon");
  arrowhead.setAttribute('points', '0,0 12,6 0,12');
  arrowhead.setAttribute('fill', 'url(#circle-gradient)');
  arrowhead.style.filter = 'url(#arrow-glow)';
  arrowhead.style.transformOrigin = 'center';
  svg.appendChild(arrowhead);

  // Create gradient circles around numbers
  stepData.forEach(step => {
    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute('cx', step.x);
    circle.setAttribute('cy', step.y);
    circle.setAttribute('r', step.radius + 5);
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', 'url(#circle-gradient)');
    circle.setAttribute('stroke-width', '3');
    circle.setAttribute('stroke-dasharray', '20,30');
    circle.style.filter = 'url(#arrow-glow)';
    circle.setAttribute('class', `step-circle step-circle-${step.index}`);
    svg.appendChild(circle);
  });

  // Calculate the guiding path
  const calculatePath = () => {
    const points = stepData.map(step => ({ x: step.x, y: step.y }));
    
    if (points.length === 4) {
      // Create a smooth flowing path through all points
      const pathData = `
        M ${points[0].x},${points[0].y}
        C ${points[0].x + 100},${points[0].y} 
          ${points[1].x - 100},${points[1].y} 
          ${points[1].x},${points[1].y}
        S ${points[2].x + 100},${points[2].y} 
          ${points[2].x},${points[2].y}
        S ${points[3].x - 100},${points[3].y} 
          ${points[3].x},${points[3].y}
      `;
      arrowPath.setAttribute('d', pathData);
    }
  };

  // Animation variables
  let animationId;
  let pathLength;
  let startTime;
  const duration = 10000; // 10 seconds for full animation
  let isAnimating = false;

  // Animate the arrow along the path
  const animateArrow = () => {
    pathLength = arrowPath.getTotalLength();
    startTime = performance.now();
    isAnimating = true;
    
    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = (elapsedTime % duration) / duration;
      
      // Ease in/out for each segment between steps
      const segmentProgress = (progress * 3) % 1;
      const easedProgress = easeInOutQuad(segmentProgress);
      const currentSegment = Math.floor(progress * 3);
      const globalProgress = (currentSegment + easedProgress) / 3;
      
      const distance = globalProgress * pathLength;
      const point = arrowPath.getPointAtLength(distance);
      const nextPoint = arrowPath.getPointAtLength(distance + 1);
      const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * 180 / Math.PI;
      
      // Position and rotate arrowhead
      arrowhead.setAttribute('transform', `translate(${point.x},${point.y}) rotate(${angle})`);
      
      // Highlight current step
      const currentStepIndex = Math.floor(progress * 4) % 4;
      highlightStep(currentStepIndex, segmentProgress);
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
  };

  // Highlight the current step with enhanced effects
  const highlightStep = (index, progress) => {
    stepData.forEach((step, i) => {
      const circle = document.querySelector(`.step-circle-${step.index}`);
      
      if (i === index) {
        // Intensify the current step's circle
        circle.setAttribute('stroke-width', '4');
        circle.setAttribute('stroke-dashoffset', -progress * 50);
        
        // Add pulsing effect
        const pulseScale = 1 + 0.1 * Math.sin(progress * Math.PI * 2);
        circle.style.transform = `scale(${pulseScale})`;
        
        // Add glow to number
        step.element.style.boxShadow = '0 0 15px rgba(0, 245, 212, 0.7)';
      } else {
        // Reset other steps
        circle.setAttribute('stroke-width', '3');
        circle.setAttribute('stroke-dashoffset', '0');
        circle.style.transform = 'scale(1)';
        step.element.style.boxShadow = 'none';
      }
    });
  };

  // Animate the gradient stripes around numbers
  const animateGradientStripes = () => {
    stepData.forEach(step => {
      const circle = document.querySelector(`.step-circle-${step.index}`);
      let rotation = 0;
      
      const animateCircle = () => {
        rotation = (rotation + 0.5) % 360;
        circle.setAttribute('stroke-dashoffset', rotation);
        requestAnimationFrame(animateCircle);
      };
      
      animateCircle();
    });
  };

  // Easing function
  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  // Initialize and handle resize
  const initAnimation = () => {
    calculatePath();
    animateArrow();
    animateGradientStripes();
  };

  // Start animation when section is in view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!isAnimating) {
          initAnimation();
        }
      } else {
        cancelAnimationFrame(animationId);
        isAnimating = false;
      }
    });
  }, { threshold: 0.1 });

  observer.observe(processSection);

  // Handle window resize
  window.addEventListener('resize', () => {
    cancelAnimationFrame(animationId);
    isAnimating = false;
    calculatePath();
    if (processSection.getBoundingClientRect().top < window.innerHeight * 0.8) {
      initAnimation();
    }
  });
}

// ======================
// FORM SUBMISSION HANDLER
// ======================
function initFormHandler() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const submitButton = this.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    
    try {
      submitButton.textContent = 'Sending...';
      submitButton.disabled = true;
      
      // Simulate API call (replace with actual fetch)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      submitButton.textContent = 'Message Sent!';
      this.reset();
      
      setTimeout(() => {
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      submitButton.textContent = 'Error - Try Again';
      setTimeout(() => {
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
      }, 3000);
    }
  });
}