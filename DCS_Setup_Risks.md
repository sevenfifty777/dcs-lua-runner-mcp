## DCS Setup

### ⚠️ **CRITICAL SECURITY NOTICE** ⚠️

**The following steps will DISABLE DCS security protections. This creates serious security vulnerabilities:**

- **🔥 REMOVES SANDBOXING** - Scripts gain full system access
- **💾 FILE SYSTEM ACCESS** - Can read/write/delete any files on your computer  
- **🌐 NETWORK ACCESS** - Can make network connections to any server
- **⚙️ SYSTEM COMMANDS** - Can execute system commands and programs
- **🔓 PERSISTENT CHANGES** - Security remains disabled until manually restored

**💡 SECURITY BEST PRACTICES:**
- 🔒 **Backup your DCS installation** before proceeding
- 🏠 **Use on isolated/offline systems only** 
- 👀 **Review ALL code before execution** - never run untrusted scripts
- 🔐 **Use strong passwords** for remote access
- 🚪 **Disable when not needed** - re-enable sanitization after use
- 📊 **Monitor system activity** while running scripts

### Installation Steps

> For the full step-by-step installation guide (Hooks folder, copy commands, verification), see the [README — DCS Setup Requirements](README.md#dcs-setup-requirements) section.

**⚠️ De-sanitize Mission Scripting** — edit `DCS_INSTALL\Scripts\MissionScripting.lua` and comment out these two lines:
```lua
--  _G['require'] = nil      -- ⚠️ SECURITY: enables require() function
    _G['loadlib'] = nil
--  _G['package'] = nil      -- ⚠️ SECURITY: enables package loading
```

**🔄 TO RESTORE SECURITY:** Uncomment these lines (remove `--`) when finished:
```lua
_G['require'] = nil     -- Restore to disable require()
_G['package'] = nil     -- Restore to disable package loading
```

### Remote Access Configuration

### 🚨 **EXTREME SECURITY RISK** 🚨

**Enabling remote access creates MAXIMUM SECURITY EXPOSURE:**

- **🌍 INTERNET ACCESSIBLE** - Your PC becomes accessible from anywhere on the network/internet
- **💻 REMOTE CODE EXECUTION** - Anyone with credentials can run ANY Lua code on your system
- **🔓 UNSECURED BY DEFAULT** - Basic authentication is easily bypassed or bruted
- **📊 DATA EXFILTRATION** - All DCS data, logs, and accessible files can be stolen
- **🎯 ATTACK VECTOR** - Creates entry point for malicious actors

**🛡️ MANDATORY SECURITY MEASURES:**

1. **🔥 FIREWALL RULES** - Block port 12080 from internet, allow only specific IPs
2. **🔐 STRONG CREDENTIALS** - Use complex passwords (20+ characters, mixed case, numbers, symbols)  
3. **🏠 LOCAL NETWORK ONLY** - Never expose to internet (`BIND_IP = '127.0.0.1'` for local only)
4. **📱 VPN ACCESS** - Use VPN for remote access instead of direct exposure
5. **⏰ TIME LIMITS** - Disable when not actively needed
6. **👀 MONITORING** - Watch logs for unauthorized access attempts

**⚠️ CONFIGURATION OPTIONS:**

```lua
-- SAFER: Local access only (recommended)
FIDDLE.BIND_IP = '127.0.0.1'  -- Local computer only
FIDDLE.PORT = 12080           

-- DANGEROUS: Network/Internet access (high risk)
FIDDLE.BIND_IP = '0.0.0.0'    -- ⚠️ EXPOSES TO NETWORK/INTERNET
FIDDLE.PORT = 12080           

-- MANDATORY: Strong authentication
FIDDLE.AUTH = true                    -- ⚠️ NEVER set to false
FIDDLE.USERNAME = 'ComplexUsername123'    -- Use unique, complex username  
FIDDLE.PASSWORD = 'VeryLongComplexPassword456!'  -- 20+ character password
```

**🔴 NEVER DO THIS:**
```lua
FIDDLE.AUTH = false           -- ⚠️ NEVER disable authentication
FIDDLE.PASSWORD = 'password'  -- ⚠️ NEVER use weak passwords
```