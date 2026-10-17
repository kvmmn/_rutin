# Rūtin — روتین

Personal meal planning, grocery shopping, weight logging, and project expense tracking.

**Frontend:** Vercel  
**Source:** GitHub (`main`)  
**Data destination:** existing private Google Sheets (integration pending)

## Status

Repository initialized for Vercel. The complete application source and authenticated Google Sheets API still need to be added **before production use**.

## Deploy

1. Add the Rūtin frontend into the repository (an `index.html` at the root is sufficient for a plain static build).
2. Import `kvmmn/_rutin` into Vercel.
3. Set Framework Preset to **Other**, Root Directory to `./`, leave Build Command blank for static HTML.
4. Keep the app private / protected until authentication and Sheets API are implemented and tested.

## Architecture

- Frontend: Vercel hosted responsive RTL app.
- API: Vercel Functions with authentication (not yet configured).
- Storage: Google Sheets for weights, notes, shopping, receipts, expense ledger.
- Receipt photos: a protected object store or private Google Drive folder, never committed to Git.

**Security:** Never commit service-account JSON, Google tokens, personal receipt photos, passwords, or `.env` files.

**Deployment is not a substitute for securing the API.** A public repository can contain app source but never private data or credentials.
