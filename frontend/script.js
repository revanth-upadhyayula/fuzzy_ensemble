document.addEventListener('DOMContentLoaded', () => {
  // GSAP Animations
  const tl = gsap.timeline();
  tl.from("#fuzzy-ensemble .card", {
      y: 100,
      opacity: 0,
      scale: 1,
      duration: 0.5,
      stagger: 0.8,
      ease: "expo.out",
      scrollTrigger: {
          trigger: "#page2",
          scroller: "body",
          start: "top top",
          end: "bottom -100%",
          scrub: 1,
          pin: true,
      }
  });

  tl.from(".step", {
      x: -100,
      opacity: 0,
      duration: 1,
      stagger: 1,
      ease: "power2.out",
      scrollTrigger: {
          trigger: "#page3",
          scroller: "body",
          start: "top top",
          end: "bottom 20%",
          scrub: 1,
          pin: true
      }
  });

  // Particles.js
  particlesJS("particles-js", {
      particles: {
          number: { value: 100, density: { enable: true, value_area: 800 } },
          color: { value: "#ffffff" },
          shape: { type: "circle" },
          opacity: { value: 0.5, random: true },
          size: { value: 1.25, random: true },
          line_linked: { enable: false },
          move: {
              enable: true,
              speed: 0.25,
              direction: "none",
              random: true,
              straight: false,
              out_mode: "out",
              bounce: false,
          },
      },
      interactivity: {
          detect_on: "canvas",
          events: {
              onhover: { enable: true, mode: "none" },
              onclick: { enable: true, mode: "none" },
              resize: true,
          },
          modes: {
              repulse: { distance: 100, duration: 0.4 },
              push: { particles_nb: 4 },
          },
      },
      retina_detect: true,
  });

  // Mobile Menu Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const part2 = document.querySelector('#part2');
  menuToggle.addEventListener('click', () => {
      part2.classList.toggle('active');
      menuToggle.classList.toggle('active');
  });

  // Image Upload and Backend Interaction
  const fileInput = document.getElementById('fileElem');
  const uploadBtn = document.getElementById('uploadBtn');
  const predictionResultDiv = document.getElementById('prediction-result');

  uploadBtn.addEventListener('click', () => {
      fileInput.click();
  });

  fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file) return;

      uploadBtn.textContent = 'Processing...';
      uploadBtn.disabled = true;

      const formData = new FormData();
      formData.append('image', file);
      formData.append('models', '0,1,2,3,4,5,6'); // InceptionResNetV2, VGG19, MobileNetV2, ResNet50V2

      try {
          const response = await fetch('http://localhost:5000/predict', {
              method: 'POST',
              body: formData,
          });

          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

          const result = await response.json();
          displayPredictionResult(result);
      } catch (error) {
          console.error('Error:', error);
          alert('Prediction failed. Please try again.');
      } finally {
          uploadBtn.textContent = 'Upload Image';
          uploadBtn.disabled = false;
      }
  });

  function displayPredictionResult(result) {
      predictionResultDiv.innerHTML = `
          <div class="prediction-container">
              <h2>Prediction Result</h2>
              <p><strong>Predicted Class:</strong> ${result.predicted_class}</p>
              <h3>Similar Images</h3>
              <div class="image-grid">
                  ${result.similar_images
                      .map(
                          (img, index) => `
                              <div class="image-item">
                                  <img src="data:image/bmp;base64,${img.image_base64}" alt="Similar image ${img.id}">
                                  <p>ID: ${img.id}</p>
                              </div>
                          `
                      )
                      .join('')}
              </div>
          </div>
      `;
  }

  // Navigation
  const mainContent = document.getElementById('main-content');
  const researchContent = document.getElementById('research-content');
  const teamContent = document.getElementById('team-content');
  const aboutContent = document.getElementById('about-content');

  window.navigate = function (route) {
      mainContent.style.display = 'none';
      researchContent.style.display = 'none';
      teamContent.style.display = 'none';
      aboutContent.style.display = 'none';

      switch (route) {
          case 'home':
              mainContent.style.display = 'block';
              window.history.pushState({}, '', '/');
              break;
          case 'research':
              researchContent.style.display = 'block';
              window.history.pushState({}, '', '/research');
              break;
          case 'team':
              teamContent.style.display = 'block';
              window.history.pushState({}, '', '/team');
              break;
          case 'about':
              aboutContent.style.display = 'block';
              window.history.pushState({}, '', '/about');
              break;
      }

      document.querySelectorAll('.nav-bar').forEach(nav => {
          nav.classList.remove('active-link');
          if (nav.textContent.toLowerCase() === route) {
              nav.classList.add('active-link');
          }
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.addEventListener('popstate', () => {
      const path = window.location.pathname.replace('/', '') || 'home';
      navigate(path);
  });

  const currentPath = window.location.pathname.replace('/', '') || 'home';
  navigate(currentPath);

  // Scroll to Section
  window.scrollToSection = function (sectionId) {
      navigate('home');
      const element = document.getElementById(sectionId);
      if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
      }
  };
});