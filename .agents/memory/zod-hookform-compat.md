---
name: Zod v4 + react-hook-form compatibility
description: zodResolver from @hookform/resolvers expects zod v3 type signatures — use "zod" not "zod/v4"
---

## Rule
In frontend form files that use `zodResolver` from `@hookform/resolvers/zod`, always import `z` from `"zod"` (v3-compatible), NOT from `"zod/v4"`.

```typescript
// CORRECT
import { z } from "zod";

// WRONG — causes TS2345 type mismatch with zodResolver
import { z } from "zod/v4";
```

**Why:** The `zod/v4` import path exports the new v4 API which has different internal type signatures (`_type`, `_parse`, `_getType`, etc. are missing or renamed). The `@hookform/resolvers/zod` package expects the older v3 `ZodType` interface. The workspace's catalog `zod` package supports both paths, but the v3-compatible path must be used for form validation.

**How to apply:** Any file that does `zodResolver(schema)` must import z from `"zod"`.
