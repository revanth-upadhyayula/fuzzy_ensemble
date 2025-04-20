document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing scripts...');

    // GSAP Animations
    try {
        const tl = gsap.timeline();
        tl.from("#fuzzy-ensemble .card", {
            y: 100,
            opacity: 0,
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
        console.log('GSAP animations initialized');
    } catch (error) {
        console.error('GSAP initialization error:', error);
    }

    // Particles.js
    try {
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
        console.log('Particles.js initialized');
    } catch (error) {
        console.error('Particles.js initialization error:', error);
    }

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
            window.scrollToSection('page2');
            console.log('Scroll arrow clicked, scrolling to #page2');
        });
    } else {
        console.error('Scroll arrow element not found');
    }

    // Image Upload and Backend Interaction
    const uploadContainer = document.getElementById('upload-container');
    const fileInput = document.getElementById('file-input');
    const uploadButton = document.getElementById('upload-button');
    const predictionResultDiv = document.getElementById('prediction-result');
    const modelCheckboxes = document.querySelectorAll('.dropdown-list input[type="checkbox"]');

    if (uploadContainer && fileInput && uploadButton && predictionResultDiv) {
        console.log('Upload container elements found, attaching click handler');

        // Remove any existing listeners to prevent duplicates
        uploadButton.removeEventListener('click', handleUpload);
        uploadButton.addEventListener('click', handleUpload);

        // Debug multiple listeners
        let clickCount = 0;
        function handleUpload() {
            clickCount++;
            console.log(`Upload button clicked, count: ${clickCount}, processing upload`);

            // Clear previous messages
            predictionResultDiv.innerHTML = '';

            const file = fileInput.files[0];
            if (!file) {
                predictionResultDiv.innerHTML = '<p class="error">Error: Please select an image to upload.</p>';
                console.warn('No file selected');
                return;
            }

            const selectedModels = Array.from(modelCheckboxes)
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value);

            if (selectedModels.length === 0) {
                predictionResultDiv.innerHTML = '<p class="error">Error: Please select at least one model.</p>';
                console.warn('No models selected');
                return;
            }

            const formData = new FormData();
            formData.append('image', file);
            formData.append('models', selectedModels.join(','));

            // Log FormData contents
            console.log('FormData contents:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value instanceof File ? value.name : value}`);
            }

            uploadButton.textContent = 'Processing...';
            uploadButton.disabled = true;
            console.log('Sending fetch request with file:', file.name, 'models:', selectedModels);

            fetch('http://localhost:5000/predict', {
                method: 'POST',
                body: formData,
            })
                .then(response => {
                    console.log('Fetch response received, status:', response.status);
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(responseText => {
                    console.log('Raw response text:', responseText);

                    if (!responseText) {
                        throw new Error('Empty response from server');
                    }

                    let result;
                    try {
                        result = JSON.parse(responseText);
                    } catch (parseError) {
                        console.error('Failed to parse response as JSON:', parseError);
                        throw new Error('Invalid response format: not JSON');
                    }
                    console.log('Parsed prediction result:', result);

                    if (!predictionResultDiv) {
                        console.error('predictionResultDiv is null, DOM may have changed');
                        throw new Error('Prediction result div not found');
                    }

                    displayPredictionResult(result);
                })
                .catch(error => {
                    console.error('Fetch or processing error details:', error.message, 'Stack:', error.stack);
                    predictionResultDiv.innerHTML = `<p class="error">Error: Prediction failed - ${error.message}</p>`;
                })
                .finally(() => {
                    uploadButton.textContent = 'Upload & Predict';
                    uploadButton.disabled = false;
                    console.log('Upload processing complete');
                });
        }
    } else {
        console.error('Upload container elements not found:', { uploadContainer, fileInput, uploadButton, predictionResultDiv });
    }

    function displayPredictionResult(result) {
        console.log('displayPredictionResult called with result:', result);

        if (!result || typeof result !== 'object') {
            console.warn('Invalid prediction result: result is null or not an object', result);
            predictionResultDiv.innerHTML = '<p class="error">Error: Invalid prediction result received (null or not an object).</p>';
            return;
        }

        if (!result.predicted_class || !Array.isArray(result.similar_images)) {
            console.warn('Invalid prediction result structure:', result);
            predictionResultDiv.innerHTML = `<p class="error">Error: Invalid prediction result structure (missing predicted_class or similar_images).</p>`;
            return;
        }

        const imageItems = result.similar_images
            .map((img, index) => {
                if (!img.id || !img.image_base64) {
                    console.warn('Invalid image data at index', index, ':', img);
                    return '';
                }
                return `
                    <div class="image-item">
                        <img src="data:image/bmp;base64,${img.image_base64}" alt="Similar image ${img.id}">
                        <p>ID: ${img.id}</p>
                    </div>
                `;
            })
            .filter(item => item !== '')
            .join('');

        if (!imageItems) {
            console.warn('No valid similar images to display');
            predictionResultDiv.innerHTML = `
                <div class="prediction-container">
                    <h2>Prediction Result</h2>
                    <p><strong>Predicted Class:</strong> ${result.predicted_class}</p>
                    <p class="error">No similar images available</p>
                </div>
            `;
        } else {
            predictionResultDiv.innerHTML = `
                <div class="prediction-container">
                    <h2>Prediction Result</h2>
                    <p><strong>Predicted Class:</strong> ${result.predicted_class}</p>
                    <h3>Similar Images</h3>
                    <div class="image-grid">
                        ${imageItems}
                    </div>
                </div>
            `;
        }

        console.log('Prediction result rendered in #prediction-result');
        try {
            window.scrollToSection('prediction-result');
        } catch (scrollError) {
            console.error('Scroll error:', scrollError);
        }
    }

    // Scroll to Section
    window.scrollToSection = function (sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            console.log('Scrolled to section:', sectionId);
        } else {
            console.warn('Section not found:', sectionId);
        }
    };
});