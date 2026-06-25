import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    "@context": "https://www.w3.org/ns/json-ld#context",
    "@vocab": "https://erc8004.io/schema/v1#",
    "schema": "https://schema.org/",
    "Agent": "schema:SoftwareApplication",
    "name": "schema:name",
    "description": "schema:description",
    "image": "schema:image",
    "version": "schema:version",
    "project": "schema:isPartOf",
    "github": "schema:codeRepository",
    "category": "schema:applicationCategory",
    "subcategory": "schema:applicationSubCategory",
    "tags": "schema:keywords",
    "capabilities": { "@id": "capabilities", "@container": "@set" },
    "services": { "@id": "services", "@container": "@set" },
    "registrations": { "@id": "registrations", "@container": "@set" },
    "supportedTrust": { "@id": "supportedTrust", "@container": "@set" },
    "supportedChains": { "@id": "supportedChains", "@container": "@set" },
  }, {
    headers: {
      'Content-Type': 'application/ld+json',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    }
  })
}
