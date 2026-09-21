# Tennessee Valley Model Railroaders Website

This repository now contains a rebuilt one-page static website for the Tennessee Valley Model Railroaders.

## What’s included

- `index.html` — responsive homepage with club sections
- `styles.css` — simple styling for hero, events, gallery, contact, and footer
- `main.js` — javascript for functionality

## Admin access

The dashboard at `/admin/` uses Netlify Identity. In the Netlify site dashboard:

1. Enable Identity.
2. Set registration to **Invite only**.
3. Invite club members under Identity > Users.
4. Confirm the `GITHUB_REPOSITORY`, `GITHUB_TOKEN`, and optional `GITHUB_BRANCH` environment variables are configured for the deployed site.

Only authenticated Identity members can open the dashboard or submit content. The serverless submit function verifies the member session independently.


## Contact details

- Email: `tnvalleymodelrailroaders@gmail.com`
- Address: `112 Main Street, Suite 3, Bell Buckle, Tennessee`
- Hours: `Saturdays, 9:00 AM – 4:00 PM`
