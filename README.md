# DCS Lua Runner MCP Server

An MCP (Model Context Protocol) server that enables AI assistants to interact with DCS World (Digital Combat Simulator) in real-time through chat.

## Features

This MCP server provides the following tools for AI interaction with DCS:

### Tools Available

1. **execute_lua** - Execute arbitrary Lua code on DCS server
   - Execute custom Lua scripts
   - Choice of mission or GUI environment
   - Returns execution results

2. **get_mission_info** - Get current mission information
   - Mission time
   - Theatre/map name
   - Mission date

3. **get_player_info** - Get player aircraft information
   - Aircraft name and type
   - Position (x, y, z coordinates)
   - Altitude
   - Speed
   - Heading

4. **get_all_units** - List all units in the mission
   - Filter by coalition (red, blue, neutral, or all)
   - Unit names, types, positions
   - Coalition affiliations

5. **spawn_unit** - Spawn new units in the mission
   - Ground units or vehicles
   - Specify position, heading, coalition
   - Custom unit names

6. **send_message** - Display messages in DCS
   - Send text messages to all players
   - Configurable display duration

7. **get_theatre_info** - Get theatre/map information
   - Current map name
   - Theatre details

8. **get_aircraft_list** - List all aircraft in mission
   - All airborne units
   - Positions and altitudes
   - Coalition information

## Prerequisites

1. **DCS World** installed with DCS Fiddle server running
2. **DCS Lua Runner GUI** application configured
3. **Node.js** installed (for running the MCP server)

## Configuration

The MCP server automatically reads settings from your DCS Lua Runner configuration file located at:
```
C:\Users\<username>\Documents\GitHub\dcs_lua_runner_gui\dcs_lua_runner_settings.json
```

You can override the settings path with the `DCS_SETTINGS_PATH` environment variable.

### Settings Used

- `server_address` - DCS server address for remote connections
- `server_port` - Port for mission environment (default: 12080)
- `server_address_gui` - GUI environment server address
- `server_port_gui` - Port for GUI environment (default: 12081)
- `use_https` - Whether to use HTTPS
- `web_auth_username` - Username for authentication
- `web_auth_password` - Password for authentication
- `run_code_locally` - Execute on local server (127.0.0.1)
- `run_in_mission_env` - Execute in mission vs GUI environment

## Installation

### Method 1: Direct Installation (Pre-built)

If you received a pre-built version:

1. Extract the `dcs-lua-runner` folder to your preferred location
2. Navigate to the folder and install dependencies:
   ```bash
   cd dcs-lua-runner
   npm install
   npm run build
   ```
3. Create your settings file (copy from `dcs_lua_runner_settings.json.template`)
4. Configure your MCP client (see Configuration section below)

### Method 2: Installation from GitHub

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/dcs-lua-runner.git
   cd dcs-lua-runner
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Create settings file:**
   
   Copy `dcs_lua_runner_settings.json.template` to `dcs_lua_runner_settings.json` and update with your DCS server details:
   ```bash
   cp dcs_lua_runner_settings.json.template dcs_lua_runner_settings.json
   ```
   
   Then edit `dcs_lua_runner_settings.json` with your settings:
   ```json
   {
     "server_address": "127.0.0.1",
     "server_port": 12080,
     "server_address_gui": "127.0.0.1",
     "server_port_gui": 12081,
     "use_https": false,
     "web_auth_username": "your_username",
     "web_auth_password": "your_password",
     "run_code_locally": true,
     "run_in_mission_env": true,
     "return_display_format": "lua"
   }
   ```

5. **Configure your MCP client:**

   **For Cline (VS Code):**
   
   Edit `cline_mcp_settings.json` located at:
   ```
   %APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json
   ```
   
   Add the server configuration:
   ```json
   {
     "mcpServers": {
       "dcs-lua-runner": {
         "command": "node",
         "args": ["/absolute/path/to/dcs-lua-runner/build/index.js"],
         "env": {
           "DCS_SETTINGS_PATH": "/absolute/path/to/dcs_lua_runner_settings.json"
         }
       }
     }
   }
   ```

   **For Claude Desktop:**
   
   Edit `claude_desktop_config.json` located at:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   
   Add the server configuration:
   ```json
   {
     "mcpServers": {
       "dcs-lua-runner": {
         "command": "node",
         "args": ["/absolute/path/to/dcs-lua-runner/build/index.js"],
         "env": {
           "DCS_SETTINGS_PATH": "/absolute/path/to/dcs_lua_runner_settings.json"
         }
       }
     }
   }
   ```

6. **Restart your MCP client** (VS Code or Claude Desktop)

7. **Test the connection:**
   
   Ask your AI assistant: "What's the current mission time in DCS?"

### Verification

After installation, verify the MCP server is working:

1. Check that `build/index.js` exists
2. Ensure DCS World is running with DCS Fiddle server
3. Ask your AI assistant to get mission info
4. Check MCP server logs in your client for any errors

## Usage Examples

Once the MCP server is running, you can ask your AI assistant to interact with DCS:

### Get Mission Information
```
"What's the current mission time in DCS?"
"What theatre/map am I flying in?"
```

### Get Player Information
```
"Where is my aircraft?"
"What's my current altitude and speed?"
```

### Spawn Units
```
"Spawn a T-72B tank at coordinates x=100000, z=200000 for the red coalition"
"Create an M-1 Abrams at position 150000, 250000 facing north"
```

### Send Messages
```
"Send a message to all players saying 'Mission starting in 5 minutes'"
```

### Execute Custom Lua
```
"Execute this Lua code in DCS: return timer.getTime()"
"Run this script to get all blue coalition units"
```

### List Units and Aircraft
```
"Show me all units in the mission"
"List all red coalition aircraft"
"What aircraft are currently in the mission?"
```

## DCS Setup Requirements

### 1. DCS Fiddle Server Installation

Ensure the DCS Fiddle server script (`dcs-fiddle-server.lua`) is installed in:
```
%USERPROFILE%\Saved Games\DCS\Scripts\Hooks\
```

### 2. DCS Desanitization

⚠️ **Security Warning**: This requires removing DCS security restrictions.

Edit `DCS_INSTALL\Scripts\MissionScripting.lua` and comment out these lines:

```lua
do
    sanitizeModule('os')
    sanitizeModule('io')
    sanitizeModule('lfs')
--  _G['require'] = nil      -- Comment this line
    _G['loadlib'] = nil
--  _G['package'] = nil      -- Comment this line
end
```

### 3. Start DCS

1. Launch DCS World
2. The DCS Fiddle server will start automatically
3. Verify the server is running (check DCS.log for "DCS Fiddle successfully initialized")

## Troubleshooting

### Connection Errors

**Error**: "Connection refused - check if DCS Fiddle server is running"
- **Solution**: Ensure DCS is running and DCS Fiddle server is installed correctly

**Error**: "Request timeout - check server connection"
- **Solution**: Check if DCS Fiddle server is bound to the correct address/port
- Verify firewall settings if using remote connections

### Authentication Errors

**Error**: Unauthorized (401)
- **Solution**: Check username/password in `dcs_lua_runner_settings.json`
- Ensure authentication settings match DCS Fiddle server configuration

### Execution Errors

**Error**: "No player found"
- **Solution**: Ensure you're in a mission with a player-controlled aircraft
- Try switching between mission and GUI environments

**Error**: Lua execution errors
- **Solution**: Check Lua syntax and DCS API availability
- Some functions only work in mission environment

## Development

### Building from Source

```bash
cd C:\{your_path}\dcs-lua-runner
npm install
npm run build
```

### Project Structure

```
dcs-lua-runner/
├── src/
│   └── index.ts          # Main MCP server implementation
├── build/
│   └── index.js          # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

### Adding New Tools

To add new DCS interaction tools:

1. Add tool definition to `ListToolsRequestSchema` handler
2. Implement tool logic in `CallToolRequestSchema` handler
3. Rebuild: `npm run build`

## Security Considerations

- **Local Execution**: By default, executes on `127.0.0.1` (localhost only)
- **Remote Execution**: Requires authentication (username/password)
- **Code Validation**: All Lua code is base64-encoded before transmission
- **DCS Security**: Requires DCS desanitization (understand the risks!)

## License

MIT License - Based on the DCS Lua Runner GUI project

## Credits

- DCS Lua Runner GUI - Python application for DCS interaction
- DCS Fiddle - Original DCS HTTP server implementation
- Model Context Protocol - MCP SDK by Anthropic

## Support

For issues related to:
- **MCP Server**: Check the build output and MCP settings
- **DCS Connection**: Verify DCS Fiddle server installation
- **Lua Execution**: Check DCS.log for detailed error messages
