#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Registers dcs-lua-runner-mcp with one or more AI agent MCP clients.

.DESCRIPTION
    Step 1 — Interactively configures dcs_lua_runner_settings.json (server IP,
             port, credentials, execution mode).
    Step 2 — Adds (or updates) the dcs-lua-runner-mcp server entry in the
    configuration files of the following agents:
        1. Claude Desktop
        2. Cline  (VS Code extension)
        3. GitHub Copilot Chat  (VS Code — user mcp.json)
        4. Cursor
        5. Windsurf
        6. Claude Code CLI  (via `claude mcp add` command)

    The script auto-detects build\index.js relative to its own location.
    Existing config files are preserved; only the dcs-lua-runner-mcp entry
    is added or updated.

.PARAMETER ServerPath
    Full path to build\index.js. Auto-detected when the script lives next to
    the build\ folder.

.EXAMPLE
    # Interactive — run from the extracted release folder
    .\install-mcp-agent.ps1

.EXAMPLE
    # Non-interactive — configure specific agents by id
    .\install-mcp-agent.ps1 -AgentIds 1,3

.EXAMPLE
    # Configure all agents at once
    .\install-mcp-agent.ps1 -All
#>

[CmdletBinding()]
param(
    [string]   $ServerPath = "",
    [int[]]    $AgentIds   = @(),
    [switch]   $All
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$SERVER_NAME = "dcs-lua-runner-mcp"
$SCRIPT_DIR  = Split-Path -Parent $MyInvocation.MyCommand.Path

# ── Banner ─────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   DCS Lua Runner MCP — Agent Installer        ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── Resolve build\index.js ─────────────────────────────────────────────────────
if (-not $ServerPath) {
    $candidate = Join-Path $SCRIPT_DIR "build\index.js"
    if (Test-Path $candidate) {
        $ServerPath = $candidate
        Write-Host "Auto-detected server: $ServerPath" -ForegroundColor Green
    }
}

while (-not $ServerPath -or -not (Test-Path $ServerPath)) {
    if ($ServerPath) {
        Write-Host "File not found: $ServerPath" -ForegroundColor Red
    }
    $ServerPath = Read-Host "Enter the full path to build\index.js"
}

$ServerPath    = (Resolve-Path $ServerPath).Path
$ServerPathFwd = $ServerPath.Replace('\', '/')
Write-Host ""

# ── Configure dcs_lua_runner_settings.json ─────────────────────────────────────
function Configure-Settings {
    param([string] $ScriptDir)

    $settingsPath  = Join-Path $ScriptDir "dcs_lua_runner_settings.json"
    $templatePath  = Join-Path $ScriptDir "dcs_lua_runner_settings.json.template"

    Write-Host "╔═══════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║   Step 1 — DCS Server Settings                ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""

    # Load existing settings or fall back to template
    $source = if (Test-Path $settingsPath) { $settingsPath } elseif (Test-Path $templatePath) { $templatePath } else { $null }

    $cfg = if ($source) {
        Write-Host "  Loading: $source" -ForegroundColor DarkGray
        (Get-Content $source -Raw -Encoding UTF8) | ConvertFrom-Json -AsHashtable
    } else {
        Write-Host "  No settings file found — starting from defaults." -ForegroundColor DarkYellow
        [ordered]@{
            server_address     = "127.0.0.1"
            server_address_gui = "127.0.0.1"
            server_port        = 12080
            server_port_gui    = 12081
            use_https          = $false
            web_auth_username  = ""
            web_auth_password  = ""
            run_code_locally   = $true
            run_in_mission_env = $true
            return_display_format = "lua"
        }
    }

    Write-Host ""

    # Helper: prompt with current value shown, keep current on empty input
    function Prompt-Value {
        param([string]$Label, [string]$Current, [string]$Key, [hashtable]$Cfg)
        $input = (Read-Host "  $Label [$Current]").Trim()
        if ($input -ne "") { $Cfg[$Key] = $input }
    }

    # ── Connection ─────────────────────────────────────────────────────────────
    Write-Host "  — Connection (" -NoNewline; Write-Host "leave blank to keep current value" -NoNewline -ForegroundColor DarkGray; Write-Host ")" 
    Write-Host ""

    # run_code_locally: determines if server_address is needed
    $localCurrent = if ($cfg["run_code_locally"] -is [bool]) { $cfg["run_code_locally"] } else { [bool]::Parse($cfg["run_code_locally"]) }
    $localChoice  = (Read-Host "  Run code locally? (DCS on same machine) [$(if($localCurrent){'yes'}else{'no'})] (yes/no)").Trim().ToLower()
    if ($localChoice -eq "yes" -or $localChoice -eq "y") {
        $cfg["run_code_locally"] = $true
        $cfg["server_address"]     = "127.0.0.1"
        $cfg["server_address_gui"] = "127.0.0.1"
        Write-Host "  server_address set to 127.0.0.1 automatically." -ForegroundColor DarkGray
    } elseif ($localChoice -eq "no" -or $localChoice -eq "n") {
        $cfg["run_code_locally"] = $false
        Prompt-Value "DCS server IP / hostname" $cfg["server_address"] "server_address" $cfg
        $cfg["server_address_gui"] = $cfg["server_address"]
    }
    # else: keep existing value

    Write-Host ""
    Prompt-Value "DCS Fiddle port         (default 12080)" ([string]$cfg["server_port"]) "server_port" $cfg
    if ($cfg["server_port"] -match '^\d+$') { $cfg["server_port"] = [int]$cfg["server_port"] }

    # ── Authentication ─────────────────────────────────────────────────────────
    Write-Host ""
    Write-Host "  — Authentication"
    Write-Host ""
    Prompt-Value "Username" $cfg["web_auth_username"] "web_auth_username" $cfg

    $pwdInput = (Read-Host "  Password [$(if($cfg["web_auth_password"]){'***set***'}else{'not set'})]").Trim()
    if ($pwdInput -ne "") { $cfg["web_auth_password"] = $pwdInput }

    # ── Execution mode ─────────────────────────────────────────────────────────
    Write-Host ""
    Write-Host "  — Execution"
    Write-Host ""
    $missionCurrent = if ($cfg["run_in_mission_env"] -is [bool]) { $cfg["run_in_mission_env"] } else { [bool]::Parse($cfg["run_in_mission_env"]) }
    $missionChoice  = (Read-Host "  Run Lua in mission environment? [$(if($missionCurrent){'yes'}else{'no'})] (yes/no)").Trim().ToLower()
    if ($missionChoice -eq "yes" -or $missionChoice -eq "y") { $cfg["run_in_mission_env"] = $true }
    elseif ($missionChoice -eq "no"  -or $missionChoice -eq "n") { $cfg["run_in_mission_env"] = $false }

    # ── Write file ─────────────────────────────────────────────────────────────
    Write-Host ""
    $cfg | ConvertTo-Json -Depth 5 | Set-Content $settingsPath -Encoding UTF8
    Write-Host "  ✓ Saved: $settingsPath" -ForegroundColor Green
    Write-Host ""
}

Configure-Settings -ScriptDir $SCRIPT_DIR

# ── Agent definitions ──────────────────────────────────────────────────────────
# Each entry: Id, DisplayName, ConfigPath (null = CLI-based), JsonKey
$agents = @(
    [PSCustomObject]@{
        Id     = 1
        Name   = "Claude Desktop"
        Config = "$env:APPDATA\Claude\claude_desktop_config.json"
        Key    = "mcpServers"
    }
    [PSCustomObject]@{
        Id     = 2
        Name   = "Cline (VS Code extension)"
        Config = "$env:APPDATA\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json"
        Key    = "mcpServers"
    }
    [PSCustomObject]@{
        Id     = 3
        Name   = "GitHub Copilot Chat (VS Code)"
        Config = "$env:APPDATA\Code\User\mcp.json"
        Key    = "servers"          # VS Code uses "servers", not "mcpServers"
    }
    [PSCustomObject]@{
        Id     = 4
        Name   = "Cursor"
        Config = "$env:USERPROFILE\.cursor\mcp.json"
        Key    = "mcpServers"
    }
    [PSCustomObject]@{
        Id     = 5
        Name   = "Windsurf"
        Config = "$env:USERPROFILE\.codeium\windsurf\mcp_config.json"
        Key    = "mcpServers"
    }
    [PSCustomObject]@{
        Id     = 6
        Name   = "Claude Code CLI  (requires `claude` CLI to be installed)"
        Config = $null              # handled via `claude mcp add`
        Key    = "claude-code"
    }
    [PSCustomObject]@{
        Id     = 7
        Name   = "GitHub Copilot CLI"
        Config = "$env:USERPROFILE\.copilot\mcp-config.json"
        Key    = "mcpServers"
    }
)

# ── Select agents ──────────────────────────────────────────────────────────────
$selected = @()

if ($All) {
    $selected = $agents
} elseif ($AgentIds.Count -gt 0) {
    $selected = $agents | Where-Object { $_.Id -in $AgentIds }
} else {
    # Interactive menu
    Write-Host "Which agents do you want to configure?" -ForegroundColor Yellow
    Write-Host "(Enter one or more numbers separated by commas or spaces, or type 'all')" -ForegroundColor DarkGray
    Write-Host "  Example: 1,3,7  or  1 3 7" -ForegroundColor DarkGray
    Write-Host ""

    foreach ($a in $agents) {
        $tag = if ($a.Config -and (Test-Path $a.Config)) {
            "  [config exists]"
        } elseif ($a.Config) {
            "  [new file]"
        } else {
            "  [CLI-based]"
        }
        Write-Host ("  {0}. {1}{2}" -f $a.Id, $a.Name, $tag)
    }

    Write-Host ""
    $raw = (Read-Host "Choice").Trim()

    if ($raw -ieq "all") {
        $selected = $agents
    } else {
        $ids      = $raw -split "[,\s]+" | Where-Object { $_ -match '^\d+$' } | ForEach-Object { [int]$_ }
        $selected = $agents | Where-Object { $_.Id -in $ids }
    }
}

if ($selected.Count -eq 0) {
    Write-Host "No valid selection. Exiting." -ForegroundColor Red
    exit 0
}

Write-Host ""

# ── Helper: update a JSON-based config file ────────────────────────────────────
function Update-McpConfig {
    param(
        [string] $ConfigPath,
        [string] $TopKey,
        [string] $Name,
        [string] $NodePath,
        [switch] $AddType
    )

    # Ensure parent directory exists
    $dir = Split-Path $ConfigPath
    if ($dir -and -not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    # Load existing or start empty
    $rawJson = if (Test-Path $ConfigPath) {
        (Get-Content $ConfigPath -Raw -Encoding UTF8).Trim()
    } else {
        "{}"
    }

    # Parse — note: ConvertFrom-Json -AsHashtable requires PowerShell 6+
    $config = $rawJson | ConvertFrom-Json -AsHashtable

    # Ensure the top-level key exists
    if (-not $config.ContainsKey($TopKey)) {
        $config[$TopKey] = [System.Collections.Hashtable]::new()  # ordered not needed here
    }

    # Build the server entry
    $entry = [ordered]@{
        command = "node"
        args    = @($NodePath)
    }

    # Some clients (VS Code Copilot Chat, Copilot CLI) require "type": "stdio"
    if ($TopKey -eq "servers" -or $AddType) {
        $entry["type"] = "stdio"
    }

    $config[$TopKey][$Name] = $entry

    # Write back with consistent formatting
    $config | ConvertTo-Json -Depth 10 | Set-Content $ConfigPath -Encoding UTF8
}

# ── Process each selected agent ────────────────────────────────────────────────
$results = @()

foreach ($agent in $selected) {
    $label = $agent.Name
    Write-Host "► $label" -ForegroundColor Yellow

    # ── Claude Code CLI: use `claude mcp add` ──────────────────────────────────
    if ($agent.Key -eq "claude-code") {
        $claudeExe = Get-Command "claude" -ErrorAction SilentlyContinue
        if ($claudeExe) {
            try {
                # Remove existing entry silently first to avoid duplicate error
                & claude mcp remove $SERVER_NAME --scope user 2>$null | Out-Null
                & claude mcp add $SERVER_NAME --scope user -- node $ServerPath
                Write-Host "  ✓ Registered via 'claude mcp add'" -ForegroundColor Green
                $results += [PSCustomObject]@{ Name = $label; Status = "OK" }
            } catch {
                Write-Host "  ✗ CLI command failed: $_" -ForegroundColor Red
                $results += [PSCustomObject]@{ Name = $label; Status = "FAILED" }
            }
        } else {
            Write-Host "  ! 'claude' CLI not found in PATH." -ForegroundColor DarkYellow
            Write-Host "    Install it from https://github.com/anthropics/anthropic-tools" -ForegroundColor DarkGray
            Write-Host "    Then run manually:" -ForegroundColor DarkGray
            Write-Host "      claude mcp add $SERVER_NAME --scope user -- node `"$ServerPath`"" -ForegroundColor Gray
            $results += [PSCustomObject]@{ Name = $label; Status = "SKIPPED (claude not found)" }
        }
        Write-Host ""
        continue
    }

    # ── File-based config ──────────────────────────────────────────────────────
    try {
        $addType = ($agent.Id -eq 7)   # Copilot CLI needs "type": "stdio"
        Update-McpConfig `
            -ConfigPath $agent.Config `
            -TopKey     $agent.Key `
            -Name       $SERVER_NAME `
            -NodePath   $ServerPathFwd `
            -AddType:$addType

        Write-Host "  ✓ $($agent.Config)" -ForegroundColor Green
        $results += [PSCustomObject]@{ Name = $label; Status = "OK" }
    } catch {
        Write-Host "  ✗ Failed: $_" -ForegroundColor Red
        $results += [PSCustomObject]@{ Name = $label; Status = "FAILED: $_" }
    }

    Write-Host ""
}

# ── Summary ────────────────────────────────────────────────────────────────────
Write-Host "╔═══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Summary                                     ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════╝" -ForegroundColor Cyan
foreach ($r in $results) {
    $color = if ($r.Status -eq "OK") { "Green" } elseif ($r.Status -like "SKIPPED*") { "DarkYellow" } else { "Red" }
    Write-Host ("  [{0,-8}] {1}" -f $r.Status, $r.Name) -ForegroundColor $color
}

Write-Host ""
Write-Host "Restart your agent(s) / reload VS Code to apply changes." -ForegroundColor Cyan
Write-Host ""
