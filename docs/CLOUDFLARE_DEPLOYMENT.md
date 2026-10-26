# Cloudflare deployment plan

No Cloudflare project has been created and no deployment has been made.

The source uses TanStack Start SSR and server entry code, so Pages static hosting is not assumed. Before preview deployment, verify the supported Cloudflare adapter and output target against current official Cloudflare and TanStack documentation. Prefer a free Workers preview linked to the GitHub feature branch; keep production deployment and custom-domain changes out of scope until separately authorized.

## To record after an authorized preview setup

- Cloudflare project name: not created
- GitHub repo and branch: `michael-ai-risk/ai-unconventional-minds-community`, `feat/community-migration-and-mvp`
- Build/install/output settings: pending compatibility review
- Environment variable names: none required for informational MVP; backend secrets must be added in Cloudflare settings, never Git
- Preview URL and deployment result: not deployed
