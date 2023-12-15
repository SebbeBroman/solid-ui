import fs from "fs"
import path, { basename } from "path"

import { safeParse } from "valibot"

import { registry } from "../registry/registry"
import { registrySchema } from "../registry/schema"

const REGISTRY_PATH = path.join(process.cwd(), "public/registry")

const result = safeParse(registrySchema, registry)
if (!result.success) {
  console.error(result.issues)
  process.exit(1)
}

// #######################################
//    BUILD __registry__/index.tsx.
// #######################################

let index = `
// @ts-nocheck
// This file is autogenerated by scripts/build-registry.ts
// Do not edit this file directly.
import { lazy } from "solid-js"

export const Index: Record<string, any> = {
`
for (const item of result.output) {
  index += `
  "${item.name}": {
    name: "${item.name}",
    type: "${item.type}",
    registryDependencies: ${JSON.stringify(item.registryDependencies)},
    component: lazy(() => import("~/registry/${item.type}/${item.name}")),
    files: [${item.files.map((file) => `"registry/${file}"`)}],
  },`
}
index += `
}
`

fs.writeFileSync(path.join(process.cwd(), "src", "__registry__", "index.tsx"), index)

// #######################################
//    BUILD registry/ui/[name].json
// #######################################

const targetPath = path.join(REGISTRY_PATH, "ui")
if (!fs.existsSync(targetPath)) {
  fs.mkdirSync(targetPath, { recursive: true })
}

for (const item of result.output) {
  if (item.type !== "ui") {
    continue
  }

  const files = item.files?.map((file) => {
    const content = fs
      .readFileSync(path.join(process.cwd(), "src", "registry", file), "utf8")
      .replaceAll("\r\n", "\n")

    return {
      name: basename(file),
      content
    }
  })

  const payload = {
    ...item,
    files
  }

  fs.writeFileSync(
    path.join(targetPath, `${item.name}.json`),
    JSON.stringify(payload, null, 2),
    "utf8"
  )
}

// #######################################
//    BUILD registry/index.json
// #######################################

const uiPayload = result.output.filter((item) => item.type === "ui")
fs.writeFileSync(
  path.join(REGISTRY_PATH, "index.json"),
  JSON.stringify(uiPayload, null, 2),
  "utf-8"
)
