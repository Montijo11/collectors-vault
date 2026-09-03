# Collector's Vault — Setup Guide

## 1. Install dependencies

```bash
npm install
```

## 2. Create environment variables

Copy `.env.example` to `.env.local`, then supply your own Supabase and Replicate values. Never upload `.env.local` to GitHub.

## 3. Supabase database

Create a Supabase project, then run these migrations in SQL Editor, in order:

```text
supabase/migrations/001_base_schema.sql
supabase/migrations/002_set_catalog.sql
supabase/migrations/003_add_silver_series.sql
supabase/migrations/004_photo_identification.sql
supabase/migrations/005_casting_photos_bucket.sql
```

## 4. Start locally

```bash
npm run dev
```

Open `http://localhost:3000`, sign up, then in Supabase Table Editor change your row in `profiles` from role `collector` to `admin`.

## Notes

- Barcode scanning matches a package UPC against `castings.barcode_upc`.
- Photo identification needs a reference photo and generated embedding for each casting.
- The admin Catalog Manager is where you add/edit release sets, castings, reference photos, and verified barcodes.
