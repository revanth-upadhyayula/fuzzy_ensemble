// //~ GSAP ScrollTrigger
var tl = gsap.timeline();
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
        start: "top top", // Start when #page2 hits the top of the viewport
        end: "bottom -100%", // End when #page2’s bottom hits the top of the viewport
        scrub: 1,
        pin: true
        // markers: true
    }
});

tl.from(".step", {
    x: -100, // Move from left
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


// Initialize Particles.js for #page1
particlesJS("particles-js", {
    particles: {
        number: {
            value: 100, // Number of particles
            density: {
                enable: true,
                value_area: 800,
            },
        },
        color: {
            value: "#ffffff", // Blue particles to match the theme
        },
        shape: {
            type: "circle",
        },
        opacity: {
            value: 0.5,
            random: true,
        },
        size: {
            value: 1.25,
            random: true,
        },
        line_linked: {
            enable: false, // No lines between particles
        },
        move: {
            enable: true,
            speed: 0.25, // Slow movement for a subtle effect
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
            onhover: {
                enable: true,
                mode: "none", // Particles move away on hover
            },
            onclick: {
                enable: true,
                mode: "none", // Add particles on click
            },
            resize: true,
        },
        modes: {
            repulse: {
                distance: 100,
                duration: 0.4,
            },
            push: {
                particles_nb: 4,
            },
        },
    },
    retina_detect: true,
});
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing scripts...');


    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const part2 = document.querySelector('#part2');
    if (menuToggle && part2) {
        menuToggle.addEventListener('click', () => {
            part2.classList.toggle('active');
            menuToggle.classList.toggle('active');
            console.log('Mobile menu toggled, active:', part2.classList.contains('active'));
        });
    } else {
        console.error('Mobile menu elements not found:', { menuToggle, part2 });
    }

    // Dropdown Toggle
    const dropdown = document.querySelector('.custom-dropdown');
    const dropdownHeader = document.querySelector('.dropdown-header');
    const dropdownList = document.querySelector('.dropdown-list');
    if (dropdown && dropdownHeader && dropdownList) {
        dropdownHeader.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.getAttribute('data-state') === 'open';
            dropdown.setAttribute('data-state', isOpen ? 'closed' : 'open');
            console.log('Dropdown toggled, state:', dropdown.getAttribute('data-state'));
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && dropdown.getAttribute('data-state') === 'open') {
                dropdown.setAttribute('data-state', 'closed');
                console.log('Dropdown closed (clicked outside)');
            }
        });
    } else {
        console.error('Dropdown elements not found:', { dropdown, dropdownHeader, dropdownList });
    }

    // Scroll Arrow
    const scrollArrow = document.getElementById('scroll-arrow');
    if (scrollArrow) {
        scrollArrow.addEventListener('click', () => {
            document.getElementById('page2').scrollIntoView({ behavior: 'smooth' });
            console.log('Scroll arrow clicked, scrolling to #page2');
        });
    } else {
        console.error('Scroll arrow element not found');
    }

    // Form Submission Handling (aligned with HTML form)
    const uploadForm = document.getElementById('upload-container');
    const predictionResultDiv = document.getElementById('prediction-result');
    const uploadButton = document.getElementById('upload-button');

    if (uploadForm && predictionResultDiv && uploadButton) {
        uploadForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            console.log('Form submission prevented, processing upload');

            const formData = new FormData(uploadForm);
            uploadButton.textContent = 'Processing...';
            uploadButton.disabled = true;

            try {
                const response = await fetch('/predict', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                console.log('Parsed prediction result:', result);

                if (result.error) {
                    predictionResultDiv.innerHTML = `<p class="error">${result.error}</p>`;
                } else {
                    predictionResultDiv.innerHTML = `
                        <div class="prediction-container">
                            <h2>Prediction Result</h2>
                            <p><strong>Predicted Class:</strong> ${result.predicted_class}</p>
                            ${result.similar_images.length ? `
                                <h3>Similar Images</h3>
                                <div class="image-grid">
                                    ${result.similar_images.map(img => `
                                        <div class="image-item">
                                            <img src="data:image/bmp;base64,${img.image_base64}" alt="Similar image ${img.id}">
                                            <p>ID: ${img.id}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : '<p class="error">No similar images available</p>'}
                        </div>
                    `;
                    predictionResultDiv.scrollIntoView({ behavior: 'smooth' });
                }
            } catch (error) {
                console.error('Fetch or processing error:', error);
                predictionResultDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
            } finally {
                uploadButton.textContent = 'Upload & Predict';
                uploadButton.disabled = false;
                console.log('Upload processing complete');
            }
        });
    } else {
        console.error('Upload form elements not found:', { uploadForm, predictionResultDiv, uploadButton });
    }
});