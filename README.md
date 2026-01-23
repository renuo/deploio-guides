# Deploio Guides

Official guides for Deploio, a container-based infrastructure platform by [Nine](https://nine.ch) and [Renuo AG](https://www.renuo.ch).

## Development

### Leading Principles on Writing

* Heroku is the giant on whose shoulders we stand.
  For example we support Heroku Buildpacks.
  If in doubt, orient yourself towards https://devcenter.heroku.com/articles.
  (fly.io is cool as well, but way younger)
* This is the **user guide** for Deploio.
  It's about use cases. **It should read like a story**.
  It's not a technical reference but a suggestion.
  The menu is omakase. So we assume sane defaults.
  For detail configuration and options you should link to the technical reference at Nine: https://docs.nine.ch/. 
* `nctl` is canonical for the user guide.
  We should not mention the Cockpit GUI if not absolutely needed.
  Everything should be done with `nctl` because it's is simpler, more stable and can be automated.
* Deploio should bring your **code** to **live** as easily as possible.
  Much documentation is an indication that there are issues with Deploio.
  Don't accept discomfort or quirks.
  Address them directly in the [Deploio Community Slack](https://deploiocommunity.slack.com/archives/C05LUUQ3UPN).
  Beware: Some usability issues will not be fixable by Nine because they leak into the "heroku style" from Kubernetes.
  We collect them in codified form in the [deploio-cli](https://github.com/renuo/deploio-cli).

### Local Dev Setup

```bash
# Setup
bin/setup

# Start development server
npm run docs:dev

# Build for production
npm run docs:build

# Preview production build
npm run docs:preview

# Check links
npm run check-links
```

## Project Structure

```
docs/
├── introduction/       # About Deploio and how it works
├── user-guide/        # Platform-agnostic guides
├── ruby/              # Ruby on Rails guides
├── php/               # PHP/Symfony guides
├── python/            # Python guides
├── go/                # Go guides
├── nodejs/            # Node.js guides
├── docker/            # Docker guides
└── static-pages/      # Static site guides
```

## Built With

- [VitePress](https://vitepress.dev/) - Static site generator
- [vitepress-plugin-tabs](https://github.com/red-gate/vitepress-plugin-tabs) - Tabbed content
- [vitepress-plugin-mermaid](https://github.com/emersonbottero/vitepress-plugin-mermaid) - Diagrams
- [lychee](https://github.com/lycheeverse/lychee) - Link validation
