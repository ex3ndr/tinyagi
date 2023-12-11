# TinyAGI

Typescript library for simple interop with different ML systems.

# How to install

```bash
npm install tinyagi
```

or

```bash
yarn add tinyagi
```

# How to use

Currently we only support ollama.ai client. You can use it like this:

```typescript
import { OllamaClient } from "tinyagi";

const client = new OllamaClient();
let generated = await client.generate("mitral:latest", "Hey, how do you do?");
console.log(generated.response);
```

# License

MIT
