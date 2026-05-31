# AGBase SDK

Plug-and-play AI assistants infrastructure as a service. Seamlessly integrate intelligent AI-powered chat assistants into your applications.

[![npm version](https://img.shields.io/npm/v/@agbase/sdk)](https://www.npmjs.com/package/@agbase/sdk)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

**Homepage:** [agbase](https://agbase.vercel.app)

## 🚀 Features

- ✨ **Ready-to-use Chat Widget** - Drop-in React component for instant chat functionality
- 📄 **Media Upload Support** - Allow users to upload images for AI analysis
- 🎨 **Markdown Support** - Rich text responses with formatting
- 🔔 **Toast Notifications** - User-friendly feedback for errors and interactions
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🎯 **Type-Safe** - Full TypeScript support with types included
- 🔧 **Flexible Client** - Use the AGBaseClient directly for custom integrations
- 🌐 **Less Configuration** - Works out of the box with minimal setup

## 📦 Installation

Install the package using npm, yarn, or pnpm:

```bash
npm install @agbase/sdk
```

## 🎯 Quick Start

### Using the Chat Widget

The easiest way to add AI chat to your application:
<br/>
React:
```tsx
import { ChatWidget } from '@agbase/sdk';

export default function App() {
  return (
    <div>
      <h1>My App</h1>
      <ChatWidget appKey="your-app-key-here" name="YOUR_ASSISTANT_NAME" />
    </div>
  );
}
```
Html:
```tsx
<script 
  src="https://cdn.jsdelivr.net/npm/@agbase/sdk@0.4.0/dist/loader.standalone.js"
  data-app-key="your-app-key-here"
  data-name="YOUR_ASSISTANT_NAME"
></script>
```

### Using the AGBaseClient

For more control, use the client directly:

```typescript
import { AGBaseClient } from '@agbase/sdk';

const ai = new AGBaseClient({
  appKey: 'your-app-key-here'
});
 
// Send only query
const res = await ai.ask(userQuery);
// Send query with user Image
const res = await ai.ask(userQuery, ImageFile);

// Response format
{
    res: string,          // AI response
    image: string|null,   // image URL if relevant
    route: string|null,   // app route for navigation
    elementId: string|null // UI element to highlight
}

```

## 🔗 Resources

- **Homepage:** [agbase](https://agbase.vercel.app)
- **GitHub:** [github.com/agbasehq/agbase-sdk](https://github.com/agbasehq/agbase-sdk)
- **NPM Package:** [@agbase/sdk](https://www.npmjs.com/package/@agbase/sdk)

## 👥 Author

**Dattatray** - [GitHub Profile](https://github.com/Dattatray8)

## 🙏 Support

If you encounter any issues or have questions, please:
1. Check the [documentation](https://agbase.vercel.app/docs)
2. Search existing [issues](https://github.com/agbasehq/agbase-sdk/issues)
3. Create a new issue with detailed information

---

Built with ❤️
