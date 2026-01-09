# Convex - Complete Guide for Claude Code

**Last Updated:** 2025-12-17
**Version:** 1.0
**Purpose:** Comprehensive Convex reference for Claude Code instances, including common mistakes and solutions

---

## 🎯 What is Convex?

Convex is a **serverless backend platform** that provides:
- Real-time database with TypeScript-first queries
- Serverless functions (queries, mutations, actions)
- HTTP endpoints for external APIs
- File storage
- Real-time subscriptions

**Official Docs:** https://docs.convex.dev

---

## 📁 Project Structure

```
project/
├── convex/
│   ├── _generated/      # Auto-generated TypeScript types
│   ├── schema.ts        # Database schema definition
│   ├── http.ts          # HTTP routes (MUST be named exactly "http.ts")
│   ├── *.ts             # Your functions (queries, mutations, actions)
│   └── convex.json      # Optional config
├── .env.local           # Environment variables
└── convex.json          # Root config (optional)
```

---

## 🌐 URL Structure (CRITICAL!)

### ❌ COMMON MISTAKE: Using wrong URL for HTTP endpoints

Convex uses **DIFFERENT URLS** for different features:

| Feature | URL Pattern | Example |
|---------|-------------|---------|
| **Queries/Mutations** | `https://{name}.convex.cloud` | `https://strong-dove-37.convex.cloud` |
| **HTTP Endpoints** | `https://{name}.convex.site` | `https://strong-dove-37.convex.site` |

**Example from this project:**
```typescript
// ❌ WRONG - HTTP endpoints will NOT work with this URL
const CONVEX_URL = "https://strong-dove-37.convex.cloud";

// ✅ CORRECT - Use .convex.site for HTTP endpoints
const CONVEX_URL = "https://strong-dove-37.convex.site";
```

**Key Learnings (2025-12-17):**
- Spent hours debugging HTTP 404 errors
- curl returned 404 when using `.convex.cloud`
- Changed to `.convex.site` → instant success!
- This is NOT documented clearly in Convex docs

---

## 🗄️ Database: Queries, Mutations, Actions

### Queries (Read-only)

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("tableName").collect();
  },
});

export const getById = query({
  args: { id: v.id("tableName") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

**Use from frontend:**
```typescript
const data = useQuery(api.moduleName.list);
```

### Mutations (Write data)

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    status: v.union(v.literal("pending"), v.literal("done")),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("tableName", {
      name: args.name,
      status: args.status,
      createdAt: Date.now(),
    });
    return { id };
  },
});

export const update = mutation({
  args: {
    id: v.id("tableName"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});
```

**Use from frontend:**
```typescript
const createItem = useMutation(api.moduleName.create);
await createItem({ name: "Test", status: "pending" });
```

### Actions (External APIs, non-deterministic)

```typescript
import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const sendEmail = action({
  args: { to: v.string(), message: v.string() },
  handler: async (ctx, args) => {
    // Can call external APIs
    await fetch("https://api.sendgrid.com/...", { /* ... */ });

    // Can run mutations
    await ctx.runMutation(api.moduleName.update, { /* ... */ });
  },
});
```

---

## 🌍 HTTP Actions (External API Endpoints)

### Setup (CRITICAL REQUIREMENTS)

1. **File MUST be named `convex/http.ts`** (exact name required!)
2. **Export default httpRouter instance**
3. **Use `.convex.site` URL** (NOT `.convex.cloud`)

### Example: convex/http.ts

```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// CORS headers (if calling from browser)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // TODO: Restrict in production
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Example: POST endpoint
http.route({
  path: "/api/items",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Handle preflight OPTIONS request
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      const body = await request.json();

      // Call mutations
      const result = await ctx.runMutation(api.items.create, body);

      return new Response(
        JSON.stringify({ success: true, data: result }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error: any) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// Example: GET endpoint with path parameter
http.route({
  path: "/api/items/:id",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    // Extract path parameter manually
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    const item = await ctx.runQuery(api.items.getById, { id });

    return new Response(JSON.stringify(item), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }),
});

// MUST export as default!
export default http;
```

### Calling HTTP Endpoints

```javascript
// ✅ CORRECT URL
const CONVEX_URL = "https://your-deployment.convex.site";

// POST request
const response = await fetch(CONVEX_URL + "/api/items", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Test" }),
});

// GET request
const response = await fetch(CONVEX_URL + "/api/items/123");
```

---

## 📤 File Storage

### Upload File

```typescript
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

http.route({
  path: "/upload",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Store file in Convex storage
    const blob = await file.arrayBuffer();
    const storageId = await ctx.storage.store(
      new Blob([blob], { type: file.type })
    );

    // Save metadata
    await ctx.runMutation(api.files.save, {
      storageId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });

    return new Response(
      JSON.stringify({ success: true, storageId }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }),
});
```

### Serve File

```typescript
http.route({
  path: "/files/:storageId",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const storageId = pathParts[pathParts.length - 1];

    const blob = await ctx.storage.get(storageId);

    if (!blob) {
      return new Response("File not found", { status: 404 });
    }

    return new Response(blob, {
      status: 200,
      headers: {
        "Content-Type": blob.type || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }),
});
```

---

## 🔐 CORS Configuration

### Problem: CORS Errors from Browser

**Symptoms:**
- `Access-Control-Allow-Origin` errors in browser console
- Fetch fails even though endpoint exists

**Solution: Add CORS headers to ALL responses**

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Or specific domain
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle preflight OPTIONS request
if (request.method === "OPTIONS") {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// Include CORS headers in ALL responses
return new Response(JSON.stringify(data), {
  status: 200,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});
```

**Production Security:**
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "https://yourdomain.com",
  // ... rest
};
```

---

## 🗃️ Schema Definition

### convex/schema.ts

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    title: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
    priority: v.optional(v.number()),
    tags: v.array(v.string()),
    metadata: v.object({
      createdBy: v.string(),
      updatedAt: v.number(),
    }),
    // Special field for file references
    fileId: v.optional(v.id("_storage")),
  })
    .index("by_status", ["status"])
    .index("by_created", ["metadata.createdBy", "status"]),
});
```

**Key Points:**
- Use `v.union()` for enums
- Use `v.optional()` for nullable fields
- Use `v.id("tableName")` for foreign keys
- Use `v.id("_storage")` for file references
- Add indexes for frequently queried fields

---

## 🐛 Common Mistakes & Solutions

### Mistake 1: Wrong URL for HTTP Endpoints

**Problem:**
```typescript
const CONVEX_URL = "https://my-app.convex.cloud"; // ❌
await fetch(CONVEX_URL + "/myEndpoint"); // 404 error
```

**Solution:**
```typescript
const CONVEX_URL = "https://my-app.convex.site"; // ✅
await fetch(CONVEX_URL + "/myEndpoint"); // Works!
```

**How to Debug:**
```bash
# Test with curl
curl -v https://my-app.convex.site/myEndpoint

# If 404 → endpoint doesn't exist or wrong URL
# If 500 → endpoint exists but has error
# If 200 → success!
```

### Mistake 2: Missing CORS Headers

**Problem:**
```typescript
return new Response(JSON.stringify(data), {
  status: 200,
  headers: { "Content-Type": "application/json" }, // ❌ Missing CORS
});
```

**Solution:**
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

return new Response(JSON.stringify(data), {
  status: 200,
  headers: { ...corsHeaders, "Content-Type": "application/json" }, // ✅
});
```

### Mistake 3: Wrong File Name for HTTP Router

**Problem:**
```
convex/api.ts  // ❌ Wrong name
convex/routes.ts  // ❌ Wrong name
```

**Solution:**
```
convex/http.ts  // ✅ MUST be exactly "http.ts"
```

### Mistake 4: Not Handling OPTIONS Preflight

**Problem:**
```typescript
http.route({
  path: "/api/data",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Browser sends OPTIONS first, but we don't handle it → CORS error
    const body = await request.json();
    // ...
  }),
});
```

**Solution:**
```typescript
http.route({
  path: "/api/data",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Handle preflight OPTIONS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const body = await request.json();
    // ...
  }),
});
```

### Mistake 5: Type Coercion Issues

**Problem:**
```typescript
const description = formData.get("description"); // Type: FormDataEntryValue | null
// Later: Type error - string | null not assignable to string | undefined
```

**Solution:**
```typescript
const description = (formData.get("description") as string | null) || undefined;
```

### Mistake 6: Extracting Path Parameters

**Problem:**
```typescript
// request.params does NOT exist in Convex!
const id = request.params.id; // ❌ TypeError
```

**Solution:**
```typescript
const url = new URL(request.url);
const pathParts = url.pathname.split('/');
const id = pathParts[pathParts.length - 1]; // ✅
```

### Mistake 7: HTTP Endpoints Suddenly Stop Working (404)

**Problem:**
HTTP endpoints worked before, but now return 404:
```bash
$ curl https://strong-dove-37.convex.site/uploadScreenshot
< HTTP/1.1 404 Not Found
```

**Possible Causes:**

1. **Convex dev server crashed or restarted**
   - Check terminal where `npx convex dev` is running
   - Look for error messages or "Process exited"

2. **HTTP routes not exported properly**
   - File must be named exactly `convex/http.ts`
   - Must export default: `export default http;`

3. **Code changes not picked up**
   - Convex sometimes doesn't hot-reload HTTP routes
   - Need manual restart

**Solution:**
```bash
# Stop Convex dev (Ctrl+C in terminal)
# Restart:
npx convex dev

# Wait for output showing HTTP routes:
✔ Convex functions ready!
✔ HTTP Actions:
  POST /uploadScreenshot
  POST /updateRequestStatus
  GET /screenshot/:storageId
```

**How to Verify Endpoints Are Loaded:**
```bash
# Should see "HTTP Actions" section in terminal output
# If you don't see it → HTTP routes not loaded

# Test with curl:
curl -X OPTIONS https://your-app.convex.site/yourEndpoint -v

# Should return 204 (preflight success) or 405 (method not allowed)
# If 404 → endpoint not deployed
```

**Critical Learning (2025-12-17):**
- HTTP endpoints can silently fail if Convex dev restarts
- Always check terminal output for "HTTP Actions" section
- If endpoints worked before but now 404 → restart Convex dev
- Unlike queries/mutations, HTTP endpoints don't always hot-reload reliably

---

## 🔄 Dev Mode vs Production

### Dev Mode

```bash
npx convex dev
```

**Characteristics:**
- Auto-reloads on file changes
- Uses dev deployment URL
- HTTP endpoints work immediately
- Logs visible in terminal

### Production Deployment

```bash
npx convex deploy
```

**Use for:**
- Deploying to production
- Creating permanent deployments
- Setting up CI/CD

---

## 🏗️ Deployment-typer (KRITISKT!)

### Convex har tre typer av deployments:

| Typ | Syfte | CLI-kommando | URL-exempel |
|-----|-------|--------------|-------------|
| **Production** | Live-miljö | `npx convex deploy` | `sincere-crab-852` |
| **Development** | Lokal utveckling | `npx convex dev` | `successful-basilisk-476` |
| **Preview** | Tillfälliga test-miljöer | `npx convex deploy --preview-create <namn>` | `fast-rooster-334` |

### ⚠️ KRITISK GOTCHA: Preview-deployments

**Problem:** `--preview-create <namn>` skapar ALLTID en NY deployment!

```bash
# VARJE körning skapar en NY preview med slumpmässig URL:
npx convex deploy --preview-create my-feature
# Skapar t.ex. "quirky-possum-51"

npx convex deploy --preview-create my-feature
# Skapar ÄNNU EN: "different-meerkat-634"

npx convex deploy --preview-create my-feature
# Skapar ÄNNU EN: "fast-rooster-334"
```

**Vad som händer:**
1. `<namn>` är bara en **ETIKETT** (label) - inte en referens till befintlig deployment
2. Convex genererar en **SLUMPMÄSSIG URL** (t.ex. `fast-rooster-334`)
3. De kopplas ihop: `Preview: my-feature • fast-rooster-334`
4. Nästa körning skapar en HELT NY deployment med samma etikett

### Rekommendation för lokal utveckling

**ANVÄND ALLTID `npx convex dev`:**
```bash
# Synkar automatiskt med din Development-miljö
# Baserat på CONVEX_DEPLOYMENT i .env.local
npx convex dev
```

**Undvik `--preview-create` om du inte specifikt behöver en isolerad testmiljö!**

### Om Manus eller annan AI skapar "gömda" deployments

**Problem:** AI-agenter (som Manus) kan köra `--preview-create` i bakgrunden, vilket skapar preview-deployments som du inte ser.

**Lösning:**
1. Gå till Convex Dashboard
2. Kontrollera alla deployments under ditt projekt
3. Se vilka previews som finns och vilka som används
4. Ta bort onödiga previews

### Korrekt konfiguration för Development

**convex.json:**
```json
{
  "deployment": "successful-basilisk-476"
}
```

**.env.local:**
```env
CONVEX_URL=https://successful-basilisk-476.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://successful-basilisk-476.convex.cloud
CONVEX_SITE_URL=https://successful-basilisk-476.convex.site
CONVEX_DEPLOYMENT=dev:successful-basilisk-476
```

**OBS:** `CONVEX_DEPLOYMENT` variabeln måste börja med `dev:` för Development-deployments.

---

## 📊 Debugging Tips

### 1. Check if HTTP endpoint exists

```bash
curl -v https://your-app.convex.site/yourEndpoint
```

**Responses:**
- `404` → Endpoint doesn't exist or wrong URL
- `500` → Endpoint exists but has error (check logs)
- `200` → Success!

### 2. Check Convex dev output

Look for:
```
✔ Convex functions ready!
```

If you DON'T see HTTP endpoints listed, they're not loaded.

### 3. Use browser DevTools

**Network Tab:**
- Check request URL (must be `.convex.site`)
- Check request method
- Check CORS headers in response

**Console:**
- Look for CORS errors
- Check error messages

### 4. Test with simple HTML page

```html
<!DOCTYPE html>
<html>
<body>
  <button onclick="test()">Test Endpoint</button>
  <div id="result"></div>

  <script>
    async function test() {
      try {
        const res = await fetch('https://your-app.convex.site/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true })
        });
        const data = await res.json();
        document.getElementById('result').textContent = JSON.stringify(data);
      } catch (err) {
        document.getElementById('result').textContent = 'Error: ' + err.message;
      }
    }
  </script>
</body>
</html>
```

---

## 🎓 Best Practices

### 1. Environment Variables

**.env.local:**
```bash
NEXT_PUBLIC_CONVEX_URL=https://your-app.convex.cloud
CONVEX_DEPLOYMENT=dev:your-app
```

**Usage:**
```typescript
// For queries/mutations (React)
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

// For HTTP endpoints (JavaScript)
const CONVEX_SITE = process.env.NEXT_PUBLIC_CONVEX_URL.replace('.cloud', '.site');
```

### 2. Error Handling

```typescript
try {
  const result = await ctx.runMutation(api.items.create, data);
  return new Response(JSON.stringify({ success: true, result }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
} catch (error: any) {
  console.error("Error:", error); // Logs to Convex dashboard
  return new Response(
    JSON.stringify({
      error: error.message || "Unknown error",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }),
    {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}
```

### 3. Type Safety

```typescript
// Define args schema
export const create = mutation({
  args: {
    name: v.string(),
    age: v.number(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // args is fully typed!
    const { name, age, tags } = args;
  },
});
```

### 4. Indexes for Performance

```typescript
// Bad: Full table scan
const items = await ctx.db.query("items")
  .filter(q => q.eq(q.field("status"), "active"))
  .collect();

// Good: Use index
const items = await ctx.db.query("items")
  .withIndex("by_status", q => q.eq("status", "active"))
  .collect();
```

---

## 📚 Quick Reference

### URLs

| Use Case | URL |
|----------|-----|
| Queries/Mutations | `.convex.cloud` |
| HTTP Endpoints | `.convex.site` |

### File Names

| File | Purpose |
|------|---------|
| `convex/http.ts` | HTTP routes (exact name required) |
| `convex/schema.ts` | Database schema |
| `convex/*.ts` | Queries, mutations, actions |

### Commands

```bash
npx convex dev              # Start dev mode
npx convex deploy           # Deploy to production
npx convex run module:func  # Run a mutation/action manually
npx convex dashboard        # Open Convex dashboard
```

---

## 🔗 Resources

- **Official Docs:** https://docs.convex.dev
- **HTTP Actions:** https://docs.convex.dev/functions/http-actions
- **File Storage:** https://docs.convex.dev/file-storage
- **Schema:** https://docs.convex.dev/database/schemas

---

## 📝 Project-Specific Notes

### BankID-Telefon (2026-01-08)

- **Development Deployment:** `dev:successful-basilisk-476`
- **Query/Mutation URL:** `https://successful-basilisk-476.convex.cloud`
- **HTTP Endpoint URL:** `https://successful-basilisk-476.convex.site`
- **Production Deployment:** `sincere-crab-852`

**Key Learnings:**
- `--preview-create` skapar ALLTID nya deployments med slumpmässig URL
- Preview-namn (t.ex. "helpful-porcupine-420") är bara etiketter
- Använd `npx convex dev` för lokal utveckling, INTE `--preview-create`
- AI-agenter (Manus) kan skapa "gömda" preview-deployments
- Kontrollera ALLTID Convex Dashboard för att se faktiska deployment-URLs

**Onödiga Preview-deployments att ta bort:**
- `quirky-possum-51`
- `different-meerkat-634`
- `fast-rooster-334`

---

### ChangeLog AiLive (2025-12-17)

- **Deployment:** `dev:strong-dove-37`
- **Query/Mutation URL:** `https://strong-dove-37.convex.cloud`
- **HTTP Endpoint URL:** `https://strong-dove-37.convex.site`
- **Key Learnings:**
  - Spent 2+ hours debugging 404s because used `.convex.cloud` for HTTP endpoints
  - React button clicks work perfectly when given clear, step-by-step instructions
  - CORS must be on ALL responses, including errors
  - Path parameters must be manually extracted from URL

---

**Last Updated:** 2026-01-08
**Maintainer:** Claude Code
**Version:** 1.1

**TODO:**
- Add section on scheduled functions
- Add section on authentication
- Add section on webhooks
- Document rate limits and quotas
