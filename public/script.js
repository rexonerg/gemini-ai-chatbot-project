// // script.js
// // Frontend chat handler for POST /api/chat
// // - sends { conversation: [{ role: "user", content: "<user_message>" }] }
// // - expects { result: "<gemini_ai_response>" }
// document.addEventListener('DOMContentLoaded', () => {
//   const form = document.getElementById('chat-form');
//   const input = document.getElementById('user-input');
//   const chatBox = document.getElementById('chat-box');
//   const submitBtn = form.querySelector('button[type="submit"]');

//   // Helper: create a message element and append to chat box
//   function appendMessage(role, text) {
//     const wrapper = document.createElement('div');
//     wrapper.className = `chat-message ${role === 'user' ? 'user' : 'bot'}`;

//     const bubble = document.createElement('div');
//     bubble.className = 'message-bubble';

//     const who = document.createElement('div');
//     who.className = 'message-role';
//     who.textContent = role === 'user' ? 'You' : 'Bot';

//     const content = document.createElement('div');
//     content.className = 'message-text';
//     content.textContent = text ?? '';

//     bubble.appendChild(who);
//     bubble.appendChild(content);
//     wrapper.appendChild(bubble);

//     chatBox.appendChild(wrapper);
//     // Keep view scrolled to the latest message
//     wrapper.scrollIntoView({ behavior: 'smooth', block: 'end' });

//     return { wrapper, content };
//   }

//   // Show a transient bot message "Thinking<<." and return its content element
//   function addThinking() {
//     const { wrapper, content } = appendMessage('bot', 'Thinking<<.');
//     wrapper.classList.add('thinking');
//     return { wrapper, content };
//   }

//   // Update a bot message content and remove thinking state
//   function updateBotMessage(contentElement, newText) {
//     contentElement.textContent = newText;
//     const wrapper = contentElement.closest('.chat-message');
//     if (wrapper) wrapper.classList.remove('thinking');
//     wrapper && wrapper.scrollIntoView({ behavior: 'smooth', block: 'end' });
//   }

//   // Show error text in the thinking slot (keeps UI consistent)
//   function showError(contentElement, message) {
//     updateBotMessage(contentElement, message);
//     const wrapper = contentElement.closest('.chat-message');
//     wrapper && wrapper.classList.add('error');
//   }

//   // Disable form controls while waiting for response
//   function setBusy(isBusy) {
//     input.disabled = isBusy;
//     submitBtn.disabled = isBusy;
//     if (!isBusy) input.focus();
//   }

//   form.addEventListener('submit', async (ev) => {
//     ev.preventDefault();
//     const userText = (input.value || '').trim();
//     if (!userText) return;

//     // Add user's message to chat
//     appendMessage('user', userText);

//     // Add thinking placeholder
//     const thinking = addThinking();

//     // Clear input and disable while waiting
//     input.value = '';
//     setBusy(true);

//     // Prepare payload
//     const payload = {
//       conversation: [{ role: 'user', content: userText }]
//     };

//     try {
//       const res = await fetch('/api/chat', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//         credentials: 'same-origin'
//       });

//       if (!res.ok) {
//         // Non-2xx response
//         showError(thinking.content, 'Failed to get response from server.');
//         return;
//       }

//       // Attempt parse JSON
//       let data;
//       try {
//         data = await res.json();
//       } catch (parseErr) {
//         showError(thinking.content, 'Failed to parse server response.');
//         return;
//       }

//       // Validate and display result
//       if (data && typeof data.result === 'string' && data.result.trim() !== '') {
//         updateBotMessage(thinking.content, data.result.trim());
//       } else {
//         showError(thinking.content, 'Sorry, no response received.');
//       }
//     } catch (err) {
//       // Network or other runtime error
//       showError(thinking.content, 'Failed to get response from server.');
//     } finally {
//       setBusy(false);
//     }
//   });
// });




document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");

  // Utility: add a message bubble to chat box
  function addMessage(text, sender = "bot") {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}`;
    messageDiv.textContent = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageDiv;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const userMessage = input.value.trim();
    if (!userMessage) return;

    // 1. Show user message
    addMessage(userMessage, "user");
    input.value = "";

    // 2. Show temporary "Thinking..." message
    const thinkingMessage = addMessage("Thinking...", "bot");

    try {
      // 3. Send POST request to backend
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation: [
            {
              role: "user",
              content: userMessage,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();

      // 4. Replace thinking message with AI reply
      if (data && typeof data.result === "string") {
        thinkingMessage.textContent = data.result;
      } else {
        thinkingMessage.textContent = "Sorry, no response received.";
      }
    } catch (error) {
      console.error("Chat error:", error);
      thinkingMessage.textContent = "Failed to get response from server.";
    }
  });
});
