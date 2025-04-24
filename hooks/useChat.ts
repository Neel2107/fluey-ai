import { Message } from '@/types/chat';
import { generateMessageId } from '@/utils/messageUtils';
import { useCallback, useState } from 'react';

export const useChat = (initialMessage?: string) => {
    const [messages, setMessages] = useState<Message[]>(
        initialMessage ? [{ id: generateMessageId(), text: initialMessage, isUser: true }] : []
    );
    const [isStreaming, setIsStreaming] = useState(false);

    const simulateStreamingResponse = async (response: string) => {
        setIsStreaming(true);
        const responseId = generateMessageId();

        // Test message with various markdown and math features
        const testContent = `
Here's a test message demonstrating markdown and math features:

1. **Bold Text** and *Italic Text*
2. Inline code: \`console.log("Hello")\`
3. Math equations:
   - Inline: $E = mc^2$
   - Block: 
     $$
     \\int_{a}^{b} f(x)dx = F(b) - F(a)
     $$
4. Lists:
   - First item
   - Second item
     - Nested item
5. Code block:
\`\`\`javascript
function hello() {
  console.log("Hello World!");
}
\`\`\`
6. More math:
   - Quadratic formula: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$
   - Matrix:
     $$
     \\begin{bmatrix}
     a & b \\\\
     c & d
     \\end{bmatrix}
     $$
`;

        setMessages(prev => [...prev, { id: responseId, text: '', isUser: false, isStreaming: true }]);

        // Simulate streaming by adding content gradually
        const words = testContent.split(' ');
        let streamedText = '';

        for (let word of words) {
            await new Promise(resolve => setTimeout(resolve, 50));
            streamedText += (streamedText ? ' ' : '') + word;
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === responseId
                        ? { ...msg, text: streamedText }
                        : msg
                )
            );
        }

        setMessages(prev =>
            prev.map(msg =>
                msg.id === responseId
                    ? { ...msg, isStreaming: false }
                    : msg
            )
        );
        setIsStreaming(false);
    };

    const addMessage = useCallback((text: string, isUser: boolean) => {
        const newMessage = {
            id: generateMessageId(),
            text: text.trim(),
            isUser
        };
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
    }, []);

    return {
        messages,
        isStreaming,
        simulateStreamingResponse,
        addMessage
    };
};