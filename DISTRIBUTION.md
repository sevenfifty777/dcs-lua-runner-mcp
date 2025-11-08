# Distribution Guide

## Files Required for Running the MCP Server

When distributing the MCP server to end users, you need to include the following files and folders:

### Required Files/Folders:

```
dcs-lua-runner-mcp/
├── build/
│   └── index.js                           # Compiled server (REQUIRED)
├── node_modules/                          # Runtime dependencies (REQUIRED)
│   ├── @modelcontextprotocol/
│   └── axios/
├── package.json                           # Dependency information (REQUIRED)
├── package-lock.json                      # Locked dependencies (REQUIRED)
├── dcs_lua_runner_settings.json.template  # Settings template (RECOMMENDED)
├── dcs-fiddle-server.lua                  # DCS hook script (REQUIRED for DCS)
├── README.md                              # Documentation (RECOMMENDED)
└── INSTALLATION_GUIDE.md                  # Install guide (RECOMMENDED)
```

### NOT Required for Distribution:

These files are only needed for development/building:

```
src/                    # TypeScript source files (NOT NEEDED)
tsconfig.json          # TypeScript config (NOT NEEDED)
.gitignore             # Git config (NOT NEEDED)
.gitattributes         # Git config (NOT NEEDED)
```

## Why node_modules is Required

The built `build/index.js` file uses ES module imports:
- `@modelcontextprotocol/sdk` - For MCP server functionality
- `axios` - For HTTP requests to DCS

These dependencies must be present in `node_modules/` at runtime.

## Distribution Methods

### Method 1: Full Package (Recommended)

Distribute the entire project folder including `node_modules`. This is the simplest approach.

**Steps:**
1. Build the project: `npm run build`
2. Zip the entire folder
3. User extracts and runs directly

**Pros:**
- Simple, no installation needed
- Works immediately

**Cons:**
- Larger file size (~several MB)

### Method 2: Without node_modules

Distribute without `node_modules`, requiring users to run `npm install`.

**Required files:**
```
build/index.js
package.json
package-lock.json
dcs_lua_runner_settings.json.template
dcs-fiddle-server.lua
README.md
INSTALLATION_GUIDE.md
```

**User must run:**
```bash
npm install
```

**Pros:**
- Smaller download size
- Users get fresh dependencies

**Cons:**
- Requires Node.js and npm on user's system
- Extra installation step

## Recommended Distribution Structure

Create a release package with:

```
dcs-lua-runner-mcp-v0.1.0/
├── build/
│   └── index.js
├── node_modules/        (include all dependencies)
├── package.json
├── package-lock.json
├── dcs_lua_runner_settings.json.template
├── dcs-fiddle-server.lua
├── README.md
└── INSTALLATION_GUIDE.md
```

## Minimal Runtime Structure

If you want the absolute minimum to run the server:

```
my-dcs-server/
├── build/
│   └── index.js
├── node_modules/
│   ├── @modelcontextprotocol/
│   └── axios/
├── package.json
└── dcs_lua_runner_settings.json
```

This will work, but lacks documentation and templates.

## Creating a Distribution Package

### Option A: Using npm pack

```bash
npm run build
npm pack
```

This creates a `.tgz` file containing the necessary files.

### Option B: Manual ZIP

```bash
# Build first
npm run build

# Create distribution folder
mkdir dcs-lua-runner-mcp-distribution
cp -r build node_modules package*.json *.md *.lua *.template dcs-lua-runner-mcp-distribution/

# Zip it
zip -r dcs-lua-runner-mcp-v0.1.0.zip dcs-lua-runner-mcp-distribution/
```

## Testing the Distribution

Before distributing, test in a clean directory:

1. Copy distribution files to a new folder
2. Configure settings
3. Try running: `node build/index.js`
4. Verify it connects to DCS

## Size Considerations

Typical package sizes:
- **With node_modules**: ~5-10 MB
- **Without node_modules**: ~50 KB

For most users, including `node_modules` is recommended for easier setup.
