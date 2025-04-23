## **Features to Build**

### **1\. Home → Chat Transition**

* A Home screen with a text input and an “Ask” button.  
* On submit:  
  * Animate the user’s question to the top of the screen.  
  * Transition to a Chat screen.  
  * The submitted question becomes the first message bubble on the chat page.  
  * Implement smooth animation using react-native-reanimated or any package of your choice \- ideally it should not feel like a page switch

---

### **2\. Chat Interface**

* Display a scrollable list of messages:  
  * User (human) messages aligned to the right.  
  * Agent messages aligned to the left.  
* When a user submits a prompt:  
  * The prompt should animate into the top of the chat (not the bottom).  
  * The previous messages should scroll upward smoothly — mimicking modern AI chat behaviour (e.g., ChatGPT, Gemini).  
* Simulate a streaming response from the agent:  
  * Words should appear progressively, similar to tokens being streamed.  
  * Each token or chunk should fade in smoothly without causing janky re-renders.  
* Ensure the overall interaction feels native and seamless — avoid layout jumps or scroll snapping as new content arrives.

---

### **3\. Markdown and Math Rendering**

* Use react-native-markdown-display or another working library.  
* Support the following:  
  * Bold, italic, inline code, and lists  
  * Inline LaTeX math ($E \= mc^2$)  
  * Block math ($$ \\int\_{a}^{b} f(x)dx $$)  
* Math should render mid-stream without causing full re-renders or layout shifts.  
* The complete markdown should **render correctly as the response is streamed**, without causing re-renders or content flicker.  
* If math appears mid-stream (e.g., $x^2$ is the square of x), ensure it **doesn’t break the layout** or lead to partial rendering.  
* Consider how markdown and LaTeX are parsed and updated based on your streaming format.

---

### **4\. State Management**

* Use jotai or a comparable state management approach.  
* Chat state can be kept in memory (no persistence required).

---

### **Bonus (Optional)**

* Simulate a flaky network and retry logic during agent response.  
* Add a shimmer/skeleton loading effect while waiting for the agent’s reply.  
* Use AsyncStorage to persist the chat session across restarts.

---

## 

## **Submission Guidelines**

1. Push your code to a public GitHub repository.  
2. Include a [README.md](http://README.md) with:  
   * Setup instructions  
   * Libraries used and reasons for choosing them  
   * Trade-offs made or incomplete parts (if any)  
   * **How you used AI tools** (e.g. ChatGPT, GitHub Copilot, AI linters) — describe where and how they helped  
3. Share a short video (3–5 minutes) or Loom link:  
   * Walk through the working app  
   * Highlight your approach to animation, rendering, markdown handling, etc.

---

## 

## 

## **Evaluation Criteria**

| Category | What We’re Looking For |
| ----- | ----- |
| **Animation & Transitions** | Natural, smooth animations for screen transitions and message streaming |
| **User Experience (UX)** | Clean, fluid scrolling, minimal visual glitches, mobile-native feel |
| **Streaming Logic** | Typewriter effect, fade-in, real-time rendering without stutter |
| **Markdown & Math Rendering** | Correct rendering of markdown and LaTeX, even mid-stream |
| **State Management** | Modular, clean state organization using atoms or custom logic |
| **Code Quality** | Readable, maintainable, idiomatic code with clear separation of concerns |
| **Performance** | No jank or excessive re-renders on mid-tier Android phones |
| **Problem Solving & Trade-offs** | How you approached challenges, handled limitations, and explained your thinking |
| **Use of AI Tools** | Smart and effective use of tools like ChatGPT, Cursor, GitHub Copilot, etc., with explanations |
| **Communication** | Clarity in your README and demo video — what you built, how, and why |

--

