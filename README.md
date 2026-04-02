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

9. **convert_coordinates** - Convert real-world coordinates to DCS
   - Convert Lat/Long (decimal degrees) to DCS X/Z coordinates
   - Optional altitude parameter
   - Uses the theatre's native `coord.LLtoLO` DCS API

10. **convert_dcs_to_ll** - Convert DCS coordinates to Lat/Long
    - Convert DCS X/Z to real-world Latitude/Longitude
    - Optional Y/altitude parameter
    - Uses the theatre's native `coord.LOtoLL` DCS API

## Prerequisites

1. **DCS World** installed with DCS Fiddle server running
2. **Node.js** installed (for running the MCP server)

## Configuration

The MCP server reads settings from `dcs_lua_runner_settings.json` in the following priority order:

1. **Environment Variable** (if set): Path specified in `DCS_SETTINGS_PATH`
2. **MCP Server Directory** (default): `dcs_lua_runner_settings.json` in the same folder as the MCP server
3. **Fallback Defaults**: If no settings file is found, uses default localhost configuration

### Quick Setup

1. Copy the template file:
   ```bash
   cp dcs_lua_runner_settings.json.template dcs_lua_runner_settings.json
   ```

2. Edit the settings file with your DCS server details (the defaults work for most local setups)

The MCP server will automatically find and load the settings file from its own directory.

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

The release zip already contains the pre-built `build/index.js` — no Node.js build step required.

1. **Extract** the release zip (e.g. `dcs-lua-runner-mcp-v1.1.0.zip`) to your preferred location, e.g.:
   ```
   C:\dcs-lua-runner-mcp\
   ```

2. **Run the installer script** — open PowerShell, navigate to the extracted folder and run:
   ```powershell
   .\install-mcp-agent.ps1
   ```

   The script walks you through two steps automatically:

   **Step 1 — DCS Server Settings**
   - Asks whether DCS runs on the same machine (local) or on a remote IP
   - Prompts for port, username, and password (current/template values shown in brackets — press Enter to keep)
   - Saves the result to `dcs_lua_runner_settings.json`

   **Step 2 — Agent Registration**
   - Shows a numbered menu of supported agents with their config status
   - Enter one or more numbers separated by commas or spaces, or type `all`
   - Patches each selected agent config file (creates the file if it doesn't exist yet)

   ```
   1. Claude Desktop
   2. Cline (VS Code extension)
   3. GitHub Copilot Chat (VS Code)
   4. Cursor
   5. Windsurf
   6. Claude Code CLI
   7. GitHub Copilot CLI
   ```

   > **Tip:** You can skip the interactive prompts entirely with flags:
   > ```powershell
   > # Configure specific agents (e.g. Copilot Chat + Cline)
   > .\install-mcp-agent.ps1 -AgentIds 2,3
   >
   > # Configure all agents at once
   > .\install-mcp-agent.ps1 -All
   >
   > # Point to a build in a custom location
   > .\install-mcp-agent.ps1 -ServerPath "D:\tools\dcs-mcp\build\index.js"
   > ```

3. **Install the DCS server script** — copy `dcs-fiddle-server.lua` into your DCS mission scripts or into the DCS `Scripts` folder and load it (see [DCS Server Script Installation](#dcs-server-script-installation)).

4. **Restart your agent** (reload VS Code, restart Claude Desktop, etc.) to apply the configuration changes.

### Method 2: Installation from GitHub

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sevenfifty777/dcs-lua-runner-mcp.git
   cd dcs-lua-runner-mcp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Configure settings and register agents:**

   **Option A — Automatic (recommended):** Run the installer script, which handles both the settings file and agent registration:
   ```powershell
   .\install-mcp-agent.ps1
   ```
   The script guides you through DCS server settings, then lets you pick which agents to configure from a numbered menu.

   **Option B — Manual:**

   Copy the template and fill in your DCS server details:
   ```bash
   cp dcs_lua_runner_settings.json.template dcs_lua_runner_settings.json
   ```
   Edit `dcs_lua_runner_settings.json`:
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

   Then update your agent's MCP config file to point to `build/index.js`.
   Place `dcs_lua_runner_settings.json` in the same directory as the MCP server so it is found automatically.

   **For Cline (VS Code)** — edit `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`:
   ```json
   {
     "mcpServers": {
       "dcs-lua-runner-mcp": {
         "command": "node",
         "args": ["C:/absolute/path/to/dcs-lua-runner-mcp/build/index.js"]
       }
     }
   }
   ```

   **For Claude Desktop** — edit `%APPDATA%\Claude\claude_desktop_config.json` (Windows) or `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):
   ```json
   {
     "mcpServers": {
       "dcs-lua-runner-mcp": {
         "command": "node",
         "args": ["C:/absolute/path/to/dcs-lua-runner-mcp/build/index.js"]
       }
     }
   }
   ```

   **For GitHub Copilot Chat (VS Code)** — edit `%APPDATA%\Code\User\mcp.json`:
   ```json
   {
     "servers": {
       "dcs-lua-runner-mcp": {
         "command": "node",
         "args": ["C:/absolute/path/to/dcs-lua-runner-mcp/build/index.js"],
         "type": "stdio"
       }
     }
   }
   ```

   **For GitHub Copilot CLI** — edit `%USERPROFILE%\.copilot\mcp-config.json`:
   ```json
   {
     "mcpServers": {
       "dcs-lua-runner-mcp": {
         "command": "node",
         "args": ["C:/absolute/path/to/dcs-lua-runner-mcp/build/index.js"],
         "type": "stdio"
       }
     }
   }
   ```

   **Custom settings path** — if `dcs_lua_runner_settings.json` lives elsewhere, pass its path via environment variable:
   ```json
   {
     "mcpServers": {
       "dcs-lua-runner-mcp": {
         "command": "node",
         "args": ["C:/absolute/path/to/dcs-lua-runner-mcp/build/index.js"],
         "env": {
           "DCS_SETTINGS_PATH": "C:/custom/path/to/dcs_lua_runner_settings.json"
         }
       }
     }
   }
   ```

5. **Install the DCS server script** — copy `dcs-fiddle-server.lua` into your DCS mission scripts or into the DCS `Scripts` folder and load it (see [DCS Server Script Installation](#dcs-server-script-installation)).

6. **Restart your agent** (reload VS Code, restart Claude Desktop, etc.)

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

### Convert Coordinates
```
"Convert latitude 41.123, longitude 44.987 to DCS coordinates"
"What are the DCS X/Z coordinates for lat 51.5, lon 37.2?"
"Convert DCS coordinates X=100000, Z=200000 to latitude/longitude"
"What is the real-world position of the unit at DCS X=50000, Z=150000?"
```

## DCS Setup Requirements

> ⚠️ **Security Notice**: Setting up DCS Fiddle requires disabling DCS sandboxing and, optionally, exposing a network port. Read [DCS_Setup_Risks.md](DCS_Setup_Risks.md) for a full risk assessment and mandatory security measures before proceeding.

### 1. DCS Fiddle Server Installation

#### Step 1 — Locate your Saved Games folder

DCS uses a folder under Windows `Saved Games` to store user scripts. The exact name depends on your DCS branch:

| DCS Branch | Saved Games Folder |
|---|---|
| DCS World (stable) | `%USERPROFILE%\Saved Games\DCS` |
| DCS World OpenBeta | `%USERPROFILE%\Saved Games\DCS.openbeta` |

Open File Explorer and navigate to the correct path, e.g.:
```
C:\Users\<YourUser>\Saved Games\DCS
```

#### Step 2 — Create the Hooks folder (if it does not exist)

Inside your Saved Games DCS folder, create the following folder structure if it is not already there:
```
Saved Games\DCS\Scripts\Hooks\
```

On Windows you can do this from PowerShell:
```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\Saved Games\DCS\Scripts\Hooks"
```
> For OpenBeta replace `DCS` with `DCS.openbeta`.

#### Step 3 — Copy the server script

Copy `dcs-fiddle-server.lua` from this repository into the Hooks folder:
```powershell
Copy-Item ".\dcs-fiddle-server.lua" "$env:USERPROFILE\Saved Games\DCS\Scripts\Hooks\"
```

The final path should look like:
```
%USERPROFILE%\Saved Games\DCS\Scripts\Hooks\dcs-fiddle-server.lua
```

#### Step 4 — Verify the script is loaded

After launching DCS, open `%USERPROFILE%\Saved Games\DCS\Logs\dcs.log` and search for:
```
DCS Fiddle successfully initialized
```
If you see this line the server is running and listening on ports **12080** (mission environment) and **12081** (GUI environment).

> **Note**: The Hooks folder is loaded by DCS at startup for both the main menu (GUI environment) and in-mission. You do **not** need to add anything to `autoexec.cfg`.

### 2. DCS Desanitization

⚠️ **Security Warning**: This step disables DCS sandboxing and grants scripts full system access. See [DCS_Setup_Risks.md](DCS_Setup_Risks.md) for the full risk details and how to restore security afterwards.

Edit `DCS_INSTALL\Scripts\MissionScripting.lua` and comment out these two lines:

```lua
--  _G['require'] = nil      -- comment this out
    _G['loadlib'] = nil
--  _G['package'] = nil      -- comment this out
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

## Testing with MCP Inspector

The MCP Inspector is a developer tool that allows you to test and debug your MCP server interactively before integrating it with an AI client.

### Running the Inspector

1. **Ensure the project is built:**
   ```bash
   npm run build
   ```

2. **Start the MCP Inspector:**
   ```bash
   npm run inspector
   ```

3. **Using the Inspector:**
   - The inspector will open in your default web browser
   - You'll see an interactive GUI showing:
     - **Available Tools**: List of all 10 DCS interaction tools
     - **Tool Parameters**: Input fields for each tool's parameters
     - **Request/Response**: Real-time display of MCP communication
     - **Test Results**: Output from each tool execution

4. **Testing Individual Tools:**
   - Select a tool from the list (e.g., `get_mission_info`)
   - Fill in required parameters (if any)
   - Click "Execute" to test the tool
   - View the response in JSON format

5. **Example Test Scenarios:**
   - **Test connection**: Use `get_mission_info` to verify DCS connection
   - **Test Lua execution**: Use `execute_lua` with simple code like `return "Hello from DCS"`
   - **Test spawning**: Use `spawn_unit` with test coordinates
   - **Debug errors**: View detailed error messages and stack traces

### Inspector Benefits

- **No AI client needed**: Test without configuring Cline or Claude Desktop
- **Interactive debugging**: See requests and responses in real-time
- **Parameter validation**: Verify tool inputs before integration
- **Quick iteration**: Test changes immediately after rebuilding

### Notes

- The inspector runs the MCP server in a test environment
- You still need DCS World running with the Fiddle server for actual DCS interaction
- The inspector uses the same `dcs_lua_runner_settings.json` configuration

## Development

### Building from Source

```bash
cd C:\{your_path}\dcs-lua-runner-mcp
npm install
npm run build
```

### Project Structure

```
dcs-lua-runner-mcp/
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

- Original DCS Fiddle: [JonathanTurnock](https://github.com/JonathanTurnock) and [john681611](https://github.com/john681611)
- DCS Lua Runner VSCode Extension: [omltcat](https://github.com/omltcat)
- GUI Implementation: Created for standalone Windows application
- Model Context Protocol: MCP SDK by Anthropic

## Support

For issues related to:
- **MCP Server**: Check the build output and MCP settings
- **DCS Connection**: Verify DCS Fiddle server installation
- **Lua Execution**: Check DCS.log for detailed error messages

## LobeHub

[![MCP Badge](https://lobehub.com/badge/mcp/sevenfifty777-dcs-lua-runner-mcp)](https://lobehub.com/mcp/sevenfifty777-dcs-lua-runner-mcp)