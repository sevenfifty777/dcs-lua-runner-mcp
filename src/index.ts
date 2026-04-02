#!/usr/bin/env node

/**
 * DCS Lua Runner MCP Server
 * 
 * This MCP server allows AI assistants to interact with DCS World by:
 * - Executing Lua code on DCS servers (local or remote)
 * - Getting mission information
 * - Getting player/aircraft information
 * - Spawning units
 * - Sending messages to DCS
 * 
 * It reuses the configuration from dcs_lua_runner_settings.json
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * DCS Client Configuration
 */
interface DCSSettings {
  server_address?: string;
  server_port?: number;
  server_address_gui?: string;
  server_port_gui?: number;
  use_https?: boolean;
  web_auth_username?: string;
  web_auth_password?: string;
  run_code_locally?: boolean;
  run_in_mission_env?: boolean;
  return_display_format?: string;
}

/**
 * Load settings from the DCS Lua Runner settings file
 */
function loadDCSSettings(): DCSSettings {
  // Priority order for settings file location:
  // 1. DCS_SETTINGS_PATH environment variable (if set)
  // 2. dcs_lua_runner_settings.json in the MCP server directory
  // 3. Fall back to defaults if file not found
  
  let settingsPath: string;
  
  if (process.env.DCS_SETTINGS_PATH) {
    settingsPath = process.env.DCS_SETTINGS_PATH;
  } else {
    // Use settings file in the MCP server directory (parent of build/)
    settingsPath = join(__dirname, '..', 'dcs_lua_runner_settings.json');
  }
  
  try {
    const settingsData = readFileSync(settingsPath, 'utf-8');
    console.error(`Loaded DCS settings from: ${settingsPath}`);
    return JSON.parse(settingsData);
  } catch (error) {
    console.error(`Warning: Could not load DCS settings from ${settingsPath}, using defaults`);
    return {
      server_address: '127.0.0.1',
      server_port: 12080,
      server_address_gui: '127.0.0.1',
      server_port_gui: 12081,
      use_https: false,
      web_auth_username: 'username',
      web_auth_password: 'password',
      run_code_locally: true,
      run_in_mission_env: true,
      return_display_format: 'lua'
    };
  }
}

/**
 * DCS Client for executing Lua code
 */
class DCSClient {
  private timeout = 3000;
  
  async runLua(luaCode: string, settings: DCSSettings): Promise<{ success: boolean; result: any }> {
    try {
      // Encode Lua code to base64
      const luaBase64 = Buffer.from(luaCode, 'utf-8').toString('base64');
      
      // Build server URL
      const protocol = settings.use_https ? 'https' : 'http';
      
      let serverAddress: string;
      let serverPort: number;
      let useAuth = false;
      
      if (settings.run_code_locally) {
        serverAddress = '127.0.0.1';
        serverPort = settings.run_in_mission_env ? 12080 : 12081;
        useAuth = false;
      } else {
        if (settings.run_in_mission_env) {
          serverAddress = settings.server_address || '127.0.0.1';
          serverPort = settings.server_port || 12080;
        } else {
          serverAddress = settings.server_address_gui || settings.server_address || '127.0.0.1';
          serverPort = settings.server_port_gui || (settings.server_port || 12080) + 1;
        }
        useAuth = true;
      }
      
      const url = `${protocol}://${serverAddress}:${serverPort}/${luaBase64}?env=default`;
      
      // Prepare request config
      const requestConfig: any = {
        timeout: this.timeout,
      };
      
      // Add authentication if needed
      if (useAuth && !settings.run_code_locally) {
        requestConfig.auth = {
          username: settings.web_auth_username || 'username',
          password: settings.web_auth_password || 'password',
        };
      }
      
      // Make request
      const response = await axios.get(url, requestConfig);
      
      if (response.status === 200) {
        const data = response.data;
        if ('result' in data) {
          return { success: true, result: data.result };
        } else {
          return { success: true, result: "SUCCESSFUL EXECUTION - NO RETURN VALUE" };
        }
      } else {
        return { success: false, result: `HTTP ${response.status}: ${response.statusText}` };
      }
      
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          return { success: false, result: "Request timeout - check server connection" };
        } else if (error.code === 'ECONNREFUSED') {
          return { success: false, result: "Connection refused - check if DCS Fiddle server is running" };
        } else if (error.response?.status === 500) {
          const errorData = error.response.data;
          return { success: false, result: errorData?.error || 'Internal server error' };
        } else {
          return { success: false, result: `Request error: ${error.message}` };
        }
      }
      return { success: false, result: `Unexpected error: ${error.message}` };
    }
  }
  
  formatResultAsLua(result: any): string {
    if (result === null || result === undefined) {
      return "nil";
    }
    
    const jsonString = JSON.stringify(result, null, 2);
    
    // Convert JSON syntax to Lua syntax
    let luaString = jsonString;
    luaString = luaString.replace(/null/g, 'nil');
    luaString = luaString.replace(/"_(\d+(?:\.\d+)?)"\s*:/g, '[$1] =');
    luaString = luaString.replace(/"(\d+(?:\.\d+)?)"\s*:/g, '[$1] =');
    luaString = luaString.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"\s*:/g, '["$1"] =');
    luaString = luaString.replace(/\[/g, '{').replace(/\]/g, '}');
    
    return luaString;
  }
}

/**
 * Create the MCP server
 */
const server = new Server(
  {
    name: "dcs-lua-runner",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const dcsClient = new DCSClient();
const dcsSettings = loadDCSSettings();

/**
 * Handler that lists available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "execute_lua",
        description: "Execute arbitrary Lua code on DCS server. Returns the result of the executed code. Use this for custom operations not covered by other tools.",
        inputSchema: {
          type: "object",
          properties: {
            code: {
              type: "string",
              description: "Lua code to execute in DCS"
            },
            environment: {
              type: "string",
              enum: ["mission", "gui"],
              description: "DCS environment to execute in (mission for in-game, gui for main menu)",
              default: "mission"
            }
          },
          required: ["code"]
        }
      },
      {
        name: "get_mission_info",
        description: "Get current mission information including time, theatre, mission name, and weather conditions",
        inputSchema: {
          type: "object",
          properties: {},
        }
      },
      {
        name: "get_player_info",
        description: "Get information about the player's aircraft including position, altitude, speed, heading, and fuel",
        inputSchema: {
          type: "object",
          properties: {},
        }
      },
      {
        name: "get_all_units",
        description: "Get a list of all units in the mission with their properties (coalition, type, position, etc.)",
        inputSchema: {
          type: "object",
          properties: {
            coalition: {
              type: "string",
              enum: ["all", "red", "blue", "neutral"],
              description: "Filter by coalition",
              default: "all"
            }
          },
        }
      },
      {
        name: "spawn_unit",
        description: "Spawn a new unit in the mission at specified coordinates. Can use DCS coordinates (x, z) OR real-world coordinates (latitude/longitude or MGRS).",
        inputSchema: {
          type: "object",
          properties: {
            type: {
              type: "string",
              description: "Unit type (e.g., 'M-1 Abrams', 'T-72B', 'F-16C_50')"
            },
            name: {
              type: "string",
              description: "Name for the spawned unit"
            },
            coalition: {
              type: "string",
              enum: ["red", "blue", "neutral"],
              description: "Coalition for the unit. Determines default country if 'country' is not specified."
            },
            country: {
              type: "string",
              enum: [
                "USA", "UK", "FRANCE", "GERMANY", "CANADA", "AUSTRALIA", "TURKEY",
                "SPAIN", "THE_NETHERLANDS", "BELGIUM", "NORWAY", "DENMARK", "ISRAEL",
                "ITALY", "GREECE", "POLAND", "SOUTH_KOREA", "JAPAN", "SAUDI_ARABIA",
                "UNITED_ARAB_EMIRATES", "QATAR", "KUWAIT", "BAHRAIN", "JORDAN",
                "EGYPT", "GEORGIA", "UKRAINE", "CJTF_BLUE",
                "RUSSIA", "CHINA", "IRAN", "NORTH_KOREA", "SYRIA", "BELARUS",
                "SOUTH_OSETIA", "ABKHAZIA", "IRAQ", "YEMEN", "LIBYA", "VENEZUELA",
                "INSURGENTS", "CJTF_RED",
                "UN_PEACEKEEPERS", "SWITZERLAND", "SWEDEN", "FINLAND"
              ],
              description: "Specific country for the unit (overrides coalition default). Use CJTF_BLUE or CJTF_RED for combined joint task forces."
            },
            x: {
              type: "number",
              description: "DCS X coordinate (meters). Use this OR lat/lon/mgrs."
            },
            z: {
              type: "number",
              description: "DCS Z coordinate (meters). Use this OR lat/lon/mgrs."
            },
            latitude: {
              type: "number",
              description: "Latitude in decimal degrees. Use with longitude instead of x/z."
            },
            longitude: {
              type: "number",
              description: "Longitude in decimal degrees. Use with latitude instead of x/z."
            },
            mgrs: {
              type: "string",
              description: "MGRS coordinate string (e.g., '38TMK1234567890'). Use instead of x/z or lat/lon."
            },
            heading: {
              type: "number",
              description: "Heading in degrees (0-360)",
              default: 0
            }
          },
          required: ["type", "name", "coalition"]
        }
      },
      {
        name: "send_message",
        description: "Display a message to all players in the mission",
        inputSchema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "Message text to display"
            },
            duration: {
              type: "number",
              description: "Duration to display message in seconds",
              default: 10
            }
          },
          required: ["text"]
        }
      },
      {
        name: "get_theatre_info",
        description: "Get information about the current theatre/map including terrain type and boundaries",
        inputSchema: {
          type: "object",
          properties: {},
        }
      },
      {
        name: "get_aircraft_list",
        description: "Get a list of all aircraft in the mission with their status",
        inputSchema: {
          type: "object",
          properties: {},
        }
      },
      {
        name: "convert_coordinates",
        description: "Convert real-world Latitude/Longitude coordinates to DCS X/Z coordinates using the theatre's coordinate system",
        inputSchema: {
          type: "object",
          properties: {
            latitude: {
              type: "number",
              description: "Latitude in decimal degrees (e.g. 41.12345)"
            },
            longitude: {
              type: "number",
              description: "Longitude in decimal degrees (e.g. 44.98765)"
            },
            altitude: {
              type: "number",
              description: "Altitude in meters above sea level (optional, default 0)",
              default: 0
            }
          },
          required: ["latitude", "longitude"]
        }
      },
      {
        name: "convert_dcs_to_ll",
        description: "Convert DCS X/Z coordinates to real-world Latitude/Longitude",
        inputSchema: {
          type: "object",
          properties: {
            x: {
              type: "number",
              description: "DCS X coordinate (meters)"
            },
            z: {
              type: "number",
              description: "DCS Z coordinate (meters)"
            },
            y: {
              type: "number",
              description: "DCS Y coordinate / altitude in meters (optional, default 0)",
              default: 0
            }
          },
          required: ["x", "z"]
        }
      }
    ]
  };
});

/**
 * Handler for tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  // Update settings based on tool parameters if environment is specified
  const executionSettings = { ...dcsSettings };
  if (args && 'environment' in args) {
    executionSettings.run_in_mission_env = args.environment !== 'gui';
  }
  
  try {
    switch (name) {
      case "execute_lua": {
        const code = String(args?.code || '');
        if (!code) {
          throw new McpError(ErrorCode.InvalidParams, "Code is required");
        }
        
        const result = await dcsClient.runLua(code, executionSettings);
        
        return {
          content: [{
            type: "text",
            text: result.success 
              ? JSON.stringify(result.result, null, 2)
              : `Error: ${result.result}`
          }],
          isError: !result.success
        };
      }
      
      case "get_mission_info": {
        const code = `
local info = {
  mission_time = timer.getTime(),
  mission_name = env.mission.theatre,
  theatre = env.mission.theatre,
  date = env.mission.date or {}
}
return info
`;
        const result = await dcsClient.runLua(code, executionSettings);
        
        return {
          content: [{
            type: "text",
            text: result.success
              ? JSON.stringify(result.result, null, 2)
              : `Error: ${result.result}`
          }],
          isError: !result.success
        };
      }
      
      case "get_player_info": {
        const code = `
-- world.getPlayer() only works in SP; iterate all units to find any human pilot
local found = nil
for _, coa in ipairs({coalition.side.RED, coalition.side.BLUE, coalition.side.NEUTRAL}) do
  local groups = coalition.getGroups(coa)
  for _, grp in ipairs(groups) do
    for _, u in ipairs(grp:getUnits()) do
      if u:getPlayerName() and not found then
        local pos = u:getPosition().p
        local vel = u:getVelocity()
        local speed = math.sqrt(vel.x^2 + vel.y^2 + vel.z^2)
        local lat, lon, alt = coord.LOtoLL(pos)
        found = {
          name = u:getName(),
          player = u:getPlayerName(),
          type = u:getTypeName(),
          position = { x = pos.x, y = pos.y, z = pos.z },
          latitude = lat,
          longitude = lon,
          altitude = pos.y,
          speed = speed,
          heading = math.deg(math.atan2(vel.z, vel.x))
        }
      end
    end
  end
end
return found or { error = "No player found" }
`;
        const result = await dcsClient.runLua(code, executionSettings);
        
        return {
          content: [{
            type: "text",
            text: result.success
              ? JSON.stringify(result.result, null, 2)
              : `Error: ${result.result}`
          }],
          isError: !result.success
        };
      }
      
      case "get_all_units": {
        const coalition = String(args?.coalition || 'all');
        const code = `
local units = {}
local coalitions = ${coalition === 'all' ? '{coalition.side.RED, coalition.side.BLUE, coalition.side.NEUTRAL}' : 
                     coalition === 'red' ? '{coalition.side.RED}' :
                     coalition === 'blue' ? '{coalition.side.BLUE}' :
                     '{coalition.side.NEUTRAL}'}

for _, coal in ipairs(coalitions) do
  local groups = coalition.getGroups(coal)
  for _, group in ipairs(groups) do
    local groupUnits = group:getUnits()
    for _, unit in ipairs(groupUnits) do
      local pos = unit:getPosition().p
      table.insert(units, {
        name = unit:getName(),
        type = unit:getTypeName(),
        coalition = coal,
        position = { x = pos.x, y = pos.y, z = pos.z }
      })
    end
  end
end

return units
`;
        const result = await dcsClient.runLua(code, executionSettings);
        
        return {
          content: [{
            type: "text",
            text: result.success
              ? JSON.stringify(result.result, null, 2)
              : `Error: ${result.result}`
          }],
          isError: !result.success
        };
      }
      
      case "spawn_unit": {
        const unitType = String(args?.type || '');
        const unitName = String(args?.name || '');
        const coal = String(args?.coalition || 'blue');
        const heading = Number(args?.heading || 0);
        
        if (!unitType || !unitName) {
          throw new McpError(ErrorCode.InvalidParams, "Unit type and name are required");
        }

        // Handle coordinate conversion if needed
        let x: number, z: number;
        
        if (args?.mgrs) {
          // Convert MGRS to DCS coordinates
          const mgrsStr = String(args.mgrs).replace(/\]/g, '').replace(/\[/g, ''); // sanitize for Lua long string
          const conversionCode = `
local mgrsStr = [[${mgrsStr}]]
local mgrsClean = mgrsStr:gsub("%s+", "")

-- Extract MGRS components
local zone, band, digraph, coords = mgrsClean:match("^(%d+)([A-Z])([A-Z][A-Z])(.*)$")
if not zone or not band or not digraph then
  return { error = "Invalid MGRS format: " .. mgrsStr }
end

local coordLen = #coords
local halfLen = math.floor(coordLen / 2)
local easting = tonumber(coords:sub(1, halfLen))
local northing = tonumber(coords:sub(halfLen + 1))

if not easting or not northing then
  return { error = "Invalid MGRS coordinates: " .. mgrsStr }
end

local eastingStr = string.format("%05d", easting * (10 ^ (5 - halfLen)))
local northingStr = string.format("%05d", northing * (10 ^ (5 - halfLen)))

local mgrsTable = {
  UTMZone = zone .. band,
  MGRSDigraph = digraph,
  Easting = tonumber(eastingStr),
  Northing = tonumber(northingStr)
}

local lat, lon = coord.MGRStoLL(mgrsTable)
if not lat or not lon then
  return { error = "MGRS conversion failed for: " .. mgrsStr }
end

local alt = 0
local vec3 = coord.LLtoLO(lat, lon, alt)
return {x = vec3.x, z = vec3.z, lat = lat, lon = lon}
`;
          const result = await dcsClient.runLua(conversionCode, executionSettings);
          if (!result.success || result.result.error) {
            throw new McpError(ErrorCode.InternalError, `MGRS conversion failed: ${result.result.error || result.result}`);
          }
          x = result.result.x;
          z = result.result.z;
        } else if (args?.latitude !== undefined && args?.longitude !== undefined) {
          // Convert Lat/Long to DCS coordinates
          const lat = Number(args.latitude);
          const lon = Number(args.longitude);
          const conversionCode = `
local lat = ${lat}
local lon = ${lon}
local alt = 0
local vec3 = coord.LLtoLO(lat, lon, alt)
return {x = vec3.x, z = vec3.z}
`;
          const result = await dcsClient.runLua(conversionCode, executionSettings);
          if (!result.success) {
            throw new McpError(ErrorCode.InternalError, `Lat/Long conversion failed: ${result.result}`);
          }
          x = result.result.x;
          z = result.result.z;
        } else if (args?.x !== undefined && args?.z !== undefined) {
          // Use DCS coordinates directly
          x = Number(args.x);
          z = Number(args.z);
        } else {
          throw new McpError(ErrorCode.InvalidParams, "Must provide either x/z, latitude/longitude, or mgrs coordinates");
        }
        
        // Resolve country enum: explicit country param overrides coalition default
        const countryName = args?.country
          ? String(args.country).toUpperCase()
          : coal === 'red' ? 'RUSSIA' : coal === 'blue' ? 'USA' : 'INSURGENTS';
        const countryEnum = `country.id.${countryName}`;
        
        const code = `
local groupData = {
  ["visible"] = false,
  ["hidden"] = false,
  ["units"] = {
    [1] = {
      ["type"] = "${unitType}",
      ["name"] = "${unitName}",
      ["x"] = ${x},
      ["y"] = ${z},
      ["heading"] = ${heading * Math.PI / 180},
    },
  },
  ["name"] = "${unitName}_group",
  ["task"] = "Ground Nothing",
}

coalition.addGroup(${countryEnum}, Group.Category.GROUND, groupData)

return { success = true, message = "Unit ${unitName} spawned successfully" }
`;
        const result = await dcsClient.runLua(code, executionSettings);
        
        return {
          content: [{
            type: "text",
            text: result.success
              ? JSON.stringify(result.result, null, 2)
              : `Error: ${result.result}`
          }],
          isError: !result.success
        };
      }
      
      case "send_message": {
        const text = String(args?.text || '');
        const duration = Number(args?.duration || 10);
        
        if (!text) {
          throw new McpError(ErrorCode.InvalidParams, "Message text is required");
        }
        
        const code = `
trigger.action.outText("${text.replace(/"/g, '\\"')}", ${duration})
return { success = true, message = "Message sent" }
`;
        const result = await dcsClient.runLua(code, executionSettings);
        
        return {
          content: [{
            type: "text",
            text: result.success
              ? JSON.stringify(result.result, null, 2)
              : `Error: ${result.result}`
          }],
          isError: !result.success
        };
      }
      
      case "get_theatre_info": {
        const code = `
return {
  theatre = env.mission.theatre,
  name = env.mission.theatre
}
`;
        const result = await dcsClient.runLua(code, executionSettings);
        
        return {
          content: [{
            type: "text",
            text: result.success
              ? JSON.stringify(result.result, null, 2)
              : `Error: ${result.result}`
          }],
          isError: !result.success
        };
      }
      
      case "get_aircraft_list": {
        const code = `
local aircraft = {}
for _, coal in ipairs({coalition.side.RED, coalition.side.BLUE, coalition.side.NEUTRAL}) do
  local groups = coalition.getGroups(coal, Group.Category.AIRPLANE)
  for _, group in ipairs(groups) do
    local units = group:getUnits()
    for _, unit in ipairs(units) do
      local pos = unit:getPosition().p
      table.insert(aircraft, {
        name = unit:getName(),
        type = unit:getTypeName(),
        coalition = coal,
        position = { x = pos.x, y = pos.y, z = pos.z },
        altitude = pos.y
      })
    end
  end
end
return aircraft
`;
        const result = await dcsClient.runLua(code, executionSettings);

        return {
          content: [{
            type: "text",
            text: result.success
              ? JSON.stringify(result.result, null, 2)
              : `Error: ${result.result}`
          }],
          isError: !result.success
        };
      }
      
      case "convert_coordinates": {
        const lat = Number(args?.latitude || 0);
        const lon = Number(args?.longitude || 0);
        const alt = Number(args?.altitude || 0);
        const code = `
local pos = coord.LLtoLO(${lat}, ${lon}, ${alt})
return {
  x = pos.x,
  y = pos.y,
  z = pos.z,
  input = { latitude = ${lat}, longitude = ${lon}, altitude = ${alt} }
}
`;
        const result = await dcsClient.runLua(code, executionSettings);
        return {
          content: [{
            type: "text",
            text: result.success
              ? JSON.stringify(result.result, null, 2)
              : `Error: ${result.result}`
          }],
          isError: !result.success
        };
      }

      case "convert_dcs_to_ll": {
        const x = Number(args?.x || 0);
        const z = Number(args?.z || 0);
        const y = Number(args?.y || 0);
        const code = `
local lat, lon, alt = coord.LOtoLL({x = ${x}, y = ${y}, z = ${z}})
return {
  latitude = lat,
  longitude = lon,
  altitude = alt,
  input = { x = ${x}, y = ${y}, z = ${z} }
}
`;
        const result = await dcsClient.runLua(code, executionSettings);
        return {
          content: [{
            type: "text",
            text: result.success
              ? JSON.stringify(result.result, null, 2)
              : `Error: ${result.result}`
          }],
          isError: !result.success
        };
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error: any) {
    if (error instanceof McpError) {
      throw error;
    }
    return {
      content: [{
        type: "text",
        text: `Error executing tool: ${error.message}`
      }],
      isError: true
    };
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("DCS Lua Runner MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
