document.addEventListener('DOMContentLoaded', () => {
    // Initialize GSAP
    gsap.registerPlugin(ScrollTrigger);

    // Mobile Menu Toggle
    const hamburger = document.getElementById('hamburgerMenu');
    const navMenu = document.getElementById('navMenu');
    const closeMenuBtn = document.createElement('div');

    // Create and add close button to mobile menu
    closeMenuBtn.className = 'close-menu-btn';
    closeMenuBtn.innerHTML = '&times;';
    closeMenuBtn.style.display = 'none';
    navMenu.prepend(closeMenuBtn);

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.add('active');
            closeMenuBtn.style.display = 'block';

            // Animate hamburger to X
            const spans = hamburger.querySelectorAll('span');
            gsap.to(spans[0], { rotation: 45, y: 9, duration: 0.3 });
            gsap.to(spans[1], { opacity: 0, duration: 0.3 });
            gsap.to(spans[2], { rotation: -45, y: -9, duration: 0.3 });
        });
    }

    // Close menu button functionality
    closeMenuBtn.addEventListener('click', () => {
        navMenu.classList.remove('active');
        closeMenuBtn.style.display = 'none';

        // Reset hamburger icon
        const spans = hamburger.querySelectorAll('span');
        gsap.to(spans[0], { rotation: 0, y: 0, duration: 0.3 });
        gsap.to(spans[1], { opacity: 1, duration: 0.3 });
        gsap.to(spans[2], { rotation: 0, y: 0, duration: 0.3 });
    });

    // Close mobile menu when clicking on links
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                closeMenuBtn.style.display = 'none';

                // Reset hamburger icon
                const spans = hamburger.querySelectorAll('span');
                gsap.to(spans[0], { rotation: 0, y: 0, duration: 0.3 });
                gsap.to(spans[1], { opacity: 1, duration: 0.3 });
                gsap.to(spans[2], { rotation: 0, y: 0, duration: 0.3 });
            }
        });
    });

    // Animate hero section
    gsap.to('.hero-section h1', {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out'
    });

    gsap.to('.hero-section p', {
        y: 0,
        opacity: 1,
        duration: 1,
        delay: 0.3,
        ease: 'power3.out'
    });

    // Animate speaker section
    gsap.to('.speaker-section', {
        scrollTrigger: {
            trigger: '.speaker-section',
            start: 'top 80%'
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out'
    });

    // Animate how-to section
    gsap.to('.how-to-section', {
        scrollTrigger: {
            trigger: '.how-to-section',
            start: 'top 80%'
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out'
    });

    // Animate steps with staggered effect
    // gsap.from('.step', {
    //     scrollTrigger: {
    //         trigger: '.steps',
    //         start: 'top 80%'
    //     },
    //     y: 30,
    //     opacity: 0,
    //     duration: 0.6,
    //     stagger: 0.2,
    //     ease: 'power2.out'
    // });

    // Animate steps with staggered effect - improved version
    gsap.from('.step', {
        scrollTrigger: {
            trigger: '.steps',
            start: 'top 80%',
            once: true,  // Make sure animation only happens once
            toggleActions: 'play none none none' // Play animation when triggered
        },
        y: 30,
        opacity: 0,
        duration: 0.8,  // Slightly longer duration for smoother animation
        stagger: 0.25,  // Adjusted stagger timing
        ease: 'power2.out',
        clearProps: 'all' // Clear properties after animation completes
    });

    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.getElementById('header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Make progress circle responsive
    function updateProgressCircleSize() {
        const progressCircle = document.querySelector('.progress-circle');
        const circleProgressSVG = progressCircle.querySelector('svg');
        const circle = progressCircle.querySelectorAll('circle');
        const progressText = document.querySelector('.progress-text');

        // Get the container width for responsive sizing
        const containerWidth = progressCircle.parentElement.clientWidth;
        let size = Math.min(containerWidth * 0.8, 250); // Cap at 250px max

        // Ensure minimum size on very small screens
        size = Math.max(size, 120);

        // Update SVG size
        circleProgressSVG.setAttribute('width', size);
        circleProgressSVG.setAttribute('height', size);
        circleProgressSVG.setAttribute('viewBox', `0 0 ${size} ${size}`);

        // Update circle positions and radius
        const centerPoint = size / 2;
        const radius = centerPoint - 10; // 10px padding

        circle.forEach(c => {
            c.setAttribute('cx', centerPoint);
            c.setAttribute('cy', centerPoint);
            c.setAttribute('r', radius);
        });

        // Update text size
        progressText.style.fontSize = `${size / 6}px`;

        // Update the circumference in the SpeakerCleaner instance
        if (speakerCleaner) {
            speakerCleaner.updateCircumference(2 * Math.PI * radius);
        }
    }

    // Resize observer for progress circle
    const resizeObserver = new ResizeObserver(updateProgressCircleSize);
    const progressCircleContainer = document.querySelector('.progress-circle').parentElement;
    resizeObserver.observe(progressCircleContainer);

    // Speaker cleaner functionality
    class SpeakerCleaner {
        constructor() {
            this.audioContext = null;
            this.oscillator = null;
            this.gainNode = null;
            this.isPlaying = false;
            this.startTime = 0;
            this.duration = 45; // Extended to 45 seconds for better results
            this.currentMode = 'sound';
            this.vibrationPattern = [100, 50]; // vibration pattern in ms
            this.frequencySequence = [
                { freq: 165, time: 10 }, // Low frequency to start
                { freq: 200, time: 10 }, // Medium frequency
                { freq: 440, time: 10 }, // Higher frequency
                { freq: 800, time: 5 },  // Very high frequency
                { freq: 165, time: 10 }  // Back to low for final push
            ];
            this.currentFreqIndex = 0;
            this.frequencyChangeTimer = null;
            this.animationFrame = null;

            // DOM Elements
            this.startButton = document.getElementById('startButton');
            this.soundButton = document.getElementById('soundButton');
            this.vibrateButton = document.getElementById('vibrateButton');
            this.progressCircle = document.querySelector('.circle-progress');
            this.progressText = document.querySelector('.progress-text');
            this.modeText = document.querySelector('.mode-text');

            if (!this.startButton || !this.progressCircle) {
                console.error('Required DOM elements not found');
                return;
            }

            // Configure circle progress
            this.updateCircumference(2 * Math.PI * parseInt(this.progressCircle.getAttribute('r')));

            // Bind methods
            this.toggleCleaning = this.toggleCleaning.bind(this);
            this.updateProgress = this.updateProgress.bind(this);
            this.switchMode = this.switchMode.bind(this);
            this.changeFrequency = this.changeFrequency.bind(this);
            this.updateCircumference = this.updateCircumference.bind(this);

            // Event listeners
            this.startButton.addEventListener('click', this.toggleCleaning);
            this.soundButton.addEventListener('click', () => this.switchMode('sound'));
            this.vibrateButton.addEventListener('click', () => this.switchMode('vibrate'));
        }

        updateCircumference(circumference) {
            this.circumference = circumference;
            this.progressCircle.style.strokeDasharray = circumference;
            this.progressCircle.style.strokeDashoffset = circumference;
        }

        async initAudioContext() {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.oscillator = this.audioContext.createOscillator();
                this.oscillator.type = 'sine';

                // Start with the first frequency in the sequence
                const initialFreq = this.frequencySequence[0].freq;
                this.oscillator.frequency.setValueAtTime(initialFreq, this.audioContext.currentTime);

                this.gainNode = this.audioContext.createGain();
                this.gainNode.gain.setValueAtTime(0.7, this.audioContext.currentTime);

                this.oscillator.connect(this.gainNode);
                this.gainNode.connect(this.audioContext.destination);
            } catch (error) {
                console.error('Audio context initialization failed:', error);
                alert('Could not initialize audio. Please check your browser settings.');
            }
        }

        changeFrequency() {
            if (!this.isPlaying || !this.oscillator) return;

            this.currentFreqIndex++;

            if (this.currentFreqIndex < this.frequencySequence.length) {
                const nextFreq = this.frequencySequence[this.currentFreqIndex];

                // Gradually change to the new frequency over 500ms for smoother transition
                this.oscillator.frequency.linearRampToValueAtTime(
                    nextFreq.freq,
                    this.audioContext.currentTime + 0.5
                );

                // Update the mode text to show current frequency
                this.modeText.textContent = `${this.currentMode.toUpperCase()} - ${nextFreq.freq}Hz`;

                // Schedule the next frequency change
                this.frequencyChangeTimer = setTimeout(
                    this.changeFrequency,
                    nextFreq.time * 1000
                );
            }
        }

        switchMode(mode) {
            this.currentMode = mode;
            this.soundButton.classList.toggle('active', mode === 'sound');
            this.vibrateButton.classList.toggle('active', mode === 'vibrate');
            this.modeText.textContent = mode.toUpperCase();

            if (this.isPlaying) {
                this.stopCleaning();
                this.startCleaning();
            }
        }

        updateProgress() {
            if (!this.isPlaying) return;

            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const progress = Math.min(100, (elapsed / this.duration) * 100);

            // Update circle progress
            const offset = this.circumference - (progress / 100) * this.circumference;
            this.progressCircle.style.strokeDashoffset = offset;

            // Update percentage text
            this.progressText.textContent = `${Math.round(progress)}%`;

            if (progress < 100 && this.isPlaying) {
                this.animationFrame = requestAnimationFrame(this.updateProgress);
            } else if (progress >= 100) {
                this.stopCleaning();
            }
        }

        async startCleaning() {
            this.isPlaying = true;
            this.startTime = Date.now();
            this.startButton.textContent = 'STOP';
            this.currentFreqIndex = 0;

            // Add button animation with GSAP
            gsap.to(this.startButton, {
                scale: 1.2,
                duration: 0.5,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut"
            });

            if (this.currentMode === 'sound') {
                await this.initAudioContext();
                this.oscillator.start();

                // Update the mode text to show current frequency
                this.modeText.textContent = `${this.currentMode.toUpperCase()} - ${this.frequencySequence[0].freq}Hz`;

                // Schedule frequency changes
                this.frequencyChangeTimer = setTimeout(
                    this.changeFrequency,
                    this.frequencySequence[0].time * 1000
                );
            } else if (this.currentMode === 'vibrate' && navigator.vibrate) {
                // Enhance vibration for better water ejection
                const enhancedVibrate = () => {
                    if (!this.isPlaying) return;

                    // Calculate which frequency phase we're in
                    const elapsed = (Date.now() - this.startTime) / 1000;
                    let totalTime = 0;
                    let currentPhase = 0;

                    for (let i = 0; i < this.frequencySequence.length; i++) {
                        totalTime += this.frequencySequence[i].time;
                        if (elapsed <= totalTime) {
                            currentPhase = i;
                            break;
                        }
                    }

                    // Adjust vibration intensity based on the current phase
                    let intensity = 0;
                    switch (currentPhase) {
                        case 0:
                            intensity = 100;
                            break;
                        case 1:
                            intensity = 150;
                            break;
                        case 2:
                            intensity = 200;
                            break;
                        case 3:
                            intensity = 300;
                            break;
                        case 4:
                            intensity = 100;
                            break;
                        default:
                            intensity = 100;
                    }

                    this.modeText.textContent = `${this.currentMode.toUpperCase()} - PHASE ${currentPhase + 1}`;

                    navigator.vibrate(intensity);
                    if (this.isPlaying) {
                        setTimeout(enhancedVibrate, 150);
                    }
                };

                enhancedVibrate();
            }

            this.animationFrame = requestAnimationFrame(this.updateProgress);
        }

        stopCleaning() {
            // Stop GSAP animation
            gsap.killTweensOf(this.startButton);
            gsap.to(this.startButton, {
                scale: 1,
                duration: 0.3,
                ease: "power1.out"
            });

            if (this.oscillator) {
                this.oscillator.stop();
                this.oscillator = null;
            }

            if (this.frequencyChangeTimer) {
                clearTimeout(this.frequencyChangeTimer);
                this.frequencyChangeTimer = null;
            }

            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
                this.animationFrame = null;
            }

            if (navigator.vibrate) {
                navigator.vibrate(0); // Stop vibration
            }

            this.isPlaying = false;
            this.startButton.textContent = 'PRESS';
            this.progressText.textContent = '0%';
            this.progressCircle.style.strokeDashoffset = this.circumference;
            this.modeText.textContent = this.currentMode.toUpperCase();
        }

        async toggleCleaning() {
            if (this.isPlaying) {
                this.stopCleaning();
            } else {
                await this.startCleaning();
            }
        }
    }

    // Initialize the speaker cleaner
    const speakerCleaner = new SpeakerCleaner();

    // Run initial size update
    updateProgressCircleSize();
});