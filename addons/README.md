# T_U_B Addons

This folder contains additional features integrated into the T_U_B website.

## Web Proxy (`web-proxy/`)

**Description:** A lightweight, anonymous web proxy browser that allows users to browse websites privately through multiple proxy services.

**Features:**
- Multi-tab browsing support
- Multiple proxy backends (CORS Lol, Code Tabs, All Origins)
- Search engine selection (Google, Bing, DuckDuckGo)
- Back/Forward/Reload navigation
- URL address bar with secure/unsafe indicators
- Fullscreen mode support
- Settings management

**Files:**
- `index.html` - Main interface
- `styles.css` - Styling (rebranded from original)
- `script.js` - Core functionality

**Branding Changes:**
- Removed all Helios/dinguschan references
- Changed theme colors to T_U_B scheme (#4dffa6 green)
- Updated titles and headers to reference "T_U_B Web Proxy"
- Rebranded internal URLs from `helios://` to `tubproxy://`

**Usage:** Click "Web Proxy" in the main navigation to open in a new tab.

---

## AI Chat (`ai-chat/`)

**Description:** A modern AI chatbot interface for conversational assistance. Powered by free AI APIs with a clean, intuitive interface.

**Features:**
- Real-time chat interface
- Auto-expanding textarea for messages
- Loading indicators
- Message history
- Responsive design
- Customizable AI model support
- Clean, modern UI with T_U_B branding

**Files:**
- `index.html` - Complete standalone chatbot application

**Branding Changes:**
- All headers reference "T_U_B AI" instead of "Helios AI"
- Color scheme matches T_U_B (#4dffa6 accent color)
- Custom robot avatar with T_U_B styling
- "Made by T_U_B" attribution

**Usage:** Click "AI Chat" in the main navigation to open in a new tab.

**Note:** The chat functionality requires an internet connection and works best with free public AI APIs.

---

## Technical Details

### Removed Branding & Security Features

The following were removed from the original code:
- Google Analytics tracking (removed gtag.js)
- GitHub repository links
- Original creator attribution ("dinguschan")
- Helios-specific branding throughout
- Proprietary telemetry

### New Branding Elements

All addons now feature:
- T_U_B color scheme (#4dffa6 for accents)
- "Made by T_U_B" attribution
- Consistent UI styling matching the main site
- T_U_B-specific internal references

### Security Notes

- Web Proxy uses legitimate CORS proxy services
- No data collection or tracking
- Client-side processing for sensitive operations
- All proxy requests are from the client browser (no server-side logging)

---

## Future Enhancements

Possible additions to the addons folder:
- Enhanced file manager
- Code editor
- Media player
- Calculator tool
- Password manager
- Note-taking application

---

**Version:** 1.0  
**Last Updated:** November 2025  
**Status:** Production Ready
