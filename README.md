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
   - Specify position using DCS coordinates, Lat/Long, or MGRS
   - Custom unit names and heading
   - Automatic coordinate conversion

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

If you received a pre-built version:

1. Extract the `dcs-lua-runner-mcp` folder to your preferred location
2. Navigate to the folder and install dependencies:
   ```bash
   cd dcs-lua-runner-mcp
   npm install
   npm run build
   ```
3. Create your settings file (copy from `dcs_lua_runner_settings.json.template`)
4. Configure your MCP client (see Configuration section below)

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

   You have two options for settings file location:

   **Option A: Settings in MCP Server Directory (Recommended)**
   
   Place `dcs_lua_runner_settings.json` in the same directory as the MCP server. The server will automatically find it.

   **For Cline (VS Code):**
   
   Edit `cline_mcp_settings.json` located at:
   ```
   %APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json
   ```
   
   Add the server configuration:
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

   **For Claude Desktop:**
   
   Edit `claude_desktop_config.json` located at:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   
   Add the server configuration:
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

   ---

   **Option B: Custom Settings Location**
   
   If you want to place `dcs_lua_runner_settings.json` in a different location (e.g., shared across multiple installations), use the `DCS_SETTINGS_PATH` environment variable.

   **For Cline (VS Code):**
   
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

   **For Claude Desktop:**
   
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

**Using DCS coordinates:**
```
"Spawn a T-72B tank at coordinates x=100000, z=200000 for the red coalition"
"Create an M-1 Abrams at position 150000, 250000 facing north"
```

**Using Latitude/Longitude:**
```
"Spawn an M-1 Abrams at latitude 42.3601, longitude 43.3517 for the blue coalition"
"Create a tank at lat/lon 35.5, 45.8"
```

**Using MGRS coordinates:**
```
"Spawn a T-72B at MGRS 37SCA4022505929 for the red coalition"
"Create a tank at MGRS '38T MK 12345 67890' heading 90 degrees"
```

### Convert Coordinates

**Convert real-world coordinates to DCS:**
```
"Convert latitude 42.3601, longitude 43.3517 to DCS coordinates"
"Convert MGRS 38TMK1234567890 to DCS coordinates"
"What are the DCS coordinates for MGRS '37 S CA 40225 05929'?"
```

**Convert DCS coordinates to Lat/Long:**
```
"Convert DCS coordinates x=100000, z=200000 to latitude and longitude"
"What's the real-world location of DCS position x=50000, z=75000?"
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

## 🌍 Coordinate Conversion

The MCP server supports automatic coordinate conversion between real-world coordinate systems and DCS world coordinates.

### Supported Coordinate Systems

**DCS World Coordinates:**
- Native X, Z coordinate system (meters from map origin)
- Y coordinate for altitude

**Real-World Coordinates:**
- **Latitude/Longitude**: Decimal degrees format (e.g., 42.3601, 43.3517)
- **MGRS (Military Grid Reference System)**: Standard military coordinate format
  - Supports formats with or without spaces: `38TMK1234567890` or `38T MK 12345 67890`
  - Full format: Zone + Band + Digraph + Easting + Northing (e.g., `37SCA4022505929`)

### Coordinate Conversion Tools

#### convert_coordinates
Converts real-world coordinates (Lat/Long or MGRS) to DCS world coordinates.

**Example usage:**
```
"Convert latitude 42.3601, longitude 43.3517 to DCS coordinates"
"Convert MGRS 38TMK1234567890 to DCS coordinates"
```

Returns DCS X, Z coordinates plus the original coordinates for reference.

#### convert_dcs_to_ll
Converts DCS world coordinates to real-world Latitude/Longitude.

**Example usage:**
```
"Convert DCS coordinates x=100000, z=200000 to latitude and longitude"
"What's the real-world location of x=50000, z=75000?"
```

Returns Latitude and Longitude in decimal degrees.

### Enhanced spawn_unit Tool

The `spawn_unit` tool accepts coordinates in three different formats:

1. **DCS Coordinates** (traditional): `x` and `z` parameters
2. **Latitude/Longitude**: `latitude` and `longitude` parameters
3. **MGRS**: `mgrs` parameter (e.g., "38TMK1234567890" or "38T MK 12345 67890")

The server automatically converts real-world coordinates to DCS coordinates before spawning.

### MGRS Format Support

All these MGRS formats are supported:
- `38TMK1234567890` (no spaces, 10-digit precision)
- `38T MK 12345 67890` (with spaces)
- `37SCA4022505929` (different zone)
- `37 S CA 40225 05929` (with spaces)

The parser automatically handles spaces and extracts all required components (UTM Zone, Band, MGRS Digraph, Easting, Northing) for accurate conversion.

## DCS Setup Requirements

> ⚠️ **Security Notice**: Setting up DCS Fiddle requires disabling DCS sandboxing and, optionally, exposing a network port. Read [DCS_SetUp_Risks.md](DCS_SetUp_Risks.md) for a full risk assessment and mandatory security measures before proceeding.

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

⚠️ **Security Warning**: This step disables DCS sandboxing and grants scripts full system access. See [DCS_SetUp_Risks.md](DCS_SetUp_Risks.md) for the full risk details and how to restore security afterwards.

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

## ⚠️ Dependency Security Warning

> **Before installing or running any release of this project — including pre-built distributions — always verify that the bundled dependencies have no known vulnerabilities.**

The npm ecosystem is an active target for supply chain attacks. New vulnerabilities can be discovered **at any time after a release is published**, meaning a package that was safe on release day may become dangerous weeks or months later.

### What to check before use

1. **Run an audit on the installed packages:**
   ```bash
   npm audit
   ```
   If any high or critical vulnerabilities are reported, **do not use the release until they are resolved**.

2. **Cross-check dependency versions against known incidents:**
   - Check [socket.dev](https://socket.dev) or [snyk.io](https://snyk.io/advisor/npm-package) for the exact versions in `package-lock.json`
   - Be especially alert to packages that may have been **compromised after release** (e.g., the [axios supply chain attack of March 2026](https://socket.dev/blog/axios-npm-package-compromised) which affected `axios@1.14.1` — a version that looked like a routine patch release)

3. **Treat pre-built distributions with extra caution:**
   - The bundled `node_modules/` in a ZIP release is a snapshot in time
   - Run `npm install` fresh from `package-lock.json` rather than using the bundled `node_modules` when possible
   - Verify the `package-lock.json` has **exact pinned versions** (no `^` or `~` ranges for direct dependencies)

4. **If in doubt, rebuild from source:**
   ```bash
   git clone https://github.com/sevenfifty777/dcs-lua-runner-mcp.git
   cd dcs-lua-runner-mcp
   npm install
   npm audit
   npm run build
   ```

### This release's dependency pins

| Package | Pinned Version | Notes |
|---|---|---|
| `@modelcontextprotocol/sdk` | `1.29.0` | Patched ReDoS + DNS rebinding CVEs |
| `axios` | `1.14.0` | Patched DoS CVE; `1.14.1` was malicious (supply chain attack) |

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

## LoveHub

[![MCP Badge](https://lobehub.com/badge/mcp/sevenfifty777-dcs-lua-runner-mcp)](https://lobehub.com/mcp/sevenfifty777-dcs-lua-runner-mcp)