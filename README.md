# Collector's Vault

A community-driven diecast collection platform for organizing release sets, tracking personal collections, scanning barcodes, identifying cars from photos, and connecting with other collectors.

## Features

- Set-centric collection tracking by release set and year
- Barcode/UPC scanning and lookup
- AI-assisted photo identification with reference-image matching
- Community forum for updates, hunting logs, variations, trade listings, general chat, and show-and-tell posts
- Collector and Admin role-based access control
- Admin catalog manager for release sets, castings, reference photos, barcodes, and visual-search embeddings

## Stack

- Next.js App Router + React + TypeScript
- Tailwind CSS
- Supabase Auth, PostgreSQL, Storage, and pgvector
- Replicate CLIP image embeddings
- Lucide icons

## Setup

See `docs/BUILD-GUIDE.md`. Never commit `.env.local`.
