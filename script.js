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
        { text: 'Parsing student data from Kishoreganj, Bangladesh...', ok: true },
        { text: 'Establishing secure connection...', ok: true },
        { text: '', ok: false },
        { text: 'Protocol established. Welcome.', ok: false },
        { text: '', ok: false },
        { text: 'I am PromitBot, an AI built to present the work of Promit Kumar.', ok: false },
        { text: "Type 'help' for a list of commands, or ask me a question in plain English.", ok: false },
    ],
};

// ============================================
// KNOWLEDGE BASE
// ============================================
const KNOWLEDGE_BASE = {
    identity: {
        name: 'Promit Kumar',
        profession: 'Student',
        tagline: 'I want to learn new things.',
        location: 'Kishoreganj, Bangladesh',
        college: 'Gurudayal Govt. College',
        education: 'Completed HSC from Gurudayal Govt. College',
    },
    about: "I am Promit Kumar, a student from Kishoreganj, Bangladesh. I completed my HSC from Gurudayal Govt. College. I am passionate about learning new things and continuously improving myself. I enjoy playing cricket, football, and chess, which help me build focus, teamwork, and strategic thinking. I am committed to my personal growth and future goals, staying consistent and disciplined in everything I do.",
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
                const response = await fetch('click.mp3');
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
    block.innerHTML = `<div class="section-heading">Education</div><div class="output-text">${KNOWLEDGE_BASE.identity.education}</div><div class="output-text">Location: ${KNOWLEDGE_BASE.identity.location}</div>`;
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
    block.innerHTML = `<div class="section-heading">Who Am I</div><div class="output-text">Name: ${KNOWLEDGE_BASE.identity.name}<br>Profession: ${KNOWLEDGE_BASE.identity.profession}<br>Tagline: "${KNOWLEDGE_BASE.identity.tagline}"<br>Location: ${KNOWLEDGE_BASE.identity.location}<br>College: ${KNOWLEDGE_BASE.identity.college}</div>`;
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
        block.innerHTML = `<div class="output-text">Hello! I am PromitBot, Promit Kumar's AI assistant. How can I help you today? Type 'help' to see what I can do!</div>`;
        return;
    }

    if (matchesAny(lower, ['who are you', 'what is your name', 'who is promit', 'tell me about promit', 'about promit'])) {
        block.innerHTML = `<div class="output-text">${KNOWLEDGE_BASE.personality[0]} ${KNOWLEDGE_BASE.personality[1]} I am from ${KNOWLEDGE_BASE.identity.location} and I study at ${KNOWLEDGE_BASE.identity.college}. ${KNOWLEDGE_BASE.identity.tagline}</div>`;
        return;
    }

    if (matchesAny(lower, ['about', 'background', 'story', 'tell me about yourself'])) {
        block.innerHTML = `<div class="output-text">${KNOWLEDGE_BASE.about}</div>`;
        return;
    }

    if (matchesAny(lower, ['education', 'school', 'college', 'study', 'hsc', 'where do you study'])) {
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

    if (matchesAny(lower, ['where', 'location', 'bangladesh', 'kishoreganj', 'from'])) {
        block.innerHTML = `<div class="output-text">I am from Kishoreganj, Bangladesh. It is a beautiful district in the Dhaka Division. I completed my HSC from Gurudayal Govt. College there.</div>`;
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

    block.innerHTML = `<div class="output-text">I am not sure I understand that question. Here is what I know about Promit: He is a passionate student from Kishoreganj, Bangladesh. He loves learning new things, playing cricket, football, and chess. He believes in hard work and consistency. Try asking something specific, or type <span style="color: var(--accent-color);">'help'</span> to see available commands.</div>`;
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
            block.style.height = '1em';
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
    createCommandEcho(input);
    if (COMMANDS[trimmed]) {
        COMMANDS[trimmed].execute();
    } else {
        processNaturalLanguage(input);
    }
    scrollToBottom();
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
    audioSystem.playClick();
    if (e.key === 'Enter') {
        const value = terminalInput.value;
        processCommand(value);
        terminalInput.value = '';
    }
});

terminalOutput.addEventListener('click', () => {
    terminalInput.focus();
});

document.addEventListener('click', (e) => {
    if (e.target.tagName !== 'A' && e.target.tagName !== 'INPUT') {
        terminalInput.focus();
    }
});

document.addEventListener('click', () => {
    audioSystem.init();
}, { once: true });

document.addEventListener('keydown', () => {
    audioSystem.init();
}, { once: true });

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);
    runBootSequence();
});