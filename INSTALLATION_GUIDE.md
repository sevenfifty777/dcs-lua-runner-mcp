# DCS Lua Runner MCP Server - Installation Guide

Complete setup instructions for using the DCS Lua Runner MCP server with Cline (VS Code), Claude Desktop, or GitHub Copilot.

## 📦 Distribution Package

To share this MCP server, distribute the entire `dcs-lua-runner` folder containing:
```
dcs-lua-runner/
├── src/
│   └── index.ts          # Source code
├── build/
│   └── index.js          # Compiled JavaScript (generated)
├── package.json          # Dependencies
├── package-lock.json     # Dependency lock file
├── tsconfig.json         # TypeScript config
├── README.md             # Documentation
└── INSTALLATION_GUIDE.md # This file
```

## 🔧 Prerequisites

Before installing, users need:

1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **DCS World** with DCS Fiddle server
   - See "DCS Setup" section below

3. **DCS Lua Runner GUI** (optional, but recommended for settings)
   - Or manually create `dcs_lua_runner_settings.json`

## 📥 Installation Steps

### Step 1: Extract the MCP Server

1. Extract the `dcs-lua-runner` folder to a location of your choice
2. Recommended location: 
   - Windows: `C:\Users\<username>\Documents\Cline\MCP\dcs-lua-runner\`
   - macOS: `~/Documents/Cline/MCP/dcs-lua-runner/`
   - Linux: `~/Documents/Cline/MCP/dcs-lua-runner/`

### Step 2: Install Dependencies

Open a terminal/command prompt in the `dcs-lua-runner` folder:

```bash
cd path/to/dcs-lua-runner
npm install
```

### Step 3: Build the Server

```bash
npm run build
```

This creates the `build/index.js` file needed to run the server.

### Step 4: Create DCS Settings File

You have two options:

#### Option A: Use Existing DCS Lua Runner GUI Settings

If you have DCS Lua Runner GUI installed, note the location of your `dcs_lua_runner_settings.json` file.

Default location: `C:\Users\<username>\Documents\GitHub\dcs_lua_runner_gui\dcs_lua_runner_settings.json`

#### Option B: Create Settings Manually

Create a file named `dcs_lua_runner_settings.json` in a location of your choice with this content:

```json
{
  "server_address": "127.0.0.1",
  "server_port": 12080,
  "server_address_gui": "127.0.0.1",
  "server_port_gui": 12081,
  "use_https": false,
  "web_auth_username": "username",
  "web_auth_password": "password",
  "run_code_locally": true,
  "run_in_mission_env": true,
  "return_display_format": "lua"
}
```

**For Remote DCS Server**, modify these settings:
```json
{
  "server_address": "your.remote.server.com",
  "server_port": 12080,
  "use_https": true,
  "web_auth_username": "your_actual_username",
  "web_auth_password": "your_strong_password",
  "run_code_locally": false,
  "run_in_mission_env": true
}
```

## 🔌 Configure MCP Client

Choose the appropriate section based on your AI client:

---

## 🟦 For Cline (VS Code Extension)

### Configuration File Location

Windows: `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

macOS: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

Linux: `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

### Configuration

1. Open or create `cline_mcp_settings.json`

2. Add the DCS Lua Runner server to the `mcpServers` object:

**Windows:**
```json
{
  "mcpServers": {
    "dcs-lua-runner": {
      "disabled": false,
      "autoApprove": [],
      "timeout": 60,
      "type": "stdio",
      "command": "node",
      "args": [
        "C:\\Users\\<YourUsername>\\Documents\\Cline\\MCP\\dcs-lua-runner\\build\\index.js"
      ],
      "env": {
        "DCS_SETTINGS_PATH": "C:\\Users\\<YourUsername>\\Documents\\GitHub\\dcs_lua_runner_gui\\dcs_lua_runner_settings.json"
      }
    }
  }
}
```

**macOS/Linux:**
```json
{
  "mcpServers": {
    "dcs-lua-runner": {
      "disabled": false,
      "autoApprove": [],
      "timeout": 60,
      "type": "stdio",
      "command": "node",
      "args": [
        "/Users/<YourUsername>/Documents/Cline/MCP/dcs-lua-runner/build/index.js"
      ],
      "env": {
        "DCS_SETTINGS_PATH": "/Users/<YourUsername>/Documents/dcs_lua_runner_settings.json"
      }
    }
  }
}
```

3. **Replace** `<YourUsername>` with your actual username

4. **Update paths** to match where you extracted the files and created your settings

5. Save the file

6. Restart VS Code or reload the Cline extension

---

## 🟨 For Claude Desktop App

### Configuration File Location

Windows: `%APPDATA%\Claude\claude_desktop_config.json`

macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

Linux: `~/.config/Claude/claude_desktop_config.json`

### Configuration

1. Open or create `claude_desktop_config.json`

2. Add the DCS Lua Runner server:

**Windows:**
```json
{
  "mcpServers": {
    "dcs-lua-runner": {
      "command": "node",
      "args": [
        "C:\\Users\\<YourUsername>\\Documents\\Cline\\MCP\\dcs-lua-runner\\build\\index.js"
      ],
      "env": {
        "DCS_SETTINGS_PATH": "C:\\Users\\<YourUsername>\\Documents\\GitHub\\dcs_lua_runner_gui\\dcs_lua_runner_settings.json"
      }
    }
  }
}
```

**macOS/Linux:**
```json
{
  "mcpServers": {
    "dcs-lua-runner": {
      "command": "node",
      "args": [
        "/Users/<YourUsername>/Documents/Cline/MCP/dcs-lua-runner/build/index.js"
      ],
      "env": {
        "DCS_SETTINGS_PATH": "/Users/<YourUsername>/Documents/dcs_lua_runner_settings.json"
      }
    }
  }
}
```

3. **Replace** `<YourUsername>` with your actual username

4. **Update paths** to match your installation

5. Save the file

6. Restart Claude Desktop

---

## 🟩 For GitHub Copilot

⚠️ **Note:** As of now, GitHub Copilot does not have native MCP server support. MCP is primarily supported by:
- Claude Desktop
- Cline (VS Code Extension)
- Other MCP-compatible clients

If GitHub Copilot adds MCP support in the future, the configuration would likely be similar to the above formats.

---

## 🎮 DCS Setup

### 1. Install DCS Fiddle Server

Copy `dcs-fiddle-server.lua` to:
```
%USERPROFILE%\Saved Games\DCS\Scripts\Hooks\
```

Or for DCS OpenBeta:
```
%USERPROFILE%\Saved Games\DCS.openbeta\Scripts\Hooks\
```

### 2. Desanitize DCS Mission Scripting

⚠️ **Security Warning:** This removes DCS security restrictions. Only do this if you understand the risks.

Edit: `DCS_INSTALL\Scripts\MissionScripting.lua`

Find these lines:
```lua
do
    sanitizeModule('os')
    sanitizeModule('io')
    sanitizeModule('lfs')
    _G['require'] = nil
    _G['loadlib'] = nil
    _G['package'] = nil
end
```

Comment out the require and package lines:
```lua
do
    sanitizeModule('os')
    sanitizeModule('io')
    sanitizeModule('lfs')
--  _G['require'] = nil      -- COMMENTED OUT
    _G['loadlib'] = nil
--  _G['package'] = nil      -- COMMENTED OUT
end
```

### 3. Configure DCS Fiddle Server 

Edit `dcs-fiddle-server.lua` to configure:

```lua
FIDDLE.PORT = 12080             -- Mission environment port
FIDDLE.BIND_IP = '127.0.0.1'    -- Use '0.0.0.0' for remote access
FIDDLE.AUTH = true              -- Enable authentication
FIDDLE.USERNAME = 'your_username'
FIDDLE.PASSWORD = 'your_password'
```

### 4. Start DCS

1. Launch DCS World
2. Load a mission
3. The DCS Fiddle server starts automatically
4. Check DCS.log for: "DCS Fiddle successfully initialized"

---

## ✅ Verification

### Test the MCP Server

After configuration, test in your AI client:

**In Cline or Claude Desktop, ask:**
```
"What's the current mission time in DCS?"
```

**Expected response:** Mission time and theatre information

**Additional test commands:**
- "Get my player aircraft information"
- "List all units in the mission"
- "Send a message to DCS saying 'Hello from AI!'"

### Troubleshooting

#### MCP Server Not Connecting

1. Check Node.js is installed: `node --version`
2. Verify build folder exists with `index.js`
3. Check paths in MCP config are correct (use absolute paths)
4. Restart your AI client

#### DCS Connection Errors

**"Connection refused":**
- Ensure DCS is running
- Verify DCS Fiddle server is installed
- Check DCS.log for errors

**"Request timeout":**
- Check firewall settings
- Verify server address/port in settings
- For remote: ensure remote server is accessible

**"Unauthorized":**
- Check username/password match DCS Fiddle configuration
- Verify credentials in `dcs_lua_runner_settings.json`

#### Build Errors

If `npm run build` fails:
```bash
# Clean and rebuild
rm -rf node_modules build
npm install
npm run build
```

---

## 📝 Quick Reference

### File Paths Summary

| Item | Location |
|------|----------|
| MCP Server | `<extract-location>/dcs-lua-runner/` |
| Build Output | `<extract-location>/dcs-lua-runner/build/index.js` |
| DCS Settings | User-defined (see Step 4) |
| Cline Config | `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json` |
| Claude Config | `%APPDATA%\Claude\claude_desktop_config.json` |
| DCS Fiddle Server | `%USERPROFILE%\Saved Games\DCS\Scripts\Hooks\dcs-fiddle-server.lua` |

### Configuration Keys

| Key | Required | Description |
|-----|----------|-------------|
| `command` | Yes | `"node"` |
| `args` | Yes | Path to `build/index.js` |
| `env.DCS_SETTINGS_PATH` | Yes | Path to settings JSON |
| `disabled` | No (Cline) | Set to `false` to enable |
| `autoApprove` | No (Cline) | Leave as `[]` for manual approval |

---

## 🔐 Security Notes

1. **Credentials Storage:** Settings file contains DCS server credentials
2. **File Permissions:** Restrict access to settings file on multi-user systems
3. **Remote Access:** Always use HTTPS for remote DCS servers
4. **Strong Passwords:** Use complex passwords for remote authentication
5. **VPN Recommended:** For remote connections, use VPN when possible

---

## 📚 Additional Resources

- **DCS Lua Runner GUI:** https://github.com/sevenfifty777/dcs_lua_runner_gui
- **DCS Fiddle:** https://github.com/JonathanTurnock/dcsfiddle
- **MCP Documentation:** https://modelcontextprotocol.io/
- **Support:** Check the README.md in this folder

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Credits

- Based on DCS Lua Runner GUI
- DCS Fiddle by JonathanTurnock and john681611
- Model Context Protocol by Anthropic
