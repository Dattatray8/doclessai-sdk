# DoclessAI SDK

Plug-and-play AI assistants infrastructure as a service. Seamlessly integrate intelligent AI-powered chat assistants into your applications.

[![npm version](https://img.shields.io/npm/v/@doclessai/sdk)](https://www.npmjs.com/package/@doclessai/sdk)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

**Homepage:** [doclessai.com](https://doclessai.vercel.app)

## 🚀 Features

- ✨ **Ready-to-use Chat Widget** - Drop-in React component for instant chat functionality
- 📄 **Media Upload Support** - Allow users to upload images for AI analysis
- 🎨 **Markdown Support** - Rich text responses with formatting
- 🔔 **Toast Notifications** - User-friendly feedback for errors and interactions
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🎯 **Type-Safe** - Full TypeScript support with types included
- 🔧 **Flexible Client** - Use the DoclessClient directly for custom integrations
- 🌐 **Less Configuration** - Works out of the box with minimal setup

## 📦 Installation

Install the package using npm, yarn, or pnpm:

```bash
npm install @doclessai/sdk
```

## 🎯 Quick Start

### Using the Chat Widget (React)

The easiest way to add AI chat to your application:

```tsx
import { ChatWidget } from '@doclessai/sdk';

export default function App() {
  return (
    <div>
      <h1>My App</h1>
      <ChatWidget appKey="your-app-key-here" />
    </div>
  );
}
```

### Using the DoclessClient

For more control, use the client directly:

```typescript
import { DoclessClient } from '@doclessai/sdk';

const client = new DoclessClient({
  appKey: 'your-app-key-here'
});

// Ask a question
const response = await client.ask('user-query');
console.log(response.res); 

// Ask with image attachment
const response = await client.ask('user-query',image);
console.log(response.res);  // text response
console.log(response.image);  // image url if returned

```

## 🔗 Resources

- **Homepage:** [doclessai.com](https://doclessai.vercel.app)
- **GitHub:** [github.com/Dattatray8/doclessai-sdk](https://github.com/Dattatray8/doclessai-sdk)
- **NPM Package:** [@doclessai/sdk](https://www.npmjs.com/package/@doclessai/sdk)

## 👥 Author

**Dattatray** - [GitHub Profile](https://github.com/Dattatray8)

## 🙏 Support

If you encounter any issues or have questions, please:
1. Check the [documentation](https://doclessai.vercel.app/get-started)
2. Search existing [issues](https://github.com/Dattatray8/doclessai-sdk/issues)
3. Create a new issue with detailed information

---

Built with ❤️ by the DoclessAI team.
