# Open Grammarly

An open-source, AI-powered grammar and spelling checker Chrome extension. Uses OpenRouter API to provide real-time writing assistance on any website.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)

## Features

- **Real-time Grammar Checking** - Automatically detects grammar and spelling errors as you type
- **Smart Corrections** - Hover over underlined text to see suggestions with one-click fixes
- **Works Everywhere** - Functions on any website with text inputs, textareas, and contenteditable elements
- **Multiple Writing Modes** - Choose between Casual, Professional, and Academic styles
- **Adjustable Aggressiveness** - Control how strict the grammar checking should be
- **Privacy-Focused** - Your API key is stored locally in your browser

## Screenshots

### Correction Popup
When you hover over an underlined word, a popup appears showing:
- The type of issue (e.g., "Use the right word", "Punctuation problem")
- The suggested correction
- Option to dismiss the suggestion

### Extension Popup
Quick access to enable/disable the extension and view your current AI model.

### Settings Page
Configure your API key, select AI model, and customize writing preferences.

## Installation

### From Source

1. Clone the repository:
   ```bash
   git clone https://github.com/Aaryan6/open-grammarly.git
   cd open-grammarly
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## Configuration

1. Click the extension icon in Chrome toolbar
2. Click the settings gear icon
3. Enter your OpenRouter API key
4. Configure your preferences:
   - **Writing Mode**: Casual, Professional, or Academic
   - **Aggressiveness**: How strict the grammar checking should be

### Getting an OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Generate a new API key
5. Copy and paste it into the extension settings

## Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4
- **Build Tool**: Vite 7 with CRXJS plugin
- **AI Integration**: OpenRouter API
- **Text Diffing**: diff-match-patch for fuzzy matching

## Project Structure

```
src/
├── background/       # Service worker for API calls
│   └── index.ts
├── content/          # Content script injected into pages
│   ├── index.ts      # Main content script
│   ├── dom-observer.ts   # Observes DOM for text fields
│   └── ui-injector.ts    # Renders underlines and popups
├── lib/
│   ├── openrouter.ts # API integration and text analysis
│   └── storage.ts    # Chrome storage utilities
├── options/          # Extension options page
│   ├── Options.tsx
│   └── main.tsx
├── popup/            # Extension popup
│   ├── Popup.tsx
│   └── main.tsx
└── style.css         # Global styles
```

## How It Works

1. **DOM Observation**: The content script observes all text inputs, textareas, and contenteditable elements on the page
2. **Debounced Analysis**: When you stop typing, the text is sent to the background script
3. **AI Processing**: The background script calls OpenRouter API with the text
4. **Validation**: Corrections are validated and positioned accurately using fuzzy matching
5. **UI Rendering**: Underlines are rendered in a shadow DOM overlay, with popups on hover

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [ISC License](LICENSE).

## Acknowledgments

- [OpenRouter](https://openrouter.ai/) for providing AI model access
- [CRXJS](https://crxjs.dev/) for the excellent Chrome extension Vite plugin
- [Lucide](https://lucide.dev/) for beautiful icons
