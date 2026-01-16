# Deploio Guides

Official guides for Deploio, a container-based infrastructure platform by [Nine](https://nine.ch) and [Renuo AG](https://www.renuo.ch).

## Development

```bash
# Install dependencies
npm install

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
