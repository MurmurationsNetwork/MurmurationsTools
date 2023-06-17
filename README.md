# Murmurations Tools

> This project is licensed under the terms of the GNU General Public License v3.0

## Development

```sh
# Install dependencies
npm install

# Install the hooks for husky
npm run prepare

# Don't forget to set your environment variables in the .env file!
npm run dev
```

Open up <http://localhost:3000> and you should be ready to go!

## Try it out

<https://test-tools.murmurations.network>

## Vercel test preview deployment

After merging to main and pulling in the changes locally:

```sh
git checkout main
git rebase test
git checkout test
git merge main
git push
```
