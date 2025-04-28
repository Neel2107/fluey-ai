# Fluey AI - Modern Chat Interface

A React Native chat application with modern AI chat features, including streaming responses, markdown rendering, and math support.

## Features

- 🚀 Smooth transitions between screens
- 💬 Real-time streaming responses
- 📝 Markdown and LaTeX math rendering
- 🎨 Beautiful UI with skeleton loading
- 🔄 State management with Zustand
- 💾 Chat session persistence

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fluey-ai.git
cd fluey-ai
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```
EXPO_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

4. Start the development server:
```bash
npm start
# or
yarn start
```

## Libraries Used

### Core Libraries
- **React Native**: Base framework for building cross-platform mobile applications
- **Expo**: Development platform for React Native apps
- **TypeScript**: For type safety and better developer experience

### UI & Animation
- **react-native-reanimated**: For smooth animations and transitions
- **@gorhom/bottom-sheet**: For bottom sheet interactions
- **@shopify/flash-list**: High-performance list implementation
- **react-native-markdown-display**: For rendering markdown content
- **react-native-math-view**: For rendering LaTeX math expressions

### State Management
- **Zustand**: Lightweight state management solution
- **AsyncStorage**: For persisting chat sessions

### Development Tools
- **ESLint**: For code linting
- **Prettier**: For code formatting
- **TypeScript**: For type checking

## Why We Chose These Libraries

1. **React Native & Expo**: 
   - Cross-platform development
   - Rich ecosystem of libraries
   - Hot reloading for faster development

2. **react-native-reanimated**:
   - Performance-optimized animations
   - Native thread execution
   - Smooth transitions between screens

3. **@gorhom/bottom-sheet**:
   - Native-like bottom sheet behavior
   - Smooth animations
   - Customizable appearance

4. **@shopify/flash-list**:
   - Better performance than FlatList
   - Memory efficient
   - Smooth scrolling

5. **Zustand**:
   - Simple and intuitive API
   - No boilerplate
   - Good TypeScript support

## Trade-offs and Limitations

1. **Message Scrolling Behavior**:
   - We were unable to implement the smooth upward scrolling of previous messages when new messages arrive
   - This is a limitation of the current implementation and differs from modern AI chat interfaces like ChatGPT and Gemini

2. **Performance Issues**:
   - Some janky re-renders occur during message streaming
   - This is particularly noticeable with long messages or when rendering complex markdown/math content

3. **Math Rendering**:
   - Math rendering can cause layout shifts during streaming
   - Complex equations may take longer to render

## AI Tools Usage

We leveraged AI tools extensively throughout the development process:

1. **Prototyping and Architecture**:
   - Used AI to quickly prototype different approaches to streaming and message handling
   - Generated initial component structures and state management patterns

2. **Code Generation**:
   - Generated boilerplate code for components and hooks
   - Created utility functions for message processing and rendering

3. **Problem Solving**:
   - Used AI to debug performance issues and rendering problems
   - Generated alternative implementations for complex features

4. **Documentation**:
   - Assisted in writing clear and comprehensive documentation
   - Generated code comments and explanations

## Future Improvements

1. Optimize message rendering to reduce jank
2. Add proper message scrolling behavior
3. Improve math rendering performance
4. Add more customization options for the UI

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
