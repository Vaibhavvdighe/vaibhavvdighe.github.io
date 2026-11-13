# Vaibhav Dighe — portfolio

React portfolio for analytics, strategy, and software projects.

## Local development

```sh
npm ci
npm run dev
```

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and publishes the site on each push to `main`. Set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. The published address is `https://vaibhavvdighe.github.io/vaibhavdighe/`.

The Pages build uses `/vaibhavdighe/` as its base path. The normal `npm run build` command keeps `/` for hosting at a domain root.
