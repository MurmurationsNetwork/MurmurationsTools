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

## Enabling IPFS

If you want to enable the IPFS functionality within our application. This can be done by adjusting a configuration in the `app/utils/setting.js` file:

1. Modify the IPFS setting as the following.

    ```javascript
    export const settings = {
        ipfsEnabled: true
    };
    ```

2. Save and Restart/Redeploy

Note: To disable IPFS, set ipfsEnabled back to false and restart/redeploy the application.

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
