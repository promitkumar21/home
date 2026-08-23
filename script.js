/* ============================================
   TERMINAL PORTFOLIO - JAVASCRIPT
   Typing audio, animations, AI chatbot logic
   ============================================ */

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    audioEnabled: true,
    audioVolume: 0.15,
    typingSpeed: 25,
    bootTypingSpeed: 15,
    promptText: 'Promit@linux ~ %',
    bootSequence: [
        { text: 'Initializing PromitOS v1.0...', ok: true },
        { text: 'Loading knowledge modules...', ok: true },
        { text: 'Parsing student data from Shivaji University, Kolhapur...', ok: true },
        { text: 'Establishing secure connection...', ok: true },
        { text: '', ok: false },
        { text: 'Protocol established. Welcome.', ok: false },
        { text: '', ok: false },
        { text: 'I am Anatomy of Promit, an AI built to present the work of Promit Kumar.', ok: false, highlight: ['Promit Kumar'] },
        { text: "Type 'help' for a list of commands, or ask me a question in plain English.", ok: false, highlight: ["'help'"] },
    ],
};

// History State
let commandHistory = [];
let historyIndex = -1;


// ============================================
// KNOWLEDGE BASE
// ============================================
const KNOWLEDGE_BASE = {
    identity: {
        name: 'Promit Kumar',
        profession: 'B.Tech Student (Computer Science and Technology)',
        tagline: 'I want to learn new things.',
        location: 'Kolhapur, Maharashtra, India',
        hometown: 'Kishoreganj, Bangladesh',
        university: 'Shivaji University, Kolhapur',
        previousCollege: 'Gurudayal Govt. College',
        education: 'Currently pursuing B.Tech in Computer Science and Technology at Shivaji University, Kolhapur',
        previousEducation: 'Completed HSC from Gurudayal Govt. College, Kishoreganj, Bangladesh',
    },
    about: "I am Promit Kumar, originally from Kishoreganj, Bangladesh. I completed my HSC from Gurudayal Govt. College and I am currently pursuing B.Tech in Computer Science and Technology at Shivaji University, Kolhapur. I am passionate about learning new things and continuously improving myself. I enjoy playing cricket, football, and chess, which help me build focus, teamwork, and strategic thinking. I am committed to my personal growth and future goals, staying consistent and disciplined in everything I do.",
    personality: [
        'I am Promit Kumar, a passionate student.',
        'I am always curious and love learning new things.',
        'I enjoy exploring technology and creative ideas.',
        'I like improving myself every day, step by step.',
        'I believe in hard work and consistency.',
        'I am interested in building projects and new skills.',
        'I value honesty, discipline, and dedication.',
        'I enjoy sharing knowledge and helping others when I can.',
        'I focus on my goals and try to stay positive.',
    ],
    hobbies: ['Cricket', 'Football', 'Chess'],
    skills: [
        'Learning new things',
        'Strategic thinking (from chess)',
        'Teamwork (from sports)',
        'Consistency and discipline',
        'Self-improvement',
        'Exploring technology',
    ],
    contact: {
        email: 'promitkumar59@gmail.com',
        twitter: 'https://x.com/promit9999',
        instagram: 'https://www.instagram.com/_promit_kumar?igsh=MTM5NTIxN3R3aWc0Nw==',
        facebook: 'https://www.facebook.com/share/1Jm4MgETy2/',
    },
    blog: 'I will edit the blog in the future.',
};

// ============================================
// COMMANDS
// ============================================
const COMMANDS = {
    help: { description: 'Show available commands', execute: () => showHelp() },
    about: { description: 'Learn about Promit Kumar', execute: () => showAbout() },
    education: { description: 'Show education background', execute: () => showEducation() },
    skills: { description: 'List skills and abilities', execute: () => showSkills() },
    hobbies: { description: 'Show hobbies and interests', execute: () => showHobbies() },
    blog: { description: 'View blog section', execute: () => showBlog() },
    contact: { description: 'Show contact information', execute: () => showContact() },
    social: { description: 'Show social media links', execute: () => showSocial() },
    personality: { description: "Learn about Promit's personality", execute: () => showPersonality() },
    whoami: { description: 'Show identity information', execute: () => showWhoami() },
    clear: { description: 'Clear the terminal screen', execute: () => clearTerminal() },
    all: { description: 'Display all information', execute: () => showAll() },
};

// ============================================
// AUDIO SYSTEM
// ============================================
class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.clickBuffer = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            try {
                const response = await fetch(new URL('click.mp3', window.location.href).href);
                if (response.ok) {
                    const arrayBuffer = await response.arrayBuffer();
                    this.clickBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                }
            } catch (e) {
                this.clickBuffer = this.generateClickSound();
            }
            this.initialized = true;
        } catch (e) {
            console.warn('Audio initialization failed:', e);
            CONFIG.audioEnabled = false;
        }
    }

    generateClickSound() {
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.05;
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 80);
            const click = (Math.random() * 2 - 1) * 0.3 * envelope;
            const tone = Math.sin(2 * Math.PI * 2000 * t) * 0.15 * envelope;
            data[i] = click + tone;
        }
        return buffer;
    }

    playClick() {
        if (!CONFIG.audioEnabled || !this.initialized || !this.clickBuffer) return;
        try {
            const source = this.audioContext.createBufferSource();
            source.buffer = this.clickBuffer;
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = CONFIG.audioVolume;
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            source.start(0);
        } catch (e) { }
    }
}

const audioSystem = new AudioSystem();

// ============================================
// DOM ELEMENTS
// ============================================
const terminalOutput = document.getElementById('terminal-output');
const terminalInput = document.getElementById('terminal-input');
const clockElement = document.getElementById('clock');
const themeToggle = document.getElementById('theme-toggle');
const viewToggle = document.getElementById('view-toggle');
const terminalViewContainer = document.getElementById('terminal-view-container');
const standardViewContainer = document.getElementById('standard-view-container');
const navItems = document.querySelectorAll('.nav-item');
const tabPanes = document.querySelectorAll('.tab-pane');

// ============================================
// UTILITIES
// ============================================
function createOutputBlock() {
    const block = document.createElement('div');
    block.className = 'output-block';
    terminalOutput.appendChild(block);
    return block;
}

function createCommandEcho(command) {
    const block = createOutputBlock();
    block.innerHTML = `<span class="prompt-text">${CONFIG.promptText}</span> <span class="command-echo" style="display:inline;">${escapeHtml(command)}</span>`;
    scrollToBottom();
    return block;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function scrollToBottom() {
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

async function typeText(element, text, speed = CONFIG.typingSpeed) {
    return new Promise(resolve => {
        let i = 0;
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        element.appendChild(cursor);
        const interval = setInterval(() => {
            if (i < text.length) {
                cursor.before(text.charAt(i));
                i++;
                scrollToBottom();
            } else {
                clearInterval(interval);
                cursor.remove();
                resolve();
            }
        }, speed);
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// COMMAND HANDLERS
// ============================================
function showHelp() {
    const block = createOutputBlock();
    const commandList = Object.keys(COMMANDS);
    let html = '<div class="section-heading">Available commands:</div>';
    html += '<div class="help-commands">';
    html += commandList.map(cmd => `<span style="color: var(--accent-color);">${cmd}</span>`).join(', ');
    html += '</div>';
    html += '<div class="help-hint">You can also ask me a question, like: "What are your hobbies?" or "Tell me about yourself"</div>';
    block.innerHTML = html;
}

function showAbout() {
    const block = createOutputBlock();
    block.innerHTML = `<div class="section-heading">About Me</div><div class="output-text">${KNOWLEDGE_BASE.about}</div>`;
}

function showEducation() {
    const block = createOutputBlock();
    block.innerHTML = `<div class="section-heading">Education</div><div class="output-text"><strong>Current:</strong> ${KNOWLEDGE_BASE.identity.education}</div><div class="output-text">Location: ${KNOWLEDGE_BASE.identity.location}</div><div class="output-text" style="margin-top: 0.8em;"><strong>Previous:</strong> ${KNOWLEDGE_BASE.identity.previousEducation}</div>`;
}

function showSkills() {
    const block = createOutputBlock();
    let html = '<div class="section-heading">Skills</div><ul class="output-list">';
    KNOWLEDGE_BASE.skills.forEach(skill => { html += `<li>${skill}</li>`; });
    html += '</ul>';
    block.innerHTML = html;
}

function showHobbies() {
    const block = createOutputBlock();
    let html = '<div class="section-heading">Hobbies</div><ul class="output-list">';
    KNOWLEDGE_BASE.hobbies.forEach(hobby => { html += `<li>${hobby}</li>`; });
    html += '</ul><div class="output-text">These activities help me build focus, teamwork, and strategic thinking.</div>';
    block.innerHTML = html;
}

function showBlog() {
    const block = createOutputBlock();
    block.innerHTML = `<div class="section-heading">Blog</div><div class="blog-grid"><div class="blog-card"><div class="blog-card-title">Coming Soon</div><div class="blog-card-text">${KNOWLEDGE_BASE.blog}</div></div></div>`;
}

function showContact() {
    const block = createOutputBlock();
    block.innerHTML = `<div class="section-heading">Contact</div><div class="output-text">Email: <a href="mailto:${KNOWLEDGE_BASE.contact.email}" class="output-link">${KNOWLEDGE_BASE.contact.email}</a><br>Feel free to reach out for any questions or collaborations!</div>`;
}

function showSocial() {
    const block = createOutputBlock();
    block.innerHTML = `<div class="section-heading">Social Links</div><ul class="output-list"><li>Twitter/X: <a href="${KNOWLEDGE_BASE.contact.twitter}" target="_blank" class="output-link">@promit9999</a></li><li>Instagram: <a href="${KNOWLEDGE_BASE.contact.instagram}" target="_blank" class="output-link">@_promit_kumar</a></li><li>Facebook: <a href="${KNOWLEDGE_BASE.contact.facebook}" target="_blank" class="output-link">Facebook Profile</a></li></ul>`;
}

function showPersonality() {
    const block = createOutputBlock();
    let html = '<div class="section-heading">Personality</div><ul class="output-list">';
    KNOWLEDGE_BASE.personality.forEach(trait => { html += `<li>${trait}</li>`; });
    html += '</ul>';
    block.innerHTML = html;
}

function showWhoami() {
    const block = createOutputBlock();
    block.innerHTML = `<div class="section-heading">Who Am I</div><div class="output-text">Name: ${KNOWLEDGE_BASE.identity.name}<br>Profession: ${KNOWLEDGE_BASE.identity.profession}<br>Tagline: "${KNOWLEDGE_BASE.identity.tagline}"<br>University: ${KNOWLEDGE_BASE.identity.university}<br>Location: ${KNOWLEDGE_BASE.identity.location}<br>Hometown: ${KNOWLEDGE_BASE.identity.hometown}</div>`;
}

function clearTerminal() {
    terminalOutput.innerHTML = '';
}

function showAll() {
    showWhoami();
    showAbout();
    showEducation();
    showSkills();
    showHobbies();
    showPersonality();
    showBlog();
    showContact();
    showSocial();
}

// ============================================
// AI CHATBOT (Natural Language)
// ============================================
function processNaturalLanguage(input) {
    const lower = input.toLowerCase();
    const block = createOutputBlock();

    if (matchesAny(lower, ['hello', 'hi', 'hey', 'greetings', 'namaste', 'salam'])) {
        block.innerHTML = `<div class="output-text">Hello! I am Anatomy of Promit, Promit Kumar's AI assistant. How can I help you today? Type 'help' to see what I can do!</div>`;
        return;
    }

    if (matchesAny(lower, ['who are you', 'what is your name', 'who is promit', 'tell me about promit', 'about promit'])) {
        block.innerHTML = `<div class="output-text">${KNOWLEDGE_BASE.personality[0]} ${KNOWLEDGE_BASE.personality[1]} I am originally from ${KNOWLEDGE_BASE.identity.hometown} and I am currently pursuing B.Tech in Computer Science and Technology at ${KNOWLEDGE_BASE.identity.university}. ${KNOWLEDGE_BASE.identity.tagline}</div>`;
        return;
    }

    if (matchesAny(lower, ['about', 'background', 'story', 'tell me about yourself'])) {
        block.innerHTML = `<div class="output-text">${KNOWLEDGE_BASE.about}</div>`;
        return;
    }

    if (matchesAny(lower, ['education', 'school', 'college', 'study', 'hsc', 'where do you study', 'university', 'b.tech', 'btech', 'shivaji'])) {
        showEducation();
        return;
    }

    if (matchesAny(lower, ['hobby', 'hobbies', 'interest', 'interests', 'what do you like', 'what do you enjoy', 'free time', 'sports', 'cricket', 'football', 'chess'])) {
        showHobbies();
        return;
    }

    if (matchesAny(lower, ['skill', 'skills', 'what can you do', 'abilities', 'talent', 'strength'])) {
        showSkills();
        return;
    }

    if (matchesAny(lower, ['personality', 'values', 'character', 'what kind of person', 'traits', 'beliefs'])) {
        showPersonality();
        return;
    }

    if (matchesAny(lower, ['goal', 'goals', 'future', 'dream', 'ambition', 'plan', 'what do you want'])) {
        block.innerHTML = `<div class="output-text">I am committed to my personal growth and future goals. I want to learn new things, build projects, and continuously improve myself. I believe in hard work and consistency, and I stay positive while focusing on my goals.</div>`;
        return;
    }

    if (matchesAny(lower, ['contact', 'email', 'reach', 'message', 'how to contact', 'get in touch'])) {
        showContact();
        return;
    }

    if (matchesAny(lower, ['social', 'twitter', 'instagram', 'facebook', 'x.com', 'follow'])) {
        showSocial();
        return;
    }

    if (matchesAny(lower, ['blog', 'article', 'post', 'write'])) {
        showBlog();
        return;
    }

    if (matchesAny(lower, ['where', 'location', 'bangladesh', 'kishoreganj', 'from', 'kolhapur', 'india'])) {
        block.innerHTML = `<div class="output-text">I am originally from Kishoreganj, Bangladesh. I completed my HSC from Gurudayal Govt. College there. I am currently in Kolhapur, Maharashtra, India, pursuing B.Tech in Computer Science and Technology at Shivaji University.</div>`;
        return;
    }

    if (matchesAny(lower, ['motivation', 'inspiration', 'why', 'what drives you', 'passion'])) {
        block.innerHTML = `<div class="output-text">I am always curious and love learning new things. I enjoy exploring technology and creative ideas. I like improving myself every day, step by step. I believe in hard work and consistency. These values drive me forward every day.</div>`;
        return;
    }

    if (matchesAny(lower, ['thank', 'thanks', 'appreciate', 'grateful'])) {
        block.innerHTML = `<div class="output-text">You are welcome! I am happy to help. If you have more questions, feel free to ask!</div>`;
        return;
    }

    if (matchesAny(lower, ['bye', 'goodbye', 'see you', 'later', 'take care'])) {
        block.innerHTML = `<div class="output-text">Goodbye! Have a wonderful day. Remember: keep learning and stay positive!</div>`;
        return;
    }

    block.innerHTML = `<div class="output-text">I am not sure I understand that question. Here is what I know about Promit: He is a B.Tech student in Computer Science and Technology at Shivaji University, Kolhapur, originally from Kishoreganj, Bangladesh. He loves learning new things, playing cricket, football, and chess. He believes in hard work and consistency. Try asking something specific, or type <span style="color: var(--accent-color);">'help'</span> to see available commands.</div>`;
}

function matchesAny(input, keywords) {
    return keywords.some(keyword => input.includes(keyword));
}

// ============================================
// BOOT SEQUENCE
// ============================================
async function runBootSequence() {
    terminalInput.disabled = true;
    for (const line of CONFIG.bootSequence) {
        const block = createOutputBlock();
        if (line.text === '') {
            block.style.height = '0.6em';
        } else {
            const textSpan = document.createElement('span');
            block.appendChild(textSpan);
            if (line.ok) {
                await typeText(textSpan, line.text, CONFIG.bootTypingSpeed);
                const okSpan = document.createElement('span');
                okSpan.style.color = '#2e7d32';
                okSpan.textContent = ' OK.';
                block.appendChild(okSpan);
            } else {
                await typeText(textSpan, line.text, CONFIG.bootTypingSpeed);
                if (line.highlight) {
                    let html = textSpan.innerHTML;
                    line.highlight.forEach(word => {
                        html = html.replace(word, `<span style="color: var(--accent-color);">${word}</span>`);
                    });
                    textSpan.innerHTML = html;
                }
            }
        }
        scrollToBottom();
        await sleep(100);
    }
    terminalInput.disabled = false;
    terminalInput.focus();
}

// ============================================
// COMMAND PROCESSING
// ============================================
function processCommand(input) {
    const trimmed = input.trim().toLowerCase();
    if (trimmed === '') return;

    // Add to history
    if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== input) {
        commandHistory.push(input);
    }
    historyIndex = -1;

    createCommandEcho(input);
    if (COMMANDS[trimmed]) {
        COMMANDS[trimmed].execute();
    } else {
        processNaturalLanguage(input);
    }
    scrollToBottom();
}

function handleAutocomplete() {
    const value = terminalInput.value.trim().toLowerCase();
    if (!value) return;

    const matches = Object.keys(COMMANDS).filter(cmd => cmd.startsWith(value));

    if (matches.length === 1) {
        terminalInput.value = matches[0];
    } else if (matches.length > 1) {
        // Show suggestions
        const block = createOutputBlock();
        block.innerHTML = `<div class="help-commands">${matches.map(cmd => `<span style="color: var(--accent-color);">${cmd}</span>`).join(', ')}</div>`;
        scrollToBottom();
    }
}

// ============================================
// CLOCK
// ============================================
function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    const displaySeconds = seconds.toString().padStart(2, '0');
    clockElement.textContent = `${displayHours}:${displayMinutes}:${displaySeconds} ${ampm}`;
}

// ============================================
// EVENT LISTENERS
// ============================================
terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        handleAutocomplete();
        audioSystem.playClick();
        return;
    }

    audioSystem.playClick();
    if (e.key === 'Enter') {
        const value = terminalInput.value;
        processCommand(value);
        terminalInput.value = '';
        return;
    }

    if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (commandHistory.length > 0) {
            if (historyIndex === -1) {
                historyIndex = commandHistory.length - 1;
            } else if (historyIndex > 0) {
                historyIndex--;
            }
            terminalInput.value = commandHistory[historyIndex];
            // Move cursor to end
            setTimeout(() => {
                terminalInput.selectionStart = terminalInput.selectionEnd = terminalInput.value.length;
            }, 0);
        }
        return;
    }

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex !== -1) {
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                terminalInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = -1;
                terminalInput.value = '';
            }
            // Move cursor to end
            setTimeout(() => {
                terminalInput.selectionStart = terminalInput.selectionEnd = terminalInput.value.length;
            }, 0);
        }
        return;
    }
});

// Theme Toggle Logic
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

themeToggle.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent terminal focus logic from interfering too much
    toggleTheme();
    audioSystem.playClick();
});

// View Toggle Logic
viewToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    audioSystem.playClick();
    
    const isTerminalView = terminalViewContainer.style.display !== 'none';
    
    if (isTerminalView) {
        // Switch to Standard View
        terminalViewContainer.style.display = 'none';
        standardViewContainer.style.display = 'flex';
        viewToggle.querySelector('.standard-icon').style.display = 'none';
        viewToggle.querySelector('.terminal-icon').style.display = 'block';
        viewToggle.title = 'Switch to Terminal View';
    } else {
        // Switch to Terminal View
        standardViewContainer.style.display = 'none';
        terminalViewContainer.style.display = 'flex';
        viewToggle.querySelector('.terminal-icon').style.display = 'none';
        viewToggle.querySelector('.standard-icon').style.display = 'block';
        viewToggle.title = 'Switch to Standard View';
        terminalInput.focus();
    }
});

// Standard View Tab Logic
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        audioSystem.playClick();
        
        // Remove active class from all tabs
        navItems.forEach(nav => nav.classList.remove('active'));
        tabPanes.forEach(pane => pane.style.display = 'none');
        
        // Add active class to clicked tab
        item.classList.add('active');
        const targetId = 'tab-' + item.getAttribute('data-tab');
        document.getElementById(targetId).style.display = 'block';
    });
});

terminalOutput.addEventListener('click', () => {
    if (terminalViewContainer.style.display !== 'none') {
        terminalInput.focus();
    }
});

document.addEventListener('click', (e) => {
    if (e.target.tagName !== 'A' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
        if (terminalViewContainer.style.display !== 'none') {
            terminalInput.focus();
        }
    }
});

document.addEventListener('click', () => {
    audioSystem.init();
}, { once: true });

document.addEventListener('keydown', () => {
    audioSystem.init();
}, { once: true });

// Also try to resume audio context on user interaction (browsers block audio until interaction)
document.addEventListener('click', async () => {
    if (audioSystem.audioContext && audioSystem.audioContext.state === 'suspended') {
        await audioSystem.audioContext.resume();
    }
}, { once: true });

// ============================================
// FLOATING PARTICLES
// ============================================
class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 45;
        this.animationId = null;

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.createParticles();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    getThemeColors() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        return isDark
            ? { r: 235, g: 212, b: 177 }   // warm amber for dark mode
            : { r: 60, g: 60, b: 60 };      // subtle dark gray for light mode
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 1.8 + 0.4,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.2,
                opacity: Math.random() * 0.25 + 0.05,
                drift: Math.random() * Math.PI * 2,     // phase offset for sine drift
                driftSpeed: Math.random() * 0.003 + 0.001,
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const color = this.getThemeColors();

        for (const p of this.particles) {
            // Gentle sine-wave horizontal drift
            p.drift += p.driftSpeed;
            p.x += p.speedX + Math.sin(p.drift) * 0.15;
            p.y += p.speedY;

            // Wrap around edges
            if (p.x < -10) p.x = this.canvas.width + 10;
            if (p.x > this.canvas.width + 10) p.x = -10;
            if (p.y < -10) p.y = this.canvas.height + 10;
            if (p.y > this.canvas.height + 10) p.y = -10;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${p.opacity})`;
            this.ctx.fill();
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);
    runBootSequence();

    // Start floating particles
    new ParticleSystem('particles-canvas');
});
