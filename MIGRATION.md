# GitHub Pages migration

## Verified preflight

- The live organization site is `https://7-pata.github.io/`. Pages reports a branch deployment from `main` at the repository root, HTTPS enforcement on, and no custom domain.
- Public lookups for the proposed `7pata` namespace and Pages URL returned 404. GitHub does not expose reserved or unavailable names reliably through public lookups. Confirm availability in the organization settings before proceeding.
- The connected account has repository admin and push permissions. Its organization membership query did not confirm ownership. Repository admin access does not confer permission to rename an organization. An organization owner must verify their role in the organization’s People settings.
- The full Git history was backed up before V2 at commit `49b481ff055e705e5644dfe9cb5567d3373d0700`. Keep the `backup/pre-v2` branch and create a fresh local backup at migration time with `git clone --mirror https://github.com/7-pata/7-pata.github.io.git`, followed inside the mirror by `git bundle create ../7-pata-before-rename.bundle --all` and `git bundle verify ../7-pata-before-rename.bundle`. Git history excludes Pages settings and external analytics data, so record those separately.

## After explicit approval and owner verification

1. Record current repo and Pages settings. In the organization’s settings, use GitHub’s rename workflow to check and claim `7pata`. Be prepared to stop if GitHub marks the name unavailable.
2. In the renamed organization, rename the repository to exactly `7pata.github.io`. In its Pages settings, confirm `main`, `/(root)`, and HTTPS enforcement. Check the workflow result and certificate before announcing the new address.
3. In that repository, search for `7-pata.github.io` and `7-pata/7-pata.github.io`. Update the canonical homepage, the Open Graph URLs in `index.html` and `book.html`, `config.js`’s `siteUrl`, `robots.txt`, `sitemap.xml`, setup docs, and any absolute PDF or image URLs that moved. Keep book IDs stable. Update external analytics stream URL, allowed origins and exports if configured.
4. Verify `https://7pata.github.io/`, all three `book.html?id=…` routes, their reader states, relative cover assets, social preview, and every PDF actually present. Check HTTPS on every important route. Retest copying the Rocket number and sharing book links.
5. Treat the old Pages address as potentially unavailable. Git repository redirects and Pages redirects are different. Establish a redirect at the old address only if the old namespace can lawfully be retained and GitHub supports that arrangement. Otherwise update external links and notify visitors before the change.
6. If Pages does not recover, restore the prior names and settings only if the namespaces remain available and the organization owner authorizes that rollback. The verified Git backup preserves source and history.

[GitHub organization rename documentation](https://docs.github.com/en/organizations/managing-organization-settings/renaming-an-organization)
