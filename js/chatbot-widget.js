/* ============================================================
   WURQLY — Chatbot Widget
   Floating button with expandable chat panel
   ============================================================ */

// CONFIG
const CHATBOT_NAME = 'Wurqly Assistant';
const WELCOME_MESSAGE = 'Hi there! Need help with field service management? I can answer questions about our platform, pricing, or connect you with our team.';

let chatOpen = false;
let bubbleDismissed = false;

function toggleChatbot() {
  const panel = document.getElementById('chatbot-panel');
  const trigger = document.getElementById('chatbot-trigger');
  const bubble = document.getElementById('chatbot-bubble');

  if (!panel || !trigger) return;

  chatOpen = !chatOpen;

  if (chatOpen) {
    panel.classList.add('active');
    if (bubble) bubble.style.display = 'none';
    trigger.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

    // Add welcome message if empty
    const messages = document.getElementById('chatbot-messages');
    if (messages && !messages.querySelector('.chat-msg')) {
      addBotMessage(WELCOME_MESSAGE);
    }
  } else {
    panel.classList.remove('active');
    trigger.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>';
  }
}

function addBotMessage(text) {
  const messages = document.getElementById('chatbot-messages');
  if (!messages) return;
  const msg = document.createElement('div');
  msg.className = 'chat-msg chat-bot';
  msg.style.cssText = 'background: var(--bg-alt); padding: 0.75rem 1rem; border-radius: var(--radius-lg); margin-bottom: 0.75rem; font-size: var(--text-sm); color: var(--text); max-width: 85%; line-height: 1.5;';
  msg.textContent = text;
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
}

function addUserMessage(text) {
  const messages = document.getElementById('chatbot-messages');
  if (!messages) return;
  const msg = document.createElement('div');
  msg.className = 'chat-msg chat-user';
  msg.style.cssText = 'background: var(--primary); color: #FFFFFF; padding: 0.75rem 1rem; border-radius: var(--radius-lg); margin-bottom: 0.75rem; font-size: var(--text-sm); max-width: 85%; margin-left: auto; line-height: 1.5;';
  msg.textContent = text;
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
}

function handleChatSend() {
  const input = document.getElementById('chatbot-input');
  if (!input || !input.value.trim()) return;
  const text = input.value.trim();
  input.value = '';
  addUserMessage(text);

  // Auto response
  setTimeout(() => {
    addBotMessage("Thanks for your message! Our team will get back to you shortly. For faster support, email us at hello@wurqly.com or call us directly.");
  }, 800);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('chatbot-input');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleChatSend();
    });
  }

  // Dismiss bubble on click
  const bubble = document.getElementById('chatbot-bubble');
  if (bubble) {
    bubble.addEventListener('click', () => {
      bubble.style.display = 'none';
      bubbleDismissed = true;
    });
  }
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && chatOpen) toggleChatbot();
});
